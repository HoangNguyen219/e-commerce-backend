import mongoose, { Schema, Document, Types } from 'mongoose';

export interface ISingleOrderItem extends Document {
  color: string;
  price: Number;
  amount: Number;
  itemTotal: Number;
  productId: Schema.Types.ObjectId;
}

const SingleOrderItemSchema = new mongoose.Schema<ISingleOrderItem>({
  color: { type: String, required: true },
  price: { type: Number, required: true },
  amount: { type: Number, required: true },
  itemTotal: { type: Number, required: true },
  productId: {
    type: Types.ObjectId,
    ref: 'Product',
    required: true,
  },
});

interface IOrder extends Document {
  shippingFee: Number;
  subtotal: Number;
  total: Number;
  orderItems: [Schema<ISingleOrderItem>];
  status: string;
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
    status: {
      type: String,
      enum: ['pending', 'failed', 'paid', 'delivered', 'canceled'],
      default: 'pending',
    },
    userId: {
      type: Types.ObjectId,
      ref: 'User',
      required: true,
    },
    addressId: {
      type: Types.ObjectId,
      ref: 'Address',
      required: true,
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
