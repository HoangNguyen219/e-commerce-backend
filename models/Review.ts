import mongoose, { Schema, Document, Types } from 'mongoose';

interface Review extends Document {
  rating: Number;
  title: string;
  comment: string;
  userId: Schema.Types.ObjectId;
  productId: Schema.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const ReviewSchema = new mongoose.Schema<Review>(
  {
    rating: {
      type: Number,
      min: 1,
      max: 5,
      required: [true, 'Please provide rating'],
    },
    title: {
      type: String,
      trim: true,
      required: [true, 'Please provide review title'],
      maxlength: 100,
    },
    comment: {
      type: String,
      required: [true, 'Please provide review text'],
    },
    userId: {
      type: Types.ObjectId,
      ref: 'User',
      required: true,
    },
    productId: {
      type: Types.ObjectId,
      ref: 'Product',
      required: true,
    },
  },
  { timestamps: true },
);
ReviewSchema.index({ product: 1, user: 1 }, { unique: true });

export default mongoose.model<Review>('Review', ReviewSchema);
