import Review from '../models/Review';
import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { NotFoundError } from '../errors';
import Product, { IProduct } from '../models/Product';
import { checkPermissions } from '../utils';
import User, { IUser } from '../models/User';

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
  const { sort, customer, product, rating } = req.query;

  const queryObject: Record<string, any> = {};

  if (rating && rating !== 'all') {
    queryObject.rating = { $eq: Number(rating) };
  }

  if (customer) {
    let users: IUser[] = [];
    let userQueryObject: Record<string, any> = {};
    userQueryObject.$or = [
      { name: { $regex: customer, $options: 'i' } },
      { email: { $regex: customer, $options: 'i' } },
    ];
    users = await User.find(userQueryObject).select('id');
    queryObject.userId = { $in: users.map(u => u.id) };
  }

  if (product) {
    let products: IProduct[] = [];
    let productQueryObject: Record<string, any> = {};
    productQueryObject.name = { $regex: product, $options: 'i' };
    products = await Product.find(productQueryObject).select('id');
    queryObject.productId = { $in: products.map(p => p.id) };
  }

  let result = Review.find(queryObject)
    .populate({
      path: 'userId',
      select: 'name email',
    })
    .populate({
      path: 'productId',
      select: 'name',
    });

  // chain sort conditions
  if (sort === 'latest') {
    result = result.sort('-createdAt');
  }
  if (sort === 'oldest') {
    result = result.sort('createdAt');
  }
  if (sort === 'rating-lowest') {
    result = result.sort('rating');
  }
  if (sort === 'rating-highest') {
    result = result.sort('-rating');
  }

  // setup pagination
  const page = Number(req.query.page) || 1;
  let limit = Number(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  result = result.skip(skip).limit(limit);

  const reviews = await result.exec();

  const totalReviews = await Review.countDocuments(queryObject);
  const numOfPages = Math.ceil(totalReviews / limit);
  res.status(StatusCodes.OK).json({ reviews, totalReviews, numOfPages });
};

const getSingleReview = async (req: Request, res: Response) => {
  const { id: reviewId } = req.params;

  const review = await Review.findOne({ _id: reviewId }).populate('productId');

  if (!review) {
    throw new NotFoundError(`No review with id: ${reviewId}`);
  }

  res.status(StatusCodes.OK).json({ review });
};

const updateReview = async (req: Request, res: Response) => {
  const { id: reviewId } = req.params;
  const { rating, comment } = req.body;

  const review = await Review.findOne({ _id: reviewId });

  if (!review) {
    throw new NotFoundError(`No review with id: ${reviewId}`);
  }

  checkPermissions(req.user, review.userId);

  review.rating = rating;
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

export {
  createReview,
  getAllReviews,
  getSingleReview,
  updateReview,
  deleteReview,
};
