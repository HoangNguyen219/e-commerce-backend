import mongoose, { Document } from 'mongoose';
import Product from './Product';

interface ICompany extends Document {
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

const CompanySchema = new mongoose.Schema<ICompany>(
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

CompanySchema.virtual('products', {
  ref: 'Product',
  localField: '_id',
  foreignField: 'productId',
  justOne: false,
});

CompanySchema.pre<ICompany>('deleteOne', async function (next) {
  await Product.deleteMany({ product: this._id });
});

export default mongoose.model<ICompany>('Company', CompanySchema);
