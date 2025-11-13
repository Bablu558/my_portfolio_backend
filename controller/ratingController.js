import { Rating } from "../models/ratingSchema.js";

// POST: Save new rating
export const addRating = async (req, res) => {
  try {
    const { stars, Name, messagee } = req.body;

    if (!stars || stars < 1 || stars > 5) {
      return res.status(400).json({ message: "Invalid rating value!" });
    }
    if (!Name || !messagee) {
      return res.status(400).json({ message: "Name and message are required!" });
    }

    const rating = await Rating.create({ stars, Name, messagee });
    res.status(201).json({ success: true, rating });
  } catch (error) {
    res.status(500).json({ message: "Error saving rating", error });
  }
};

export const getAverageRating = async (req, res) => {
  try {
    const ratings = await Rating.find();
    if (ratings.length === 0)
      return res.json({ average: 0, count: 0 });

    const total = ratings.reduce((sum, r) => sum + r.stars, 0);
    const average = total / ratings.length;
    res.json({ average: average.toFixed(1), count: ratings.length });
  } catch (error) {
    res.status(500).json({ message: "Error fetching rating", error });
  }
};
