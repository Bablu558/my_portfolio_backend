import mongoose from "mongoose";

const blogSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Please enter blog title"],
    },
        slug: {
  type: String,
  unique: true,
  required: true,
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

  comments: [
  {
    name: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
      default: null,
    },
    hash:String,
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
],
  
viewsMeta: [
  {
    hash: String,
    viewedAt: Date,
  },
],


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
    hash: String,
    likedAt: Date,
  },
],


  },
  { timestamps: true }
);

export const Blog = mongoose.model("Blog", blogSchema);