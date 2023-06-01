import User from '../models/User';
import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { BadRequestError, NotFoundError } from '../errors';
import {
  createTokenUser,
  attachCookiesToResponse,
  checkPermissions,
} from '../utils';
import { Message } from '../utils/enum';

const getAllUsers = async (req: Request, res: Response) => {
  const { sort, customer } = req.query;

  const queryObject: Record<string, any> = {};

  if (customer) {
    queryObject.$or = [
      { name: { $regex: customer, $options: 'i' } },
      { email: { $regex: customer, $options: 'i' } },
    ];
  }

  let result = User.find(queryObject)
    .select('-password')
    .populate({
      path: 'orders',
      select: 'id',
    })
    .populate({
      path: 'reviews',
      select: 'id',
    });

  if (sort === 'latest') {
    result = result.sort('-createdAt');
  }
  if (sort === 'oldest') {
    result = result.sort('createdAt');
  }
  if (sort === 'a-z') {
    result = result.sort('name');
  }
  if (sort === 'z-a') {
    result = result.sort('-name');
  }

  // setup pagination
  const page = Number(req.query.page) || 1;
  let limit = Number(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  result = result.skip(skip).limit(limit);

  const users = await result.exec();

  const usersWithCount = users.map(user => {
    const { id, name, email, createdAt, updatedAt } = user;
    return {
      id,
      name,
      email,
      createdAt,
      updatedAt,
      ordersCount: user.orders!.length,
      reviewsCount: user.reviews!.length,
    };
  });

  if (sort === 'order-lowest') {
    usersWithCount.sort((a, b) => a.ordersCount - b.ordersCount);
  }

  if (sort === 'order-highest') {
    usersWithCount.sort((a, b) => b.ordersCount - a.ordersCount);
  }

  if (sort === 'review-lowest') {
    usersWithCount.sort((a, b) => a.reviewsCount - b.reviewsCount);
  }

  if (sort === 'review-highest') {
    usersWithCount.sort((a, b) => b.reviewsCount - a.reviewsCount);
  }

  const totalUsers = await User.countDocuments(queryObject);
  const numOfPages = Math.ceil(totalUsers / limit);
  res
    .status(StatusCodes.OK)
    .json({ users: usersWithCount, totalUsers, numOfPages });
};

const getSingleUser = async (req: Request, res: Response) => {
  const user = await User.findOne({ _id: req.params.id }).select('-password');
  if (!user) {
    throw new NotFoundError(`No user with id : ${req.params.id}`);
  }
  checkPermissions(req.user, user._id);
  res.status(StatusCodes.OK).json({ user });
};

const showCurrentUser = async (req: Request, res: Response) => {
  res.status(StatusCodes.OK).json({ user: req.user });
};

const updateUser = async (req: Request, res: Response) => {
  const { name } = req.body;
  if (!name) {
    throw new BadRequestError(Message.PLEASE_PROVIDE_ALL_VALUES);
  }
  const user = await User.findOne({ _id: req.user.id });

  user!.name = name;

  await user!.save();

  const tokenUser = createTokenUser(user!);
  attachCookiesToResponse(res, tokenUser, req);
  res.status(StatusCodes.OK).json({ user: tokenUser });
};

const updateUserPassword = async (req: Request, res: Response) => {
  const { oldPassword, newPassword, confirmPassword } = req.body;
  if (!oldPassword || !newPassword) {
    throw new BadRequestError(Message.PLEASE_PROVIDE_ALL_VALUES);
  }
  const user = await User.findOne({ _id: req.user.id });

  if (newPassword !== confirmPassword) {
    throw new BadRequestError(Message.PASSWORD_DO_NOT_MATCH);
  }

  const isPasswordCorrect = await user!.comparePassword(oldPassword);
  if (!isPasswordCorrect) {
    throw new BadRequestError(Message.INVALID_CREDENTIALS);
  }

  user!.password = newPassword;

  await user!.save();
  res.status(StatusCodes.OK).json({ msg: 'Password Updated' });
};

export {
  getAllUsers,
  getSingleUser,
  showCurrentUser,
  updateUser,
  updateUserPassword,
};
