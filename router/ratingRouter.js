import express from "express";
import { addRating, getAverageRating } from "../controller/ratingController.js";

const router = express.Router();

router.post("/add", addRating);
router.get("/average", getAverageRating);

export default router;
