import mongoose, { Document, Types, Schema } from 'mongoose';

interface Product extends Document {
  name: string;
  price: number;
  description: string;
  imageUrl: string;
  colors: string[];
  featured: boolean;
  freeShipping: boolean;
  stock: number;
  averageRating: number;
  numOfReviews: number;
  categoryId: Schema.Types.ObjectId;

  companyId: Schema.Types.ObjectId;

  createdAt: Date;
  updatedAt: Date;
}

const ProductSchema = new mongoose.Schema<Product>(
  {
    name: {
      type: String,
      trim: true,
      require: [true, 'Please provide product name'],
      maxLength: [100, 'Name can not be more than 100 characters'],
    },
    price: {
      type: Number,
      required: [true, 'Please provide product price'],
      default: 0,
    },
    description: {
      type: String,
      required: [true, 'Please provide product description'],
      maxlength: [1000, 'Description can not be more than 1000 characters'],
    },
    imageUrl: {
      type: String,
      default: '/uploads/example.jpeg',
      required: true,
    },
    colors: {
      type: [String],
      default: ['#222'],
      required: true,
    },
    featured: {
      type: Boolean,
      default: false,
    },
    freeShipping: {
      type: Boolean,
      default: false,
    },
    stock: {
      type: Number,
      required: true,
      default: 15,
    },
    averageRating: {
      type: Number,
      default: 0,
    },
    numOfReviews: {
      type: Number,
      default: 0,
    },
    companyId: {
      type: Types.ObjectId,
      ref: 'Company',
      required: true,
    },
    categoryId: {
      type: Types.ObjectId,
      ref: 'Category',
      required: true,
    },
  },
  { timestamps: true },
);

export default mongoose.model<Product>('Product', ProductSchema);
