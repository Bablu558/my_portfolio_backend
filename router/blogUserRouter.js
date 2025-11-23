// router/blogUserRouter.js
import express from "express";
import {
  registerBlogUser,
  loginBlogUser,
  loadBlogUser,
  logoutBlogUser,
} from "../controller/blogUserController.js";
import { isBlogUserAuthenticated } from "../middleware/blogAuth.js";

const router = express.Router();

router.post("/signup", registerBlogUser);
router.post("/login", loginBlogUser);
router.get("/me", isBlogUserAuthenticated, loadBlogUser);
router.get("/logout", isBlogUserAuthenticated, logoutBlogUser);

export default router;
