import Order, { ISingleOrderItem } from '../models/Order';
import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { BadRequestError, NotFoundError } from '../errors';
import { checkPermissions } from '../utils';

const createOrder = async (req: Request, res: Response) => {
  const { cartItems, shippingFee, addressId, paymentMethod } = req.body;

  if (!cartItems || cartItems.length < 1) {
    throw new BadRequestError('No cart items provided');
  }

  if (!shippingFee) {
    throw new BadRequestError('Please provide shippingFee');
  }

  let orderItems: ISingleOrderItem[] = [];
  let subtotal = 0;

  for (const item of cartItems) {
    item.itemTotal = item.price * item.amount;
    orderItems = [...orderItems, item];
    subtotal += item.itemTotal;
  }
  // calculate total
  const total = shippingFee + subtotal;
  let paymentStatus = 'unpaid';
  if (paymentMethod === 'PAYPAL') {
    paymentStatus = 'paid';
  }
  const order = await Order.create({
    orderItems,
    total,
    subtotal,
    shippingFee,
    addressId,
    paymentMethod,
    paymentStatus,
    userId: req.user.id,
  });

  res.status(StatusCodes.CREATED).json({ order });
};

const getAllOrders = async (req: Request, res: Response) => {
  const orders = await Order.find({});
  res.status(StatusCodes.OK).json({ orders, count: orders.length });
};

const getSingleOrder = async (req: Request, res: Response) => {
  const { id: orderId } = req.params;
  const order = await Order.findOne({ _id: orderId })
    .populate('addressId')
    .populate({ path: 'orderItems.productId', select: 'name id primaryImage' });
  if (!order) {
    throw new NotFoundError(`No order with id : ${orderId}`);
  }
  checkPermissions(req.user, order.userId);
  res.status(StatusCodes.OK).json({ order });
};

const getCurrentUserOrders = async (req: Request, res: Response) => {
  const orders = await Order.find({ userId: req.user.id }).sort('-createdAt');
  res.status(StatusCodes.OK).json({ orders, count: orders.length });
};

const updateOrder = async (req: Request, res: Response) => {
  const { id: orderId } = req.params;

  const order = await Order.findOne({ _id: orderId });
  if (!order) {
    throw new NotFoundError(`No order with id : ${orderId}`);
  }
  checkPermissions(req.user, order.userId);

  order.paymentStatus = 'paid';
  await order.save();

  res.status(StatusCodes.OK).json({ order });
};

export {
  getAllOrders,
  getSingleOrder,
  getCurrentUserOrders,
  createOrder,
  updateOrder,
};
