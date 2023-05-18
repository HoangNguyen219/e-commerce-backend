import { IUser, ITokenUser } from '../models/User';

const createTokenUser = (user: IUser) => {
  const tokenuser: ITokenUser = {
    name: user.name,
    id: user._id,
    email: user.email,
    role: user.role,
  };
  return tokenuser;
};

export default createTokenUser;
