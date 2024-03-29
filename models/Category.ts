import mongoose, { Document } from 'mongoose';
import Product, { IProduct } from './Product';

interface ICategory extends Document {
  name: string;
  products?: IProduct[];
  createdAt: Date;
  updatedAt: Date;
}

const CategorySchema = new mongoose.Schema<ICategory>(
  {
    name: {
      type: String,
      unique: true,
      required: [true, 'Please provide name'],
      minlength: [1, 'Name must not contain only whitespace characters'],
      maxlength: 50,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

CategorySchema.virtual('products', {
  ref: 'Product',
  localField: '_id',
  foreignField: 'categoryId',
  justOne: false,
});

CategorySchema.pre(
  'deleteOne',
  { document: true, query: false },
  async function () {
    await Product.deleteMany({ categoryId: this._id });
  },
);

export default mongoose.model<ICategory>('Category', CategorySchema);
