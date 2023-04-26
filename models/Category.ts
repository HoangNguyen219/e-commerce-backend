import mongoose, { Document } from 'mongoose';
import Product from './Product';

interface ICategory extends Document {
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

const CategorySchema = new mongoose.Schema<ICategory>(
  {
    name: {
      type: String,
      unique: true,
      required: [true, 'Please provide name'],
      minlength: 3,
      maxlength: 50,
    },
  },
  { timestamps: true },
);

CategorySchema.virtual('products', {
  ref: 'Product',
  localField: '_id',
  foreignField: 'productId',
  justOne: false,
});

CategorySchema.pre<ICategory>('deleteOne', async function (next) {
  await Product.deleteMany({ product: this._id });
});

export default mongoose.model<ICategory>('Category', CategorySchema);
