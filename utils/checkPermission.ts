import { UnauthorizedError } from '../errors';
import { ITokenUser } from '../models/User';
import { Message, Role } from './enum';

const checkPermissions = (requestUser: ITokenUser, resourceUserId: string) => {
  if (requestUser.role === Role.Admin) return;
  if (requestUser.id === resourceUserId) return;
  throw new UnauthorizedError(Message.UNAUTHORIZED);
};

export default checkPermissions;
