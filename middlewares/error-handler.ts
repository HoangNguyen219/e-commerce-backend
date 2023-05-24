import { StatusCodes } from 'http-status-codes';
import { Request, Response, NextFunction } from 'express';
import { ClientSession } from 'mongoose';

let currentSession: ClientSession | null = null;

export const setCurrentSession = (session: ClientSession | null) => {
  currentSession = session;
};

const errorHandlerMiddleware = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (currentSession) {
    // End the session
    currentSession.endSession();
    currentSession = null;
  }

  let customError = {
    // set default
    statusCode: err.statusCode || StatusCodes.INTERNAL_SERVER_ERROR,
    msg: err.message || 'Something went wrong try again later',
  };
  if (err.name === 'ValidationError') {
    const errorArr = Object.values(err.errors)[0] as any;
    customError.msg = errorArr.message;
    customError.statusCode = StatusCodes.BAD_REQUEST;
  }
  if (err.code && err.code === 11000) {
    customError.msg = `Duplicate value entered for ${Object.keys(
      err.keyValue,
    )} field, please choose another value`;
    customError.statusCode = StatusCodes.BAD_REQUEST;
  }

  if (err.name === 'CastError') {
    customError.msg = `No item found with id : ${err.value}`;
    customError.statusCode = 404;
  }

  return res.status(customError.statusCode).json({ msg: customError.msg });
};

export default errorHandlerMiddleware;
