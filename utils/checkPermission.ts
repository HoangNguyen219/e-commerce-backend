import { ObjectId } from 'mongoose';
import { UnauthorizedError } from '../errors';
import { ITokenUser } from '../models/User';
import { Message, Role } from './enum';

const checkPermissions = (requestUser: ITokenUser, resourceUserId: ObjectId) => {
  if (requestUser.role === Role.Admin) return;
  if (requestUser.id === resourceUserId.toString()) return;
  throw new UnauthorizedError(Message.UNAUTHORIZED);
};

export default checkPermissions;
