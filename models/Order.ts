import mongoose, { Schema, Document, Types } from 'mongoose';
import Address from './Address';
import User from './User';
import Product from './Product';

export interface ISingleOrderItem extends Document {
  color: string;
  price: Number;
  amount: Number;
  itemTotal: Number;
  productId: Schema.Types.ObjectId;
}

const SingleOrderItemSchema = new mongoose.Schema<ISingleOrderItem>({
  color: {
    type: String,
    required: true,
    enum: [
      'black',
      'white',
      'gray',
      'brown',
      'red',
      'purple',
      'green',
      'olive',
      'yellow',
      'navy',
      'blue',
    ],
  },
  price: { type: Number, required: true },
  amount: { type: Number, required: true },
  itemTotal: { type: Number, required: true },
  productId: {
    type: Types.ObjectId,
    ref: 'Product',
    required: true,
    validate: {
      validator: async function (value: string) {
        try {
          const product = await Product.findById(value);
          return product !== null;
        } catch (err) {
          return false;
        }
      },
      message: props => `${props.value} is not a valid product Id`,
    },
  },
});

interface IOrder extends Document {
  shippingFee: Number;
  subtotal: Number;
  total: Number;
  orderItems: [Schema<ISingleOrderItem>];
  processStatus: string;
  paymentStatus: string;
  userId: Schema.Types.ObjectId;
  addressId: Schema.Types.ObjectId;
  paymentMethod: string;
  createdAt: Date;
  updatedAt: Date;
}

const OrderSchema = new mongoose.Schema<IOrder>(
  {
    shippingFee: {
      type: Number,
      required: true,
    },
    subtotal: {
      type: Number,
      required: true,
    },
    total: {
      type: Number,
      required: true,
    },
    orderItems: [SingleOrderItemSchema],
    processStatus: {
      type: String,
      enum: [
        'pending',
        'processing',
        'shipped',
        'delivered',
        'cancelled',
        'returned',
      ],
      default: 'pending',
    },
    paymentStatus: {
      type: String,
      enum: ['paid', 'unpaid', 'refunded'],
      default: 'unpaid',
    },
    userId: {
      type: Types.ObjectId,
      ref: 'User',
      required: true,
      validate: {
        validator: async function (value: string) {
          try {
            const user = await User.findById(value);
            return user !== null;
          } catch (err) {
            return false;
          }
        },
        message: props => `${props.value} is not a valid user Id`,
      },
    },
    addressId: {
      type: Types.ObjectId,
      ref: 'Address',
      required: true,
      validate: {
        validator: async function (value: string) {
          try {
            const address = await Address.findById(value);
            return address !== null;
          } catch (err) {
            return false;
          }
        },
        message: props => `${props.value} is not a valid address Id`,
      },
    },
    paymentMethod: {
      type: String,
      enum: ['COD', 'PAYPAL'],
      required: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

export default mongoose.model<IOrder>('Order', OrderSchema);
