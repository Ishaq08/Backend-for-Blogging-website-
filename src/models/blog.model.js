import mongoose from 'mongoose';

const blogSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    content: {
      type: String,
      required: true,
    },
    image: {
      type: String, // Cloudinary URL
      required: false,
    },
  },
  { timestamps: true }
);

export const Blog = mongoose.model('Blog', blogSchema);
