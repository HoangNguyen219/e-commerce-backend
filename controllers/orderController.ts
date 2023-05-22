import Order, { ISingleOrderItem } from '../models/Order';
import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { BadRequestError, NotFoundError } from '../errors';
import { checkPermissions } from '../utils';
import User, { IUser } from '../models/User';
import moment from 'moment';

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
    case 'completed':
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

const showStats = async (req: Request, res: Response) => {
  const { startDateStr, endDateStr } = req.query;
  const startDate =
    startDateStr && typeof startDateStr === 'string'
      ? new Date(startDateStr)
      : new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const endDate =
    endDateStr && typeof endDateStr === 'string'
      ? new Date(Date.parse(endDateStr) + 1 * 24 * 60 * 60 * 1000)
      : new Date();

  console.log(startDate);
  console.log(endDate);
  console.log(new Date());

  let revenue = await Order.aggregate([
    {
      $match: {
        createdAt: { $gte: startDate, $lte: endDate },
        processStatus: 'completed',
      },
    },
    {
      $group: {
        _id: {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' },
          day: { $dayOfMonth: '$createdAt' },
        },
        totalRevenue: { $sum: '$total' },
        totalCompletedOrders: { $sum: 1 },
      },
    },
    {
      $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 },
    },
  ]);

  revenue = revenue.map(item => {
    const {
      _id: { year, month, day },
      totalRevenue,
      totalCompletedOrders,
    } = item;
    const date = moment()
      .month(month - 1)
      .year(year)
      .date(day)
      .format('MMM DD YYYY');
    return { date, totalRevenue, totalCompletedOrders };
  });

  const popularProducts = await Order.aggregate([
    {
      $match: {
        processStatus: 'completed',
        createdAt: { $gte: startDate, $lte: endDate },
      },
    },
    {
      $unwind: '$orderItems', // Unwind the orderItems array
    },
    {
      $group: {
        _id: '$orderItems.productId',
        sold: { $sum: '$orderItems.amount' },
        revenue: { $sum: '$orderItems.itemTotal' },
      },
    },
    {
      $lookup: {
        from: 'products',
        localField: '_id',
        foreignField: '_id',
        pipeline: [
          { $project: { name: 1, price: 1, primaryImage: 1 } }, // Select the desired fields
        ],
        as: 'product',
      },
    },

    {
      $sort: { sold: 1 },
    },
    {
      $limit: 7,
    },
  ]);

  interface STATS {
    uncompleted: number;
    completed: number;
    failed: number;
  }

  let statsOrders = await Order.aggregate([
    {
      $match: {
        createdAt: { $gte: startDate, $lte: endDate },
      },
    },
    {
      $group: {
        _id: {
          $cond: {
            if: {
              $in: [
                '$processStatus',
                ['pending', 'processing', 'shipped', 'delivered'],
              ],
            },
            then: 'uncompleted',
            else: {
              $cond: {
                if: { $in: ['$processStatus', ['completed']] },
                then: 'completed',
                else: 'failed',
              },
            },
          },
        },
        count: { $sum: 1 },
      },
    },
  ]);

  let stats: STATS = statsOrders.reduce((acc, curr) => {
    const { _id: title, count } = curr;
    acc[title] = count;
    return acc;
  }, {});

  stats = {
    uncompleted: stats.uncompleted || 0,
    completed: stats.completed || 0,
    failed: stats.failed || 0,
  };

  res.status(StatusCodes.OK).json({ revenue, popularProducts, stats });
};

export {
  getAllOrders,
  getSingleOrder,
  getCurrentUserOrders,
  createOrder,
  updateOrder,
  showStats,
};
