import { Schema, model, Document } from 'mongoose';

export type OrderStatus = 'pending' | 'shipped' | 'delivered';

export interface IOrder extends Document {
  customer_name: string;
  product_name: string;
  status: OrderStatus;
  created_at: Date;
  updated_at: Date;
}

const OrderSchema = new Schema<IOrder>(
  {
    customer_name: { type: String, required: true, trim: true },
    product_name: { type: String, required: true, trim: true },
    status: {
      type: String,
      enum: ['pending', 'shipped', 'delivered'],
      default: 'pending',
    },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  }
);

export const Order = model<IOrder>('Order', OrderSchema);
