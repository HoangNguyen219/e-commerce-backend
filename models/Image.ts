import mongoose, { Schema, Document, Types } from 'mongoose';

interface Image extends Document {
  name: string;
  imageUrl: string;
  productId: Schema.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const ImageSchema: Schema<Image> = new mongoose.Schema(
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
    productId: {
      type: Types.ObjectId,
      ref: 'Product',
      required: true,
    },
  },
  { timestamps: true },
);

export default mongoose.model<Image>('Image', ImageSchema);
