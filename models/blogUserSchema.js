import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const blogUserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
      select: false,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date,
  },
  { timestamps: true }
);

// Hash password before save
blogUserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  
  if (this.password && !this.password.startsWith("$2b$")) {
    this.password = await bcrypt.hash(this.password, 10);
  }

  next();
});

// Compare password
blogUserSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Generate JWT (auth token)
blogUserSchema.methods.generateJsonWebToken = function () {
  return jwt.sign({ id: this._id }, process.env.JWT_SEC_KEY, {
    expiresIn: process.env.JWT_EXPIRES,
  });
};

export const BlogUser = mongoose.model("BlogUser", blogUserSchema);
