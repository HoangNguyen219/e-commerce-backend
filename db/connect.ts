import mongoose from 'mongoose';

const connectDB = (url: string) => {
  return mongoose.set('strictQuery', true).connect(url);
};

export default connectDB;
