import { IUser, ITokenUser } from '../models/User';

const createTokenUser = (user: IUser) => {
  const tokenuser: ITokenUser = {
    username: user.username,
    id: user._id,
    role: user.role,
  };
  return tokenuser;
};

export default createTokenUser;
