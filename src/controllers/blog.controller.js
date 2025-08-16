import { Blog } from '../models/blog.model.js';
import { uploadOnCloudinary } from '../utils/cloudinary.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import fs from 'fs';

// ✅ Create Blog
export const createBlog = asyncHandler(async (req, res) => {
  const { title, content } = req.body;

  console.log('REQ BODY:', req.body);
  console.log('REQ FILE:', req.file);

  // ✅ validate fields
  if (!title || !content) {
    throw new Error('Missing required fields: title or content');
  }

  let imageUrl = null;

  // ✅ upload image if present
  if (req.file) {
    const uploaded = await uploadOnCloudinary(req.file.path);

    if (!uploaded?.url) {
      throw new Error('Image upload failed');
    }
    imageUrl = uploaded.url;

    // ✅ safely delete temp file
    try {
      if (fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
        console.log('Temp file removed:', req.file.path);
      }
    } catch (err) {
      console.error('Error while deleting temp file:', err.message);
    }
  }

  // ✅ create blog in DB
  const blog = await Blog.create({
    title,
    content,
    image: imageUrl,
  });

  res.status(201).json({
    success: true,
    message: 'Blog created successfully',
    blog,
  });
});


// ✅ Get All Blogs
export const getAllBlogs = asyncHandler(async (req, res) => {
  const blogs = await Blog.find().sort({ createdAt: -1 });
  return res
    .status(200)
    .json(new ApiResponse(200, blogs, 'Blogs fetched successfully'));
});

// ✅ Get Blog By ID
export const getBlogById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const blog = await Blog.findById(id);

  if (!blog) {
    throw new ApiError(404, 'Blog not found');
  }

  return res
    .status(200)
    .json(new ApiResponse(200, blog, 'Blog fetched successfully'));
});

// ✅ Update Blog
export const updateBlog = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { title, content } = req.body;

  let blog = await Blog.findById(id);
  if (!blog) {
    throw new ApiError(404, 'Blog not found');
  }

  // Validate input if provided
  if (title !== undefined) {
    if (typeof title !== 'string' || title.trim().length === 0) {
      throw new ApiError(400, 'Title must be a non-empty string');
    }
  }

  if (content !== undefined) {
    if (typeof content !== 'string' || content.trim().length === 0) {
      throw new ApiError(400, 'Content must be a non-empty string');
    }
  }

  // If new image uploaded
  if (req.file) {
    const cloudinaryResponse = await uploadOnCloudinary(req.file.path);
    if (!cloudinaryResponse) {
      throw new ApiError(500, 'Image upload failed');
    }
    blog.image = cloudinaryResponse.url;
  }

  blog.title = title || blog.title;
  blog.content = content || blog.content;
  await blog.save();

  return res
    .status(200)
    .json(new ApiResponse(200, blog, 'Blog updated successfully'));
});

// ✅ Delete Blog
export const deleteBlog = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const blog = await Blog.findById(id);

  if (!blog) {
    throw new ApiError(404, 'Blog not found');
  }

  await blog.deleteOne();

  return res
    .status(200)
    .json(new ApiResponse(200, null, 'Blog deleted successfully'));
});
