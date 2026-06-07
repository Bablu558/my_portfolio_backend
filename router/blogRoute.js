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
  addCommentToBlog,
  deleteCommentFromBlog,
  addReplyToComment,
  deleteReplyFromComment,
  getLatestBlogs,
  // generateAITitle,
  // generateAISummary,
} from "../controller/blogController.js";
import { isAuthenticated } from "../middleware/auth.js";
import { isBlogUserAuthenticated } from "../middleware/blogAuth.js";

const router = express.Router();

// Public routes
router.get("/getall", getAllBlogs);
router.get("/get/:slug", getBlogBySlug);

// Admin routes
router.post("/create",isAuthenticated,  createBlog);
router.delete("/delete/:id",isAuthenticated, deleteBlog);
router.put("/update/:id",isAuthenticated, updateBlog);



// Blog-user routes (new auth)
router.post("/user/create", isBlogUserAuthenticated, createBlog);
router.put("/user/update/:slug", isBlogUserAuthenticated, updateBlog);
router.delete("/user/delete/:id", isBlogUserAuthenticated, deleteBlog);
router.get("/user/myblogs", isBlogUserAuthenticated, getMyBlogs);
router.post("/like/:id", toggleLikeBlog);
router.get("/get/slug/:slug", getBlogBySlug);
router.get("/user/blog/:id",isBlogUserAuthenticated,getBlogById);
router.post("/comment/:id",isBlogUserAuthenticated, addCommentToBlog);
router.delete("/comment/:blogId/:commentId",isBlogUserAuthenticated, deleteCommentFromBlog)
router.post("/comment/:blogId/:commentId/reply",isBlogUserAuthenticated,addReplyToComment);
router.delete("/comment/:blogId/:commentId/reply/:replyId",isBlogUserAuthenticated,deleteReplyFromComment);
router.get("/latest", getLatestBlogs);

// // 🔥 AI Routes
// router.post("/generate-title", generateAITitle);
// router.post("/generate-summary", generateAISummary);
export default router;
