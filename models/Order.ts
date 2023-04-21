import mongoose, { Schema, Document, Types } from 'mongoose';

interface SingleOrderItem extends Document {
  color: string;
  price: Number;
  quantity: Number;
  subtotal: Number;
  productId: Schema.Types.ObjectId;
}

const SingleOrderItemSchema = new mongoose.Schema<SingleOrderItem>({
  color: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true },
  subtotal: { type: Number, required: true },
  productId: {
    type: Types.ObjectId,
    ref: 'Product',
    required: true,
  },
});

interface Order extends Document {
  shippingFee: Number;
  subtotal: Number;
  total: Number;
  orderItems: [Schema<SingleOrderItem>];
  status: string;
  userId: Schema.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const OrderSchema = new mongoose.Schema<Order>(
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
  },
  { timestamps: true },
);

module.exports = mongoose.model<Order>('Order', OrderSchema);
