import CustomAPIError from "./custom-error";
import { StatusCodes } from 'http-status-codes';

class UnauthenticatedError extends CustomAPIError {
    public statusCode: StatusCodes;
    constructor(message: string) {
        super(message)
        this.statusCode = StatusCodes.UNAUTHORIZED;
    }
}

export default UnauthenticatedError;