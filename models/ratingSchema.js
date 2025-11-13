import mongoose from "mongoose";

const ratingSchema = new mongoose.Schema({
  stars: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
  },
  Name:{
    type: String, 
    required: true
  },
  messagee: {
    type: String, 
    required: true 
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export const Rating = mongoose.model("Rating", ratingSchema);
