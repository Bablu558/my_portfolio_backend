import express from "express";
import {
  createBlog,
  getAllBlogs,
  getBlogById,
  deleteBlog,
  updateBlog,
  getMyBlogs,
  toggleLikeBlog,
} from "../controller/blogController.js";
import { isAuthenticated } from "../middleware/auth.js";
import { isBlogUserAuthenticated } from "../middleware/blogAuth.js";
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
export default router;
