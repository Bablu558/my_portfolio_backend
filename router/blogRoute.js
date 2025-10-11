import express from "express";
import {
  createBlog,
  getAllBlogs,
  getBlogById,
  deleteBlog,
  updateBlog,
} from "../controller/blogController.js";
// import { isAuthenticated } from "../middleware/auth.js";

const router = express.Router();

// Public routes
router.get("/getall", getAllBlogs);
router.get("/get/:id", getBlogById);

// Admin routes
router.post("/create",  createBlog);
router.delete("/delete/:id",deleteBlog);
router.put("/update/:id",updateBlog);

export default router;
