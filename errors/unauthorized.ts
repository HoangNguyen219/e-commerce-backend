import CustomAPIError from "./custom-error";
import { StatusCodes } from 'http-status-codes';

class UnauthorizedError extends CustomAPIError {
    public statusCode: StatusCodes;
    constructor(message: string) {
        super(message)
        this.statusCode = StatusCodes.FORBIDDEN;
    }
}

export default UnauthorizedError;