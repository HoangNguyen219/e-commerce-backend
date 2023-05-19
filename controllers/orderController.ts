import Order, { ISingleOrderItem } from '../models/Order';
import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { BadRequestError, NotFoundError } from '../errors';
import { checkPermissions } from '../utils';
import User, { IUser } from '../models/User';

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
  if (paymentMethod === 'paypal') {
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
  const { sort, total, processStatus, paymentMethod, paymentStatus, customer } =
    req.query;
  const queryObject: Record<string, any> = {};

  if (processStatus && processStatus !== 'all') {
    queryObject.processStatus = processStatus;
  }

  if (paymentMethod && paymentMethod !== 'all') {
    queryObject.paymentMethod = paymentMethod;
  }

  if (paymentStatus && paymentStatus !== 'all') {
    queryObject.paymentStatus = paymentStatus;
  }

  if (total) {
    queryObject.total = { $lte: Number(total) };
  }

  if (customer) {
    let user: IUser[] = [];
    let userQueryObject: Record<string, any> = {};
    userQueryObject.$or = [
      { name: { $regex: customer, $options: 'i' } },
      { email: { $regex: customer, $options: 'i' } },
    ];
    user = await User.find(userQueryObject).select('id');
    queryObject.userId = { $in: user.map(u => u.id) };
  }

  let result = Order.find(queryObject).populate({
    path: 'userId',
    select: 'name email',
  });
  // chain sort conditions
  if (sort === 'latest') {
    result = result.sort('-createdAt');
  }
  if (sort === 'oldest') {
    result = result.sort('createdAt');
  }
  if (sort === 'total-lowest') {
    result = result.sort('total');
  }
  if (sort === 'total-highest') {
    result = result.sort('-total');
  }

  // setup pagination
  const page = Number(req.query.page) || 1;
  let limit = Number(req.query.limit) || 10;
  limit = limit > 10 ? 10 : limit;
  const skip = (page - 1) * limit;

  result = result.skip(skip).limit(limit);

  const orders = await result.exec();

  const totalOrders = await Order.countDocuments(queryObject);
  const numOfPages = Math.ceil(totalOrders / limit);
  res.status(StatusCodes.OK).json({ orders, totalOrders, numOfPages });
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

  const { processStatus } = req.body;
  let paymentStatus = '';
  switch (processStatus) {
    case 'delivered':
      paymentStatus = 'paid';
      break;
    case 'canceled':
      paymentStatus = 'canceled';
      break;
    case 'returned':
      paymentStatus = 'refunded';
      break;
    default:
      break;
  }
  if (paymentStatus) {
    order.paymentStatus = paymentStatus;
  }
  order.processStatus = processStatus;

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
