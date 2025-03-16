import mongoose from "mongoose";

const EpisodeSchema = new mongoose.Schema(
  {
    name: { type: String, required: true }, // Name of the episode
    desc: { type: String, required: true }, // Description of the episode
    link: { type: String, required: true }, // Link to the episode (e.g., video URL)
  },
  { timestamps: true }
);

const SeasonSchema = new mongoose.Schema(
  {
    seasonNumber: { type: Number, required: true }, // Season number
    episodes: [EpisodeSchema], // Array of episodes in the season
  },
  { timestamps: true }
);

const ContentSchema = new mongoose.Schema(
  {
    name: { type: String, required: true }, // Name of the content
    desc: { type: String, required: true }, // Description of the content
    genre: { type: String, required: true }, // Genre of the content
    thumbnail: { type: String, default: "" }, // Thumbnail image URL
    seasons: [SeasonSchema], // Array of seasons
  },
  { timestamps: true }
);

export default mongoose.models.Content || mongoose.model("Content", ContentSchema);