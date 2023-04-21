import mongoose, { Schema, Document } from 'mongoose';

interface Category extends Document {
  name: string;
  imageUrl: string;
  createdAt: Date;
  updatedAt: Date;
}

const CategorySchema: Schema<Category> = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide name'],
      minlength: 3,
      maxlength: 50,
    },
    imageUrl: {
      type: String,
      default: '/uploads/example.jpeg',
      required: true,
    },
  },
  { timestamps: true },
);

export default mongoose.model<Category>('Category', CategorySchema);
