import mongoose, { Document, Types, Schema } from 'mongoose';
import Review from './Review';
import Image from './Image';

interface IProductImage extends Document {
  name: string;
  primaryImage: boolean;
  imageUrl: string;
}

const ProductImageSchema = new mongoose.Schema<IProductImage>({
  name: { type: String, required: true },
  primaryImage: { type: Boolean, required: true, default: false },
  imageUrl: { type: String, required: true },
});

interface IProduct extends Document {
  name: string;
  price: number;
  description: string;
  productImages: [Schema<IProductImage>];
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

const ProductSchema = new mongoose.Schema<IProduct>(
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
    productImages: [ProductImageSchema],
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

ProductSchema.virtual('reviews', {
  ref: 'Review',
  localField: '_id',
  foreignField: 'product',
  justOne: false,
});

ProductSchema.pre<IProduct>('deleteOne', async function (next) {
  await Review.deleteMany({ product: this._id });
});

export default mongoose.model<IProduct>('Product', ProductSchema);
