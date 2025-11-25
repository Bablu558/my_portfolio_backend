// controller/blogUserController.js
import { BlogUser } from "../models/blogUserSchema.js";
import { generateBlogUserToken } from "../utils/blogUserJwtToken.js";
import { catchAsyncErrors } from "../middleware/catchAsyncErrors.js";
import ErrorHandler from "../middleware/error.js";
import jwt from "jsonwebtoken";
import { sendEmail } from "../utils/sendEmail.js";
import bcrypt from "bcrypt";
import { unverifiedUsers } from "../temp/unverifiedUsers.js";


export const registerBlogUser = catchAsyncErrors(async (req, res, next) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return next(new ErrorHandler("All fields are required", 400));
  }

  // lowercase email
  const cleanedEmail = email.trim().toLowerCase();

  // Check already registered
  const existing = await BlogUser.findOne({ email: cleanedEmail });
  if (existing) {
    return next(new ErrorHandler("Email already registered", 400));
  }

  // Hash password here (but DO NOT save)
  const hashedPassword = await bcrypt.hash(password, 10);
// Save temporarily until verified
unverifiedUsers.set(cleanedEmail, {
  name,
  password: hashedPassword,
  time: Date.now(),
});
  // Create temp token with user info
  const vToken = jwt.sign(
    { name, email: cleanedEmail, password: hashedPassword },
    process.env.JWT_VERIFY_SECRET,
    { expiresIn: "10m" }
  );

  const verifyUrl = `${process.env.FRONTEND_URL}/blog-user/verify/${vToken}`;

  await sendEmail({
    email: cleanedEmail,
    subject: "Verify your TechBlog account",
    name,
    message: `Verify your email: ${verifyUrl}`,
    url: verifyUrl,
  });
console.log("Verification Email URL:", verifyUrl);

  res.status(200).json({
    success: true,
    message:
      "Verification email sent. Please check your inbox to verify your account.",
  });
});



export const verifyBlogUser = catchAsyncErrors(async (req, res, next) => {
  const { token } = req.params;
  if (!token) return next(new ErrorHandler("Invalid or missing token", 400));

  try {
    const decoded = jwt.verify(token, process.env.JWT_VERIFY_SECRET);

    // Double-check: user already exists?
    const existing = await BlogUser.findOne({ email: decoded.email });
    if (existing) {
      return next(new ErrorHandler("User already exists", 400));
    }

    // Save user now
    await BlogUser.create({
      name: decoded.name,
      email: decoded.email,
      password: decoded.password,
      isVerified: true,
    });

    return res
      .status(200)
      .json({ success: true, message: "Email verified successfully. You can now login." });

  } catch (err) {
    console.error(err);
    return next(new ErrorHandler("Verification link expired or invalid", 400));
  }
});





export const loginBlogUser = catchAsyncErrors(async (req, res, next) => {
  const { email, password } = req.body;
  const cleanedEmail = email.trim().toLowerCase();

  if (!cleanedEmail || !password) {
    return next(new ErrorHandler("Please provide email & password", 400));
  }

  // 1. Check if verified user exists
  const user = await BlogUser.findOne({ email: cleanedEmail }).select("+password +isVerified");

  if (!user) {
    // 2. Check if unverified user exists in temp storage
    const temp = unverifiedUsers.get(cleanedEmail);

    if (temp) {
      return next(
        new ErrorHandler(
          "Please verify your email first. We have sent a verification link to your email.",
          401
        )
      );
    }

    // 3. Means this email totally unknown
    return next(new ErrorHandler("Invalid email or password", 401));
  }

  // 4. Now this is verified user
  if (!user.isVerified) {
    return next(
      new ErrorHandler(
        "Please verify your email first. A verification link was sent to your email.",
        401
      )
    );
  }

  // 5. Check password
  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    return next(new ErrorHandler("Invalid email or password", 401));
  }

  // 6. SUCCESS
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
