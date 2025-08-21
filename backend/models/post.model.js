import mongoose from "mongoose";
const postSchema = new mongoose.Schema(
  {
    caption: { type: String, default: "" },
    image: { type: String },
    video: { type: String },
    mediaType: { type: String, enum: ["image", "video"], default: "image" },
    duration: { type: Number }, // for video duration in seconds
    isReel: { type: Boolean, default: false },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    comments: [{ type: mongoose.Schema.Types.ObjectId, ref: "Comment" }],
  },
  { timestamps: true }
);
export const Post = mongoose.model("Post", postSchema);
