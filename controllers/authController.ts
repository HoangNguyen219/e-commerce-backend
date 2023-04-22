import User from '../models/User';
import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { BadRequestError, UnauthenticatedError } from '../errors';
import { createTokenUser, attachCookiesToResponse, Message } from '../utils';
import { Role } from '../utils';

const register = async (req: Request, res: Response) => {
  const { username, email, password, confirmPassword } = req.body;

  if (password !== confirmPassword) {
    throw new BadRequestError(Message.PASSWORD_DO_NOT_MATCH);
  }

  // first registered user is an admin
  const isFirstAccount = (await User.countDocuments({})) === 0;
  const role = isFirstAccount ? Role.Admin : Role.User;

  await User.create({ username, email, password, role });
  res.status(StatusCodes.CREATED).json({ msg: 'User has been created' });
};

const login = async (req: Request, res: Response) => {
  const { username, password } = req.body;

  if (!username || !password) {
    throw new BadRequestError(Message.PLEASE_PROVIDE_ALL_VALUES);
  }
  const user = await User.findOne({ username });

  if (!user) {
    throw new UnauthenticatedError(Message.INVALID_CREDENTIALS);
  }
  const isPasswordCorrect = await user.comparePassword(password);
  if (!isPasswordCorrect) {
    throw new UnauthenticatedError(Message.INVALID_CREDENTIALS);
  }
  const tokenUser = createTokenUser(user);
  attachCookiesToResponse(res, tokenUser);

  res.status(StatusCodes.OK).json({ user: tokenUser });
};

const logout = async (req: Request, res: Response) => {
  res.cookie('token', 'logout', {
    httpOnly: true,
    expires: new Date(Date.now() + 1000),
  });
  res.status(StatusCodes.OK).json({ msg: 'User logged out' });
};

export { register, login, logout };
