import { IUser, ITokenUser } from '../models/User';

export const createTokenUser = (user: IUser) => {
  const tokenuser: ITokenUser = {
    username: user.username,
    id: user._id,
    role: user.role,
  };
  return tokenuser;
};
