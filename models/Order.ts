import mongoose, { Schema, Document, Types } from 'mongoose';

export interface ISingleOrderItem extends Document {
  color: string;
  price: Number;
  quantity: Number;
  itemTotal: Number;
  productId: Schema.Types.ObjectId;
}

const SingleOrderItemSchema = new mongoose.Schema<ISingleOrderItem>({
  color: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true },
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
  clientSecret: string;
  paymentIntentId: string;
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
    clientSecret: {
      type: String,
      required: true,
    },
    paymentIntentId: {
      type: String,
    },
  },
  { timestamps: true },
);

export default mongoose.model<IOrder>('Order', OrderSchema);
