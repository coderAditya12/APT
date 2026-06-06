import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { Order } from '../models/Order';
import { addClient } from '../services/sseManager';

export const streamOrders = (req: Request, res: Response)=>{
  addClient(res);
  // Connection stays open — do NOT call res.end()
};


export const getAllOrders = async (_req: Request, res: Response)=> {
  try {
    const orders = await Order.find().sort({ created_at: -1 });
    res.json(orders);
  } catch {
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
};

export const getOrderById = async (req: Request, res: Response): Promise<void> => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    res.status(400).json({ error: 'Invalid order ID' });
    return;
  }
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      res.status(404).json({ error: 'Order not found' });
      return;
    }
    res.json(order);
  } catch {
    res.status(500).json({ error: 'Failed to fetch order' });
  }
};

export const createOrder = async (req: Request, res: Response): Promise<void> => {
  const { customer_name, product_name, status } = req.body;

  if (!customer_name || !product_name) {
    res.status(400).json({ error: 'customer_name and product_name are required' });
    return;
  }

  try {
    const order = await Order.create({ customer_name, product_name, status });
    res.status(201).json(order);
  } catch {
    res.status(500).json({ error: 'Failed to create order' });
  }
};

export const updateOrderStatus = async (req: Request, res: Response): Promise<void> => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    res.status(400).json({ error: 'Invalid order ID' });
    return;
  }

  const { status } = req.body;
  const validStatuses = ['pending', 'shipped', 'delivered'];

  if (!status || !validStatuses.includes(status)) {
    res.status(400).json({ error: `status must be one of: ${validStatuses.join(', ')}` });
    return;
  }

  try {
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );
    if (!order) {
      res.status(404).json({ error: 'Order not found' });
      return;
    }
    res.json(order);
  } catch {
    res.status(500).json({ error: 'Failed to update order' });
  }
};

export const deleteOrder = async (req: Request, res: Response): Promise<void> => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    res.status(400).json({ error: 'Invalid order ID' });
    return;
  }

  try {
    const order = await Order.findByIdAndDelete(req.params.id);
    if (!order) {
      res.status(404).json({ error: 'Order not found' });
      return;
    }
    res.json({ message: 'Order deleted', id: req.params.id });
  } catch {
    res.status(500).json({ error: 'Failed to delete order' });
  }
};
