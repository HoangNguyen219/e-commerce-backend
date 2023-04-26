import { StatusCodes } from 'http-status-codes';

class CustomAPIError extends Error {
  public statusCode: number = StatusCodes.INTERNAL_SERVER_ERROR;
  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
  }
}

export default CustomAPIError;
