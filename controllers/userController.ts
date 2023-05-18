import User from '../models/User';
import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import {
  BadRequestError,
  UnauthenticatedError,
  NotFoundError,
} from '../errors';
import {
  createTokenUser,
  attachCookiesToResponse,
  checkPermissions,
} from '../utils';
import { Message, Role } from '../utils/enum';

const getAllUsers = async (req: Request, res: Response) => {
  console.log(req.user);
  const users = await User.find({ role: Role.User }).select('-password');
  res.status(StatusCodes.OK).json({ users });
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
  attachCookiesToResponse(res, tokenUser);
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
