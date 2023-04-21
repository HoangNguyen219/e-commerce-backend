import CustomAPIError from "./custom-error";
import { StatusCodes } from 'http-status-codes';

class NotFoundError extends CustomAPIError {
    public statusCode: StatusCodes;
    constructor(message: string) {
        super(message)
        this.statusCode = StatusCodes.NOT_FOUND;
    }
}

export default NotFoundError;