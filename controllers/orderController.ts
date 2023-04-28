import Order, { ISingleOrderItem } from '../models/Order';
import Product from '../models/Product';
import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { BadRequestError, NotFoundError } from '../errors';
import { checkPermissions } from '../utils';

interface PaymentData {
  amount: number;
  currency: string;
}

const fakeStripeAPI = async ({ amount, currency }: PaymentData) => {
  const client_secret = 'someRandomValue';
  return { client_secret, amount };
};

const createOrder = async (req: Request, res: Response) => {
  const { cartItems, tax, shippingFee } = req.body;

  if (!cartItems || cartItems.length < 1) {
    throw new BadRequestError('No cart items provided');
  }
  if (!shippingFee) {
    throw new BadRequestError('Please provide shipping fee');
  }

  let orderItems: ISingleOrderItem[] = [];
  let subtotal = 0;

  for (const item of cartItems) {
    const dbProduct = await Product.findOne({ _id: item.product });
    if (!dbProduct) {
      throw new NotFoundError(`No product with id : ${item.product}`);
    }

    item.itemTotal = item.price * item.quantity;
    // add item to order
    orderItems = [...orderItems, item];
    // calculate subtotal
    subtotal += item.itemTotal;
  }
  // calculate total
  const total = tax + shippingFee + subtotal;
  // get client secret
  const paymentIntent = await fakeStripeAPI({
    amount: total,
    currency: 'usd',
  });

  const order = await Order.create({
    orderItems,
    total,
    subtotal,
    tax,
    shippingFee,
    clientSecret: paymentIntent.client_secret,
    user: req.user.id,
  });

  res.status(StatusCodes.CREATED).json({ order, clientSecret: order.clientSecret });
};

const getAllOrders = async (req: Request, res: Response) => {
  const orders = await Order.find({});
  res.status(StatusCodes.OK).json({ orders, count: orders.length });
};

const getSingleOrder = async (req: Request, res: Response) => {
  const { id: orderId } = req.params;
  const order = await Order.findOne({ _id: orderId });
  if (!order) {
    throw new NotFoundError(`No order with id : ${orderId}`);
  }
  checkPermissions(req.user, order.userId);
  res.status(StatusCodes.OK).json({ order });
};

const getCurrentUserOrders = async (req: Request, res: Response) => {
  const orders = await Order.find({ userId: req.user.id });
  res.status(StatusCodes.OK).json({ orders, count: orders.length });
};

const updateOrder = async (req: Request, res: Response) => {
  const { id: orderId } = req.params;
  const { paymentIntentId } = req.body;

  const order = await Order.findOne({ _id: orderId });
  if (!order) {
    throw new NotFoundError(`No order with id : ${orderId}`);
  }
  checkPermissions(req.user, order.userId);

  order.paymentIntentId = paymentIntentId;
  order.status = 'paid';
  await order.save();

  res.status(StatusCodes.OK).json({ order });
};

export { getAllOrders, getSingleOrder, getCurrentUserOrders, createOrder, updateOrder };
