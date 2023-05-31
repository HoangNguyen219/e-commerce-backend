import nodemailer from 'nodemailer';
import nodemailerConfig from './nodemailerConfig';

interface mail {
  to: string;
  subject: string;
  html: string;
}

const sendEmail = async ({ to, subject, html }: mail) => {
  const transporter = nodemailer.createTransport(nodemailerConfig);

  return transporter.sendMail({
    from: '"NTH Store" <support.nthstore@gmail.com>', // sender address
    to,
    subject,
    html,
  });
};

export default sendEmail;
