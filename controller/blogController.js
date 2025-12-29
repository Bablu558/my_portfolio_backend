import { Blog } from "../models/blogSchema.js";
import { v2 as cloudinary } from "cloudinary";
import slugify from "slugify";
import crypto from "crypto";
import { generateViewerHash } from "../utils/viewHash.js";

// Common helper to get current user id (admin or blog-user)
const getCurrentUserId = (req) => {
  if (req.blogUser) return req.blogUser._id; 
  if (req.user) return req.user._id; // admin user (old)
  return null;
};

export const createBlog = async (req, res) => {
  try {
    const { title, category, shortDescription, content } = req.body;
    const { thumbnail } = req.files || {};
const rawSlug = slugify(title, { lower: true, strict: true });
const uniqueSlug = `${rawSlug}-${crypto.randomBytes(4).toString("hex")}`;

    const userId = getCurrentUserId(req);

    if (!userId) {
      return res
        .status(401)
        .json({ success: false, message: "Not authenticated" });
    }

    if (!title || !category || !shortDescription || !content || !thumbnail) {
      return res
        .status(400)
        .json({ success: false, message: "All fields are required" });
    }

    // Upload to Cloudinary
    const uploadResult = await cloudinary.uploader.upload(
      thumbnail.tempFilePath,
      {
        folder: "PORTFOLIO BLOG IMAGES",
      }
    );

    const blog = await Blog.create({
      title,
      category,
      shortDescription,
      content, 
      slug: uniqueSlug,
      thumbnail: {
        public_id: uploadResult.public_id,
        url: uploadResult.secure_url,
      },
      author: userId,
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
  message: error.message || "Server error",
});

  }
};

//  Get All Blogs
export const getAllBlogs = async (req, res) => {
  try {
    const blogs = await Blog.find()
      .sort({ createdAt: -1 })
      .populate("author", "name email");

    res.status(200).json({ success: true,user: req.blogUser, blogs });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};

// Get Single Blog by ID + increment views
export const getBlogById = async (req, res) => {
  try {
    const blog = await Blog.findByIdAndUpdate(
      req.params.id,
      { $inc: { views: 1 } },
      { new: true,
      timestamps: false,}
    ).populate("author", "name email");

    if (!blog) {
      return res
        .status(404)
        .json({ success: false, message: "Blog not found" });
    }

    res.status(200).json({ success: true, blog });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};
export const getBlogBySlug = async (req, res) => {
  try {
    // Read blog
    const blog = await Blog.findOne({ slug: req.params.slug })
      .populate("author", "name email");

    if (!blog) {
      return res
        .status(404)
        .json({ success: false, message: "Blog not found" });
    }

    //  Viewer hash
    const viewerHash = generateViewerHash(req);
    const now = new Date();
    const ONE_HOUR = 60 * 60 * 1000;

    const alreadyViewed = blog.viewsMeta.some(
      (v) =>
        v.hash === viewerHash &&
        now - new Date(v.viewedAt) < ONE_HOUR
    );

    //  Increment only once per hour
    if (!alreadyViewed) {
      await Blog.updateOne(
        { _id: blog._id },
        {
          $inc: { views: 1 },
          $push: {
            viewsMeta: {
              hash: viewerHash,
              viewedAt: now,
            },
          },
        },
        { timestamps: false }
      );
    }

    //  Respond
   // ADD canDelete flag to each comment
const blogWithPermission = {
  ...blog.toObject(),
  comments: blog.comments.map((c) => ({
    ...c.toObject(),
    canDelete: c.hash === viewerHash,
  })),
};

// Respond
res.status(200).json({
  success: true,
  blog: blogWithPermission,
});


  } catch (error) {
    console.error("getBlogBySlug error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};



//  Delete Blog (Admin or Owner)
export const deleteBlog = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);

    if (!blog) {
      return res
        .status(404)
        .json({ success: false, message: "Blog not found" });
    }

    const userId = getCurrentUserId(req);

    if (!userId) {
      return res
        .status(401)
        .json({ success: false, message: "Not authenticated" });
    }

    // If it's blog user, only owner can delete
    if (req.blogUser && blog.author.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: "You are not allowed to delete this blog",
      });
    }

    // Admin (req.user) can delete any blog

    await blog.deleteOne();
    res
      .status(200)
      .json({ success: true, message: "Blog deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};

export const updateBlog = async (req, res) => {
  try {
    const { title, category, shortDescription, content } = req.body;
    const blog = await Blog.findById(req.params.id);

    if (!blog) {
      return res
        .status(404)
        .json({ success: false, message: "Blog not found" });
    }

    const userId = getCurrentUserId(req);

    if (!userId) {
      return res
        .status(401)
        .json({ success: false, message: "Not authenticated" });
    }

    // Blog user can only edit own blog
    if (req.blogUser && blog.author.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: "You are not allowed to edit this blog",
      });
    }
 
   let newSlug = blog.slug;
   if(title && title !== blog.title){
    const rawSlug = slugify(title,{lower:true,strict:true});
     newSlug = `${rawSlug}-${crypto.randomBytes(4).toString("hex")}`;
   }
    const newData = {
      title: title || blog.title,
      category: category || blog.category,
      shortDescription: shortDescription || blog.shortDescription,
      content: content || blog.content,
      thumbnail: blog.thumbnail,
      slug:newSlug,
    };

    // If new image provided
    if (req.files && req.files.thumbnail) {
      const { thumbnail } = req.files;
      // Delete old image
      if (blog.thumbnail?.public_id) {
        await cloudinary.uploader.destroy(blog.thumbnail.public_id);
      }
      // Upload new
      const uploadResult = await cloudinary.uploader.upload(
        thumbnail.tempFilePath,
        {
          folder: "PORTFOLIO BLOG IMAGES",
        }
      );
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
  message: error.message || "Server error",
});

  }
};

// Get Blogs of logged-in BlogUser
export const getMyBlogs = async (req, res) => {
  try {
    const blogs = await Blog.find({ author: req.blogUser._id })
      .sort({ views: -1, createdAt: -1 })
      .populate("author", "name email");

    res.status(200).json({
      success: true,
      user: req.blogUser,   
      blogs,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};


//  Like / Unlike a blog
export const toggleLikeBlog = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: "Blog not found",
      });
    }

    const viewerHash = generateViewerHash(req);

    const alreadyLiked = blog.likedBy.some(
      (item) => item.hash === viewerHash
    );

    let updateQuery;

    if (alreadyLiked) {
      //  UNLIKE
      updateQuery = {
        $inc: { likes: -1 },
        $pull: {
          likedBy: { hash: viewerHash },
        },
      };
    } else {
      //  LIKE
      updateQuery = {
        $inc: { likes: 1 },
        $push: {
          likedBy: {
            hash: viewerHash,
            likedAt: new Date(),
          },
        },
      };
    }

    
    //  IMPORTANT PART
    const updatedBlog = await Blog.findByIdAndUpdate(
      blog._id,
      updateQuery,
      {
        new: true,
        timestamps: false, //  updatedAt WILL NOT CHANGE
      }
    ).populate("author", "name email");

    res.status(200).json({
      success: true,
      blog: updatedBlog,
    });
  } catch (error) {
    console.error("Like error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// addCommentToBlog
//  Add Comment (Public – No Auth)
export const addCommentToBlog = async (req, res) => {
  try {
    const { name, message, rating } = req.body;
    const blog = await Blog.findById(req.params.id);

    if (!blog) {
      return res.status(404).json({ success: false, message: "Blog not found" });
    }

    const viewerHash = generateViewerHash(req);

    blog.comments.push({
      name,
      message,
      rating,
      hash: viewerHash,
    });

    await blog.save();

     const updatedComments = blog.comments.map((c) => ({
      ...c.toObject(),
      canDelete: c.hash === viewerHash, // Agar hash match hua toh delete icon dikhega
    }));

    res.status(200).json({
      success: true,
      comments: updatedComments, // Ab frontend ko directly permission ke saath data milega
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};



// Delete Comment 
// Delete Comment (Optimized & Professional)
export const deleteCommentFromBlog = async (req, res) => {
  try {
    const { blogId, commentId } = req.params;
    const viewerHash = generateViewerHash(req);

    // 1. Pehle blog ko dhoondo bina comments load kiye (Performance ke liye)
    const blog = await Blog.findById(blogId);
    if (!blog) {
      return res.status(404).json({ success: false, message: "Blog not found" });
    }

    // 2. Check karo ki comment exist karta hai aur user uska owner hai ya nahi
    const comment = blog.comments.id(commentId);
    if (!comment) {
      return res.status(404).json({ success: false, message: "Comment not found" });
    }

    if (comment.hash !== viewerHash) {
      return res.status(403).json({ success: false, message: "You can delete only your own comment" });
    }

    // 3. PROFESSIONAL WAY: Use $pull to delete only ONE specific comment by ID
    const updatedBlog = await Blog.findByIdAndUpdate(
      blogId,
      { $pull: { comments: { _id: commentId } } }, 
      { new: true } // Taaki humein delete hone ke baad wali nayi list mile
    );

    // 4. Response bhejne se pehle permissions reset karein (taaki delete icon dikhte rahein)
    const commentsWithPermission = updatedBlog.comments.map((c) => ({
      ...c.toObject(),
      canDelete: c.hash === viewerHash,
    }));

    res.status(200).json({
      success: true,
      comments: commentsWithPermission,
    });
  } catch (error) {
    console.error("Delete comment error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

