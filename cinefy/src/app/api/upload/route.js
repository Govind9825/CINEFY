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
  const name = file.name || "uploaded_file";
  const type = file.type || "application/octet-stream";
  const fileSize = file.size;

  // Step 1: Initiate the resumable upload session
  const res = await driveService.files.create(
    {
      requestBody: {
        name: name,
        mimeType: type,
      },
      media: {
        mimeType: type,
        body: Readable.from(Buffer.from(await file.arrayBuffer())), // Stream the file
      },
      supportsAllDrives: true,
      supportsTeamDrives: true,
      uploadType: "resumable", // Enable resumable uploads
    },
    {
      onUploadProgress: (evt) => {
        console.log(`Uploaded ${evt.bytesRead} bytes of ${fileSize}`);
      },
    }
  );

  // Step 2: Get the upload URL from the response
  const uploadUrl = res.config.url;

  // Step 3: Upload the file in chunks
  const chunkSize = 5 * 1024 * 1024; // 5 MB chunks (adjust as needed)
  let offset = 0;

  while (offset < fileSize) {
    const chunk = await file.slice(offset, offset + chunkSize).arrayBuffer();
    const chunkStream = Readable.from(Buffer.from(chunk));

    const response = await driveService.files.update(
      {
        fileId: res.data.id,
        media: {
          mimeType: type,
          body: chunkStream,
        },
        uploadType: "resumable",
        supportsAllDrives: true,
        supportsTeamDrives: true,
      },
      {
        headers: {
          "Content-Length": chunk.byteLength,
          "Content-Range": `bytes ${offset}-${offset + chunk.byteLength - 1}/${fileSize}`,
        },
      }
    );

    offset += chunk.byteLength;
    console.log(`Uploaded ${offset} bytes of ${fileSize}`);
  }

  console.log("File uploaded successfully:", res.data.id);

  // Step 4: Make the file publicly accessible
  await driveService.permissions.create({
    fileId: res.data.id,
    requestBody: { role: "reader", type: "anyone" },
  });

  return `https://drive.google.com/file/d/${res.data.id}/preview`;
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
    const premium = formData.get("premium") === "true";


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
    console.log("Connecting to the database...");
    await dbConnect();
    console.log("Database connected successfully.");

    console.log("Parsing form data...");
    const formData = await req.formData();
    console.log("Form data parsed successfully.");

    const _id = formData.get("_id");
    const seasonNumber = parseInt(formData.get("seasonNumber"));
    const episodeName = formData.get("episodeName");
    const episodeDesc = formData.get("episodeDesc");
    const episodeVideo = formData.get("episodeVideo");

    console.log("Extracted form data:", { _id, seasonNumber, episodeName, episodeDesc, episodeVideo });

    if (!_id || !seasonNumber || !episodeName || !episodeDesc || !episodeVideo) {
      throw new Error("All fields are required");
    }

    console.log("Uploading episode video to drive...");
    const link = await uploadFileToDrive(episodeVideo);
    console.log("Episode video uploaded successfully. Link:", link);

    console.log("Finding content by ID:", _id);
    const content = await Content.findById(_id);
    if (!content) throw new Error("Content not found");
    console.log("Content found:", content);

    const seasonIndex = content.seasons.findIndex(s => s.seasonNumber === seasonNumber);
    console.log("Season index:", seasonIndex);

    if (seasonIndex !== -1) {
      console.log("Adding episode to existing season...");
      content.seasons[seasonIndex].episodes.push({ name: episodeName, desc: episodeDesc, link });
    } else {
      console.log("Creating new season and adding episode...");
      content.seasons.push({ seasonNumber, episodes: [{ name: episodeName, desc: episodeDesc, link }] });
    }

    console.log("Saving updated content...");
    await content.save();
    console.log("Content saved successfully.");

    return NextResponse.json({ success: true, message: "Episode added successfully" });
  } catch (error) {
    console.error("Error occurred:", error);
    return NextResponse.json({ success: false, error: error.message });
  }
}