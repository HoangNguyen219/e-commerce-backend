import { UnauthenticatedError, UnauthorizedError } from '../errors';
import { ITokenUser } from '../models/User';
import { Message, isTokenValid } from '../utils';
import { Response, Request, NextFunction } from 'express';

declare global {
  namespace Express {
    interface Request {
      user: ITokenUser;
    }
  }
}

const authenticateUser = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const token = req.signedCookies.token;
  if (!token) {
    throw new UnauthenticatedError(Message.AUTHENTICATION_INVALID);
  }
  try {
    const { name, id, role, email } = isTokenValid(token);
    req.user = { name, id, role, email };
    next();
  } catch (error) {
    throw new UnauthenticatedError(Message.AUTHENTICATION_INVALID);
  }
};

const authorizePermissions = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!roles.includes(req.user.role)) {
      throw new UnauthorizedError(Message.UNAUTHORIZED);
    }
    next();
  };
};

export { authenticateUser, authorizePermissions };
