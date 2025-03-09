import { google } from "googleapis";
import { NextResponse } from "next/server";
import { Readable } from "stream";
import dbConnect from "@/app/lib/db";
import Video from "@/app/models/video";

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

export async function POST(req) {
    try {
        console.log("Server-side function triggered");

        await dbConnect(); // Connect to MongoDB

        const formData = await req.formData();
        const file = formData.get("file");

        if (!file) {
            return NextResponse.json({ success: false, message: "No file provided." }, { status: 400 });
        }

        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const name = file.name || "uploaded_video";
        const type = file.type || "video/mp4"; // Default MIME type for videos

        const driveService = google.drive({ version: "v3", auth });

        // Check if file already exists in Drive
        const existingFile = await driveService.files.list({
            q: `name='${name}'`,
            fields: "files(id, webViewLink)",
        });

        if (existingFile.data.files.length > 0) {
            const existingId = existingFile.data.files[0].id;
            const existingEmbedLink = `https://drive.google.com/file/d/${existingId}/preview`;
            console.log("File already exists:", existingEmbedLink);

            // Save existing link in MongoDB
            await Video.create({ name, link: existingEmbedLink });

            return NextResponse.json({ success: true, viewLink: existingEmbedLink });
        }

        // Upload the file
        const response = await driveService.files.create({
            requestBody: { name, mimeType: type },
            media: { mimeType: type, body: Readable.from(buffer) },
            fields: "id",
        });

        if (!response.data.id) {
            throw new Error("Failed to upload file to Google Drive.");
        }

        const { id } = response.data;

        // ✅ Set public read permissions so anyone can watch the video
        await driveService.permissions.create({
            fileId: id,
            requestBody: { role: "reader", type: "anyone" },
        });

        // ✅ Convert the Google Drive link to an embeddable link
        const embedLink = `https://drive.google.com/file/d/${id}/preview`;

        console.log("File uploaded successfully:", embedLink);

        // Save video link in MongoDB
        await Video.create({ name, link: embedLink });

        return NextResponse.json({ success: true, viewLink: embedLink });
    } catch (error) {
        console.error("Upload error:", error);
        return NextResponse.json(
            { success: false, message: "Upload failed.", error: error.message },
            { status: 500 }
        );
    }
}
