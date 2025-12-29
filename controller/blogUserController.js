
import { BlogUser } from "../models/blogUserSchema.js";
import { generateBlogUserToken } from "../utils/blogUserJwtToken.js";
import { catchAsyncErrors } from "../middleware/catchAsyncErrors.js";
import ErrorHandler from "../middleware/error.js";
import jwt from "jsonwebtoken";
import { sendEmail } from "../utils/sendEmail.js";
import bcrypt from "bcrypt";
import { unverifiedUsers } from "../temp/unverifiedUsers.js";
import crypto from "crypto";

import { sendResetPasswordEmail } from "../utils/sendResetPasswordEmail.js";

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

    // Double-check: user already exists
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


// reset password
export const forgotBlogUserPassword = catchAsyncErrors(async (req, res, next) => {
  const { email } = req.body;

  if (!email) {
    return next(new ErrorHandler("Please enter your email", 400));
  }

  const user = await BlogUser.findOne({ email: email.toLowerCase() });

  if (!user) {
    return next(new ErrorHandler("User not found with this email", 404));
  }

  // Generate reset token
  const resetToken = crypto.randomBytes(32).toString("hex");

  user.resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  user.resetPasswordExpire = Date.now() + 15 * 60 * 1000; // 15 min

  await user.save({ validateBeforeSave: false });

  const resetUrl = `${process.env.FRONTEND_URL}/blog-user/reset-password/${resetToken}`;

await sendResetPasswordEmail({
  email: user.email,
  name: user.name,
  resetUrl,               // SAME NAME AS UTIL
  expiresIn: "15 minutes",
});
console.log("DEBUG resetUrl =>", resetUrl);

  res.status(200).json({
    success: true,
    message: "Password reset link sent to your email",
  });
});



export const resetBlogUserPassword = catchAsyncErrors(async (req, res, next) => {
  const { token } = req.params;
  const { password } = req.body;

const passwordRegex =
  /^(?=.*[0-9])(?=.*[!@#$%^&*(),.?":{}|<>])(?=.*[A-Z]).{8,}$/;

if (!passwordRegex.test(password)) {
  return next(
    new ErrorHandler(
      "Password must be at least 8 characters long, start with an uppercase letter, and contain a number and special character",
      400
    )
  );
}


  const hashedToken = crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");

  const user = await BlogUser.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpire: { $gt: Date.now() },
  }).select("+password");

  if (!user) {
    return next(new ErrorHandler("Reset token is invalid or expired", 400));
  }

  user.password = password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;

  await user.save();

  res.status(200).json({
    success: true,
    message: "Password reset successful. You can now login.",
  });
});


export const validateResetToken = catchAsyncErrors(async (req, res, next) => {
  const { token } = req.params;

  const hashedToken = crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");

  const user = await BlogUser.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!user) {
    return res.status(400).json({
      success: false,
      message: "Reset link is invalid or has already been used",
    });
  }

  res.status(200).json({
    success: true,
    message: "Reset token is valid",
  });
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
