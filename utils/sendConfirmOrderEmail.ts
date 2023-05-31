import { formatPrice } from './helper';
import sendEmail from './sendEmail';

interface dataParams {
  name: string;
  email: string;
  orderId: string;
  total: number;
}

const sendConfirmationEmail = async ({ email, orderId, total }: dataParams) => {
  const totalFormat = formatPrice(total);
  const message = `
  <h1>Order Confirmation</h1>
  <p>Thank you for your order!</p>
  <p>Order ID: ${orderId}</p>
  <p>Order total: ${totalFormat}</p>
  <p>Please keep this email for your reference.</p>
  `;

  return sendEmail({
    to: email,
    subject: 'Order Confirmation',
    html: message,
  });
};

export default sendConfirmationEmail;
