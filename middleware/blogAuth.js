// middleware/blogAuth.js
import jwt from "jsonwebtoken";
import { BlogUser } from "../models/blogUserSchema.js";
import { catchAsyncErrors } from "./catchAsyncErrors.js";
import ErrorHandler from "./error.js";

export const isBlogUserAuthenticated = catchAsyncErrors(
  async (req, res, next) => {
    const { blogToken } = req.cookies;

    if (!blogToken) {
      return next(new ErrorHandler("Please login to continue", 401));
    }

    const decoded = jwt.verify(blogToken, process.env.JWT_SEC_KEY);
    const user = await BlogUser.findById(decoded.id).select("-password");

    if (!user) {
      return next(new ErrorHandler("User no longer exists", 401));
    }

    req.blogUser = user;
    next();
  }
);
