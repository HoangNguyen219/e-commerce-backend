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

CompanySchema.virtual('products', {
  ref: 'Product',
  localField: '_id',
  foreignField: 'companyId',
  justOne: false,
});

CompanySchema.pre(
  'deleteOne',
  { document: true, query: false },
  async function () {
    await Product.deleteMany({ companyId: this._id });
  },
);

export default mongoose.model<ICompany>('Company', CompanySchema);
