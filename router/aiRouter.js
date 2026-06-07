import express from "express";
import { generateBlogTitle,generateBlogSummary } from "../controller/aiController.js";

const router = express.Router();

router.post("/generate-title", generateBlogTitle);
router.post("/generate-summary", generateBlogSummary);
export default router;