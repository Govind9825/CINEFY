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

async function uploadFileToDrive(file, driveService) {
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
    return NextResponse.json(
      {
        success: false,
        message: "Error fetching content",
        error: error.message,
      },
      { status: 500 }
    );
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

    if (!name || !desc || !genre || !imageFile) {
      return NextResponse.json({
        success: false,
        error: "All fields are required!",
      });
    }

    const validMimeTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!validMimeTypes.includes(imageFile.type)) {
      return NextResponse.json({
        success: false,
        error: "Invalid image format!",
      });
    }

    const thumbnailsDir = path.join(process.cwd(), "public/thumbnails");
    if (!fs.existsSync(thumbnailsDir)) {
      fs.mkdirSync(thumbnailsDir, { recursive: true });
    }

    const filename = `${Date.now()}-${imageFile.name}`;
    const filePath = path.join(thumbnailsDir, filename);

    const buffer = Buffer.from(await imageFile.arrayBuffer());
    await writeFile(filePath, buffer);

    const thumbnailPath = `/thumbnails/${filename}`;

    const newContent = new Content({
      name,
      desc,
      genre,
      thumbnail: thumbnailPath,
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
    const data = await req.json();
    const _id = data._id;

    if (!_id) {
      throw new Error("Need an Id to delete Content");
    }

    const deletedContent = await Content.findByIdAndDelete(_id);
    if (!deletedContent) {
      return NextResponse.json({ success: false, error: "Content not found" });
    }

    return NextResponse.json({ success: true, data: deletedContent });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message });
  }
}
export async function PUT(req) {
  try {
    await dbConnect();

    const formData = await req.formData();

    const _id = formData.get("_id");
    const seasonNumber = formData.get("seasonNumber");

    let episodes = [];
    let index = 0;

    while (formData.has(`episodes[${index}][name]`)) {
      const name = formData.get(`episodes[${index}][name]`);
      const desc = formData.get(`episodes[${index}][desc]`);
      const video = formData.get(`episodes[${index}][file]`);


      if (!video) {
        throw new Error(`Missing video file for episode: ${name}`);
      }

      const driveService = google.drive({ version: "v3", auth });
      const link = await uploadFileToDrive(video, driveService);

      episodes.push({ name, desc, link });

      index++;
    }

    const content = await Content.findById(_id);
    if (!content) throw new Error("Content not found");

    content.seasons.push({
      seasonNumber: parseInt(seasonNumber),
      episodes,
    });

    await content.save();

    return new Response(JSON.stringify({ message: "Updated successfully" }), { status: 200 });
  } 
  catch (error) {
    console.error("Error:", error.message);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}
