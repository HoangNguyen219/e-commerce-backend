import { Response, Request } from 'express';
import jwt from 'jsonwebtoken';
import { ITokenUser } from '../models/User';

const attachCookiesToResponse = (
  res: Response,
  user: ITokenUser,
  req: Request,
) => {
  const token = createJWT(user);
  // const origin = req.headers.origin;
  // const domain =
  //   origin === process.env.ORIGIN
  //     ? process.env.ORIGIN_DOMAIN
  //     : process.env.ADMIN_ORIGIN_DOMAIN;

  // console.log(domain);

  res.cookie('token', token, {
    // domain: process.env.NODE_ENV === 'production' ? domain : '',
    // path: '/',
    httpOnly: true,
    maxAge: 1000 * 60 * 60 * 24, // 1d
    secure: process.env.NODE_ENV === 'production',
    signed: true,
    sameSite: 'none',
  });
};

const createJWT = (payload: ITokenUser) => {
  const secret = process.env.JWT_SECRET || 'secret';
  const token = jwt.sign(payload, secret, {
    expiresIn: process.env.JWT_LIFETIME || '1d',
  });
  return token;
};

const isTokenValid = (token: string): ITokenUser => {
  return jwt.verify(token, process.env.JWT_SECRET || 'secret') as ITokenUser;
};

export { attachCookiesToResponse, createJWT, isTokenValid };
