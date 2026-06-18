import mongoose from "mongoose";

const blogSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    tags: {
      type: [String],
      default: [],
    },
    // The rich text content from TipTap editor, stored as a JSON object.
    // We use "Mixed" because TipTap's JSON is a nested structure
    // that doesn't have a fixed shape — Mixed lets MongoDB store any object.
    content: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: ["draft", "published"],
      default: "draft",
    },
    coverImage: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);

const blogModel = mongoose.model("Blog", blogSchema);
export default blogModel;
