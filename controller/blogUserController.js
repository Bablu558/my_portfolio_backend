// controller/blogUserController.js
import { BlogUser } from "../models/blogUserSchema.js";
import { generateBlogUserToken } from "../utils/blogUserJwtToken.js";
import { catchAsyncErrors } from "../middleware/catchAsyncErrors.js";
import ErrorHandler from "../middleware/error.js";

export const registerBlogUser = catchAsyncErrors(async (req, res, next) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return next(new ErrorHandler("All fields are required", 400));
  }

  const existing = await BlogUser.findOne({ email });
  if (existing) {
    return next(new ErrorHandler("Email already registered", 400));
  }

  const user = await BlogUser.create({ name, email, password });
  generateBlogUserToken(user, "Account created successfully", 201, res);
});

export const loginBlogUser = catchAsyncErrors(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new ErrorHandler("Please provide email & password", 400));
  }

  const user = await BlogUser.findOne({ email }).select("+password");
  if (!user) {
    return next(new ErrorHandler("Invalid email or password", 401));
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    return next(new ErrorHandler("Invalid email or password", 401));
  }

  generateBlogUserToken(user, "Logged in successfully", 200, res);
});

export const loadBlogUser = catchAsyncErrors(async (req, res, next) => {
  // req.blogUser blogAuth middleware se aayega
  res.status(200).json({
    success: true,
    user: req.blogUser,
  });
});

export const logoutBlogUser = catchAsyncErrors(async (req, res, next) => {
  res
    .status(200)
    .cookie("blogToken", null, {
      expires: new Date(Date.now()),
      httpOnly: true,
      sameSite: "None",
      secure: true,
    })
    .json({
      success: true,
      message: "Logged out successfully",
    });
});
