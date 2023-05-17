import Order, { ISingleOrderItem } from '../models/Order';
import Product from '../models/Product';
import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { BadRequestError, NotFoundError } from '../errors';
import { checkPermissions } from '../utils';
import Address from '../models/Address';

const createOrder = async (req: Request, res: Response) => {
  const { cartItems, shippingFee, addressId, paymentMethod } = req.body;

  if (!cartItems || cartItems.length < 1) {
    throw new BadRequestError('No cart items provided');
  }
  if (!shippingFee) {
    throw new BadRequestError('Please provide shipping fee');
  }

  let orderItems: ISingleOrderItem[] = [];
  let subtotal = 0;

  const adrress = await Address.findOne({ _id: addressId });
  if (!adrress) {
    throw new NotFoundError(`No address with id : ${addressId}`);
  }

  for (const item of cartItems) {
    const dbProduct = await Product.findOne({ _id: item.productId });
    if (!dbProduct) {
      throw new NotFoundError(`No product with id : ${item.productId}`);
    }

    item.itemTotal = item.price * item.amount;
    // add item to order
    orderItems = [...orderItems, item];
    // calculate subtotal
    subtotal += item.itemTotal;
  }
  // calculate total
  const total = shippingFee + subtotal;
  const order = await Order.create({
    orderItems,
    total,
    subtotal,
    shippingFee,
    addressId,
    paymentMethod,
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

  const order = await Order.findOne({ _id: orderId });
  if (!order) {
    throw new NotFoundError(`No order with id : ${orderId}`);
  }
  checkPermissions(req.user, order.userId);

  order.status = 'paid';
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
