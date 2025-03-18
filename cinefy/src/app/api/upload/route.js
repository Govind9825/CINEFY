import dbConnect from "@/app/lib/db";
import Content from "../../models/Content";
import { NextResponse } from "next/server";
import { writeFile } from "fs/promises";
import path from "path";
import fs from "fs";
import { google } from "googleapis";
import { Readable } from "stream";

const auth = new google.auth.GoogleAuth({
  credentials: {
    type: process.env.TYPE,
    project_id: process.env.PROJECT_ID,
    private_key_id: process.env.PRIVATE_KEY_ID,
    private_key: process.env.PRIVATE_KEY.replace(/\\n/g, "\n"),
    client_email: process.env.CLIENT_EMAIL,
    client_id: process.env.CLIENT_ID,
    auth_uri: process.env.AUTH_URI,
    token_uri: process.env.TOKEN_URI,
    auth_provider_x509_cert_url: process.env.AUTH_PROVIDER_X509_CERT_URL,
    client_x509_cert_url: process.env.CLIENT_X509_CERT_URL,
    universe_domain: process.env.UNIVERSE_DOMAIN,
  },
  scopes: ["https://www.googleapis.com/auth/drive"],
});

const driveService = google.drive({ version: "v3", auth });

async function uploadFileToDrive(file) {
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const name = file.name || "uploaded_file";
  const type = file.type || "application/octet-stream";

  const response = await driveService.files.create({
    requestBody: { name, mimeType: type },
    media: { mimeType: type, body: Readable.from(buffer) },
    fields: "id",
  });

  if (!response.data.id) {
    throw new Error(`Failed to upload ${name} to Google Drive.`);
  }

  await driveService.permissions.create({
    fileId: response.data.id,
    requestBody: { role: "reader", type: "anyone" },
  });

  return `https://drive.google.com/file/d/${response.data.id}/preview`;
}

export async function GET() {
  try {
    await dbConnect();
    const content = await Content.find();
    return NextResponse.json({ success: true, content });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    await dbConnect();
    const formData = await req.formData();

    const name = formData.get("name");
    const desc = formData.get("desc");
    const genre = formData.get("genre");
    const imageFile = formData.get("thumbnail");
    const premium = formData.get("premium");

    if (!name || !desc || !genre || !imageFile) {
      return NextResponse.json({ success: false, error: "All fields are required!" });
    }

    const validMimeTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!validMimeTypes.includes(imageFile.type)) {
      return NextResponse.json({ success: false, error: "Invalid image format!" });
    }

    const thumbnailsDir = path.join(process.cwd(), "public/thumbnails");
    if (!fs.existsSync(thumbnailsDir)) {
      fs.mkdirSync(thumbnailsDir, { recursive: true });
    }

    const filename = `${Date.now()}-${imageFile.name}`;
    const filePath = path.join(thumbnailsDir, filename);

    const buffer = Buffer.from(await imageFile.arrayBuffer());
    await writeFile(filePath, buffer);

    const newContent = new Content({
      name,
      desc,
      genre,
      thumbnail: `/thumbnails/${filename}`,
      premium:premium
    });
    await newContent.save();

    return NextResponse.json({ success: true, data: newContent });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message });
  }
}

export async function DELETE(req) {
  try {
    await dbConnect();
    const { _id } = await req.json();
    if (!_id) throw new Error("Need an Id to delete Content");

    const content = await Content.findById(_id);
    if (!content) return NextResponse.json({ success: false, error: "Content not found" });

    const fileIds = content.seasons.flatMap(season => season.episodes.map(ep => ep.link.match(/d\/(.*)\/preview/)?.[1])).filter(Boolean);
    for (const fileId of fileIds) {
      await driveService.files.delete({ fileId }).catch(() => {});
    }

    await Content.findByIdAndDelete(_id);
    return NextResponse.json({ success: true, message: "Content deleted successfully" });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message });
  }
}

export async function PUT(req) {
  try {
    await dbConnect();
    const formData = await req.formData();

    const _id = formData.get("_id");
    const seasonNumber = parseInt(formData.get("seasonNumber"));
    const episodeName = formData.get("episodeName");
    const episodeDesc = formData.get("episodeDesc");
    const episodeVideo = formData.get("episodeVideo");

    if (!_id || !seasonNumber || !episodeName || !episodeDesc || !episodeVideo) {
      throw new Error("All fields are required");
    }

    const link = await uploadFileToDrive(episodeVideo);

    const content = await Content.findById(_id);
    if (!content) throw new Error("Content not found");

    const seasonIndex = content.seasons.findIndex(s => s.seasonNumber === seasonNumber);
    if (seasonIndex !== -1) {
      content.seasons[seasonIndex].episodes.push({ name: episodeName, desc: episodeDesc, link });
    } else {
      content.seasons.push({ seasonNumber, episodes: [{ name: episodeName, desc: episodeDesc, link }] });
    }

    await content.save();
    return NextResponse.json({ success: true, message: "Episode added successfully" });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message });
  }
}
