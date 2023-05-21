import User from '../models/User';
import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { BadRequestError, UnauthenticatedError } from '../errors';
import {
  createTokenUser,
  attachCookiesToResponse,
  Message,
  sendVerificationEmail,
  Role,
  sendResetPasswordEmail,
  hashString,
} from '../utils';
import crypto from 'crypto';

const register = async (req: Request, res: Response) => {
  const { name, email, password } = req.body;

  // first registered user is an admin
  const isFirstAccount = (await User.countDocuments({})) === 0;
  const role = isFirstAccount ? Role.Admin : Role.User;

  const verificationToken = crypto.randomBytes(40).toString('hex');

  const user = await User.create({
    name,
    email,
    password,
    role,
    verificationToken,
  });

  const origin = process.env.ORIGIN || 'http://localhost:8000';

  await sendVerificationEmail({
    name: user.name,
    email: user.email,
    verificationToken: user.verificationToken,
    origin,
  });

  res
    .status(StatusCodes.CREATED)
    .json({ msg: 'Success! Please check your email to verify account' });
};

const verifyEmail = async (req: Request, res: Response) => {
  const { verificationToken, email } = req.body;
  console.log(req.body);

  const user = await User.findOne({ email });

  if (!user) {
    throw new UnauthenticatedError('Verification Failed');
  }

  if (user.verificationToken !== verificationToken) {
    throw new UnauthenticatedError('Verification Failed');
  }

  user.isVerified = true;
  user.verified = new Date(Date.now());
  user.verificationToken = '';

  await user.save();

  res.status(StatusCodes.OK).json({ msg: 'Email Verified' });
};

const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new BadRequestError(Message.PLEASE_PROVIDE_ALL_VALUES);
  }
  const user = await User.findOne({ email });

  if (!user) {
    throw new UnauthenticatedError(Message.INVALID_CREDENTIALS);
  }
  const isPasswordCorrect = await user.comparePassword(password);
  if (!isPasswordCorrect) {
    throw new UnauthenticatedError(Message.INVALID_CREDENTIALS);
  }
  if (!user.isVerified) {
    throw new UnauthenticatedError('Please verify your email');
  }

  const tokenUser = createTokenUser(user);
  attachCookiesToResponse(res, tokenUser);

  res.status(StatusCodes.OK).json({ user: tokenUser });
};

const forgotPassword = async (req: Request, res: Response) => {
  const { email } = req.body;
  if (!email) {
    throw new BadRequestError('Please provide valid email');
  }

  const user = await User.findOne({ email });

  if (user) {
    const passwordToken = crypto.randomBytes(70).toString('hex');
    // send email
    const origin = process.env.ORIGIN || 'http://localhost:8000';
    await sendResetPasswordEmail({
      name: user.name,
      email: user.email,
      token: passwordToken,
      origin,
    });

    const tenMinutes = 1000 * 60 * 10;
    const passwordTokenExpirationDate = new Date(Date.now() + tenMinutes);

    user.passwordToken = hashString(passwordToken);
    user.passwordTokenExpirationDate = passwordTokenExpirationDate;
    await user.save();
  }

  res
    .status(StatusCodes.OK)
    .json({ msg: 'Please check your email for reset password link' });
};

const resetPassword = async (req: Request, res: Response) => {
  const { token, email, password } = req.body;
  if (!token || !email || !password) {
    throw new BadRequestError(Message.PLEASE_PROVIDE_ALL_VALUES);
  }
  const user = await User.findOne({ email });

  if (user) {
    const currentDate = new Date();

    if (
      user.passwordToken === hashString(token) &&
      user.passwordTokenExpirationDate! > currentDate
    ) {
      user.password = password;
      user.passwordToken = undefined;
      user.passwordTokenExpirationDate = undefined;
      await user.save();
    }
  }

  res.send('reset password');
};

const logout = async (req: Request, res: Response) => {
  res.cookie('token', 'logout', {
    httpOnly: true,
    expires: new Date(Date.now()),
  });
  res.status(StatusCodes.OK).json({ msg: 'User logged out' });
};

export { register, login, logout, verifyEmail, forgotPassword, resetPassword };
