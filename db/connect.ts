import mongoose from 'mongoose';

let databaseInstance: Promise<typeof mongoose> | null = null;

const connectDB = (url: string) => {
  if (!databaseInstance) {
    databaseInstance = mongoose.set('strictQuery', true).connect(url);
  }
  return databaseInstance;
};

export default connectDB;
