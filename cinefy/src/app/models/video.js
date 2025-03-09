import mongoose from "mongoose";

const VideoSchema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        link: { type: String, required: true },
    },
    { timestamps: true }
);

export default mongoose.models.Video || mongoose.model("Video", VideoSchema);
