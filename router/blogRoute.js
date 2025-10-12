import express from "express";
import {
  createBlog,
  getAllBlogs,
  getBlogById,
  deleteBlog,
  updateBlog,
} from "../controller/blogController.js";
import { isAuthenticated } from "../middleware/auth.js";

const router = express.Router();

// Public routes
router.get("/getall",isAuthenticated, getAllBlogs);
router.get("/get/:id",isAuthenticated, getBlogById);

// Admin routes
router.post("/create",isAuthenticated,  createBlog);
router.delete("/delete/:id",isAuthenticated, deleteBlog);
router.put("/update/:id",isAuthenticated, updateBlog);

export default router;
