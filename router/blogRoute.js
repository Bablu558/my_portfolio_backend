import express from "express";
import {
  createBlog,
  getAllBlogs,
  getBlogById,
  deleteBlog,
  updateBlog,
  getMyBlogs,
  toggleLikeBlog,
  getBlogBySlug,
} from "../controller/blogController.js";
import { isAuthenticated } from "../middleware/auth.js";
import { isBlogUserAuthenticated } from "../middleware/blogAuth.js";
import { generateTitleAI } from "../controller/aiController.js";
import { generateShortDescAI } from "../controller/aiController.js";
const router = express.Router();

// Public routes
router.get("/getall", getAllBlogs);
router.get("/get/:id", getBlogById);

// Admin routes
router.post("/create",isAuthenticated,  createBlog);
router.delete("/delete/:id",isAuthenticated, deleteBlog);
router.put("/update/:id",isAuthenticated, updateBlog);



// Blog-user routes (new auth)
router.post("/user/create", isBlogUserAuthenticated, createBlog);
router.put("/user/update/:id", isBlogUserAuthenticated, updateBlog);
router.delete("/user/delete/:id", isBlogUserAuthenticated, deleteBlog);
router.get("/user/myblogs", isBlogUserAuthenticated, getMyBlogs);
router.put("/like/:id", toggleLikeBlog);
router.get("/get/slug/:slug", getBlogBySlug);
router.post("/ai/generate-title", generateTitleAI);
router.post("/ai/generate-summary", generateShortDescAI);
export default router;
