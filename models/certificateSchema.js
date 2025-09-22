import mongoose from "mongoose";

const certificateSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  certificateImage: {
    public_id: {
      type: String,
      required: true,
    },
    url: {
      type: String,
      required: true,
    },
  },
});

export const Certificate = mongoose.model("Certificate", certificateSchema);
