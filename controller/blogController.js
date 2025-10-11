import { Blog } from "../models/blogSchema.js";
import { v2 as cloudinary } from "cloudinary";


export const createBlog = async (req, res) => {
  try {
    const { title, category, shortDescription, content } = req.body;
    const { thumbnail } = req.files || {};

    if (!title || !category || !shortDescription || !content || !thumbnail) {
      return res
        .status(400)
        .json({ success: false, message: "All fields are required" });
    }

    // Upload to Cloudinary
    const uploadResult = await cloudinary.uploader.upload(thumbnail.tempFilePath, {
      folder: "PORTFOLIO BLOG IMAGES",
    });

    const blog = await Blog.create({
      title,
      category,
      shortDescription,
      content,
      thumbnail: {
        public_id: uploadResult.public_id,
        url: uploadResult.secure_url,
      },
    });

    res.status(201).json({
      success: true,
      message: "Blog created successfully",
      blog,
    });
  } catch (error) {
    console.error("Error creating blog:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// ✅ Get All Blogs
export const getAllBlogs = async (req, res) => {
  try {
    const blogs = await Blog.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, blogs });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

// ✅ Get Single Blog by ID
export const getBlogById = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) {
      return res.status(404).json({ success: false, message: "Blog not found" });
    }
    res.status(200).json({ success: true, blog });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

// ✅ Delete Blog (Admin only)
export const deleteBlog = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) {
      return res.status(404).json({ success: false, message: "Blog not found" });
    }
    await blog.deleteOne();
    res.status(200).json({ success: true, message: "Blog deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};


export const updateBlog = async (req, res) => {
  try {
    const { title, category, shortDescription, content } = req.body;
    const blog = await Blog.findById(req.params.id);

    if (!blog) {
      return res.status(404).json({ success: false, message: "Blog not found" });
    }

    const newData = {
      title: title || blog.title,
      category: category || blog.category,
      shortDescription: shortDescription || blog.shortDescription,
      content: content || blog.content,
      thumbnail: blog.thumbnail,
    };

    // If new image provided
    if (req.files && req.files.thumbnail) {
      const { thumbnail } = req.files;
      // Delete old image
      if (blog.thumbnail?.public_id) {
        await cloudinary.uploader.destroy(blog.thumbnail.public_id);
      }
      // Upload new
      const uploadResult = await cloudinary.uploader.upload(thumbnail.tempFilePath, {
        folder: "PORTFOLIO BLOG IMAGES",
      });
      newData.thumbnail = {
        public_id: uploadResult.public_id,
        url: uploadResult.secure_url,
      };
    }

    const updatedBlog = await Blog.findByIdAndUpdate(req.params.id, newData, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      message: "Blog updated successfully",
      blog: updatedBlog,
    });
  } catch (error) {
    console.error("Error updating blog:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};


