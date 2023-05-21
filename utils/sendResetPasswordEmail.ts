import sendEmail from './sendEmail';

interface dataParams {
  name: string;
  email: string;
  token: string;
  origin: string;
}

const sendResetPasswordEmail = async ({
  name,
  email,
  token,
  origin,
}: dataParams) => {
  const resetURL = `${origin}/user/reset-password?token=${token}&email=${email}`;
  const message = `<p>Please reset password by clicking on the following link : 
  <a href="${resetURL}">Reset Password</a></p>`;

  return sendEmail({
    to: email,
    subject: 'Reset Password',
    html: `<h4>Hello, ${name}</h4>
   ${message}
   `,
  });
};

export default sendResetPasswordEmail;
