import Review from '../models/Review';
import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { NotFoundError } from '../errors';
import Product from '../models/Product';
import { checkPermissions } from '../utils';

const createReview = async (req: Request, res: Response) => {
  const { productId } = req.body;

  const isValidProduct = await Product.findOne({ _id: productId });
  if (!isValidProduct) {
    throw new NotFoundError(`No product with id : ${productId}`);
  }
  req.body.userId = req.user.id;
  const review = await Review.create(req.body);
  res.status(StatusCodes.CREATED).json({ review });
};

const getAllReviews = async (req: Request, res: Response) => {
  const reviews = await Review.find({}).populate('productId');
  res.status(StatusCodes.OK).json({ reviews, count: reviews.length });
};

const getSingleReview = async (req: Request, res: Response) => {
  const { id: reviewId } = req.params;

  const review = await Review.findOne({ _id: reviewId });

  if (!review) {
    throw new NotFoundError(`No review with id: ${reviewId}`);
  }

  res.status(StatusCodes.OK).json({ review });
};

const updateReview = async (req: Request, res: Response) => {
  const { id: reviewId } = req.params;
  const { rating, title, comment } = req.body;

  const review = await Review.findOne({ _id: reviewId });

  if (!review) {
    throw new NotFoundError(`No review with id: ${reviewId}`);
  }

  checkPermissions(req.user, review.userId);

  review.rating = rating;
  review.title = title;
  review.comment = comment;

  await review.save();
  res.status(StatusCodes.OK).json({ review });
};

const deleteReview = async (req: Request, res: Response) => {
  const { id: reviewId } = req.params;

  const review = await Review.findOne({ _id: reviewId });

  if (!review) {
    throw new NotFoundError(`No review with id: ${reviewId}`);
  }

  checkPermissions(req.user, review.userId);

  await review.deleteOne();
  res.status(StatusCodes.OK).json({ msg: 'Review removed' });
};

export { createReview, getAllReviews, getSingleReview, updateReview, deleteReview };
