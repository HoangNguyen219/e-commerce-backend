import mongoose, { Schema, Document, Types, ObjectId, Model } from 'mongoose';
import Product from './Product';

interface IReview extends Document {
  rating: Number;
  comment: string;
  userId: Schema.Types.ObjectId;
  productId: Schema.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

interface ReviewModel extends Model<IReview> {
  calculateAverageRating(productId: ObjectId): Promise<void>;
}

const ReviewSchema = new Schema<IReview, ReviewModel>(
  {
    rating: {
      type: Number,
      min: 1,
      max: 5,
      required: [true, 'Please provide rating'],
    },
    comment: {
      type: String,
      required: [true, 'Please provide review text'],
    },
    userId: {
      type: Types.ObjectId,
      ref: 'User',
      required: true,
    },
    productId: {
      type: Types.ObjectId,
      ref: 'Product',
      required: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);
ReviewSchema.index({ productId: 1, userId: 1 }, { unique: true });

ReviewSchema.statics.calculateAverageRating = async function (
  productId: ObjectId,
) {
  const result = await this.aggregate([
    { $match: { productId: productId } },
    {
      $group: {
        _id: null,
        averageRating: { $avg: '$rating' },
        numOfReviews: { $sum: 1 },
      },
    },
  ]);

  try {
    await Product.findOneAndUpdate(
      { _id: productId },
      {
        averageRating: Math.ceil(result[0]?.averageRating || 0),
        numOfReviews: result[0]?.numOfReviews || 0,
      },
    );
  } catch (error) {
    console.log(error);
  }
};

ReviewSchema.post('save', async function (doc) {
  mongoose
    .model<IReview, ReviewModel>('Review', ReviewSchema)
    .calculateAverageRating(doc.productId);
});

ReviewSchema.post(
  'deleteOne',
  { document: true, query: true },
  async function (doc) {
    mongoose
      .model<IReview, ReviewModel>('Review', ReviewSchema)
      .calculateAverageRating(doc.productId);
  },
);

export default mongoose.model<IReview, ReviewModel>('Review', ReviewSchema);
