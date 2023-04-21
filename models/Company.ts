import mongoose, { Document } from 'mongoose';

interface ICompany extends Document {
  name: string;
  imageUrl: string;
  createdAt: Date;
  updatedAt: Date;
}

const CompanySchema = new mongoose.Schema<ICompany>(
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

export default mongoose.model<ICompany>('Company', CompanySchema);
