import { Rating } from "../models/ratingSchema.js";

// POST: Save new rating
export const addRating = async (req, res) => {
  try {
    const { stars, name, message } = req.body;

    if (!stars || stars < 1 || stars > 5) {
      return res.status(400).json({ message: "Invalid rating value!" });
    }

    // ⭐ SAVE rating (name/message optional)
    const rating = await Rating.create({
      stars,
      name: name || "",
      message: message || ""
    });

    // ⭐ EMAIL message based on condition
    const emailText = name
      ? `
A new rating has been submitted on your portfolio.

⭐ Rating: ${stars} stars
👤 Name: ${name}
💬 Message: ${message}
      `
      : `
Someone just rated your portfolio ⭐${stars} stars.
(No feedback written)
      `;

    try {
      await sendEmail({
        email: process.env.SMTP_MAIL,
        subject: `⭐ New Rating Received (${stars} stars)`,
        message: emailText,
      });

      console.log("✅ Rating email sent successfully!");
    } catch (emailError) {
      console.error("❌ Failed to send rating email:", emailError);
    }

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
