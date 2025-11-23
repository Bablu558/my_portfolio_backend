import mongoose from "mongoose";

const blogSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Please enter blog title"],
    },
    category: {
      type: String,
      required: [true, "Please enter category"],
    },
thumbnail: {
      public_id: {
        type: String,
        required: true,
      },
      url: {
        type: String,
        required: true,
      },
    },
    shortDescription: {
      type: String,
      required: [true, "Please enter short description"],
    },
    content: {
      type: String,
      required: [true, "Please enter blog content"],
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "BlogUser",
      required: true,
    },
    views: {
      type: Number,
      default: 0,
    },
    likes: {
      type: Number,
      default: 0,
    },
        likedBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "BlogUser",
      },
    ],

  },
  { timestamps: true }
);

export const Blog = mongoose.model("Blog", blogSchema);