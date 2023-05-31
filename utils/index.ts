import { createJWT, attachCookiesToResponse, isTokenValid } from './jwt';
import createTokenUser from './createTokenUser';
import checkPermissions from './checkPermission';
import { Role, Message } from './enum';
import sendVerificationEmail from './sendVerficationEmail';
import sendResetPasswordEmail from './sendResetPasswordEmail';
import sendConfirmationEmail from './sendConfirmOrderEmail';
import hashString from './createHash';
import { formatPrice } from './helper';

export {
  createJWT,
  attachCookiesToResponse,
  createTokenUser,
  isTokenValid,
  checkPermissions,
  Role,
  Message,
  sendVerificationEmail,
  sendResetPasswordEmail,
  hashString,
  sendConfirmationEmail,
};
