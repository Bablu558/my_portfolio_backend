import express from "express";
import {
  registerBlogUser,
  loginBlogUser,
   verifyBlogUser,
  loadBlogUser,
  logoutBlogUser,
  forgotBlogUserPassword,
resetBlogUserPassword,
validateResetToken,
updateBlogUserPassword,
deleteBlogUserAccount,
} from "../controller/blogUserController.js";
import { isBlogUserAuthenticated } from "../middleware/blogAuth.js";

const router = express.Router();

router.post("/signup", registerBlogUser);
router.post("/login", loginBlogUser);
router.get("/verify/:token", verifyBlogUser);
router.get("/me", isBlogUserAuthenticated, loadBlogUser);
router.get("/logout", isBlogUserAuthenticated, logoutBlogUser);
router.post("/forgot-password", forgotBlogUserPassword);
router.post("/reset-password/:token", resetBlogUserPassword);
router.get("/reset-password/validate/:token", validateResetToken);
// Isse pehle isAuthenticated wala middleware zaroori hai
router.put("/update-password", isBlogUserAuthenticated, updateBlogUserPassword);
router.delete("/delete-account", isBlogUserAuthenticated, deleteBlogUserAccount);
export default router;
