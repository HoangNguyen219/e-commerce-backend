import User from '../models/User';
import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { BadRequestError, UnauthenticatedError } from '../errors';
import { createTokenUser, attachCookiesToResponse } from '../utils';

const register = async (req: Request, res: Response) => {
  const { username, email, password, confirmPassword } = req.body;

  if (password !== confirmPassword) {
    throw new BadRequestError('Passwords do not match!');
  }

  // first registered user is an admin
  const isFirstAccount = (await User.countDocuments({})) === 0;
  const role = isFirstAccount ? 'admin' : 'user';

  await User.create({ username, email, password, role });
  res.status(StatusCodes.CREATED).json({ msg: 'User has been created' });
};

const login = async (req: Request, res: Response) => {
  const { username, password } = req.body;

  if (!username || !password) {
    throw new BadRequestError('Please provide username and password');
  }
  const user = await User.findOne({ username });

  if (!user) {
    throw new UnauthenticatedError('Invalid Credentials');
  }
  const isPasswordCorrect = await user.comparePassword(password);
  if (!isPasswordCorrect) {
    throw new UnauthenticatedError('Invalid Credentials');
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
  res.status(StatusCodes.OK).json({ msg: 'User logged out!' });
};

export { register, login, logout };
