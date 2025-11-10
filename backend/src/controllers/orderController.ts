import type { Request, Response } from 'express';
import { OrderModel } from '../models/orderModel';
import { CartModel } from '../models/cartModel';
import { ProductModel } from '../models/productModel';
import type { AuthRequest } from '../middleware/authMiddleware';
import stripe from '../config/stripe';

export const orderController = {
  // Create payment intent
  async createPaymentIntent(req: Request, res: Response) {
    try {
      const userId = (req as AuthRequest).user!.userId;
      const { shippingAddress } = req.body;

      if (!shippingAddress) {
        return res.status(400).json({ error: 'Shipping address is required' });
      }

      // Get cart items
      const cartItems = await CartModel.getByUserId(userId);

      if (cartItems.length === 0) {
        return res.status(400).json({ error: 'Cart is empty' });
      }

      // Validate stock
      const outOfStock = await CartModel.validateStock(userId);
      if (outOfStock.length > 0) {
        return res.status(400).json({
          error: 'Some items are out of stock',
          outOfStockItems: outOfStock
        });
      }

      // Calculate total
      const total = await CartModel.getCartTotal(userId);

      // Create Stripe payment intent
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(total * 100), // Convert to cents
        currency: 'usd',
        metadata: {
          userId: userId.toString()
        }
      });

      // Create order in database
      const order = await OrderModel.create(
        userId,
        total,
        paymentIntent.id,
        shippingAddress
      );

      // Add order items
      const orderItems = cartItems.map(item => ({
        productId: item.product_id,
        quantity: item.quantity,
        price: item.product_price!
      }));

      await OrderModel.addItems(order!.id, orderItems);

      res.json({
        clientSecret: paymentIntent.client_secret,
        orderId: order!.id,
        total: total.toFixed(2)
      });
    } catch (error) {
      console.error('Create payment intent error:', error);
      res.status(500).json({ error: 'Failed to create payment intent' });
    }
  },

  // Confirm payment and complete order
  async confirmPayment(req: Request, res: Response) {
    try {
      const userId = (req as AuthRequest).user!.userId;
      const { paymentIntentId } = req.body;

      if (!paymentIntentId) {
        return res.status(400).json({ error: 'Payment intent ID is required' });
      }

      // Verify payment with Stripe
      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

      if (paymentIntent.status !== 'succeeded') {
        return res.status(400).json({ error: 'Payment not successful' });
      }

      // Get order
      const order = await OrderModel.getByPaymentIntent(paymentIntentId);

      if (!order) {
        return res.status(404).json({ error: 'Order not found' });
      }

      if (order.user_id !== userId) {
        return res.status(403).json({ error: 'Unauthorized' });
      }

      // Update order status
      await OrderModel.updateStatus(order.id, 'paid');

      // Update product stock
      const orderDetails = await OrderModel.getById(order.id);
      for (const item of orderDetails!.items) {
        await ProductModel.updateStock(item.product_id, item.quantity);
      }

      // Clear user's cart
      await CartModel.clearCart(userId);

      res.json({
        message: 'Payment confirmed successfully',
        orderId: order.id
      });
    } catch (error) {
      console.error('Confirm payment error:', error);
      res.status(500).json({ error: 'Failed to confirm payment' });
    }
  },

  // Get order by ID
  async getOrderById(req: Request, res: Response) {
    try {
      const userId = (req as AuthRequest).user!.userId;
      const orderId = parseInt(req.params.id!);

      const order = await OrderModel.getById(orderId);

      if (!order) {
        return res.status(404).json({ error: 'Order not found' });
      }

      // Check if user owns this order
      if (order.user_id !== userId) {
        return res.status(403).json({ error: 'Unauthorized' });
      }

      res.json({ order });
    } catch (error) {
      console.error('Get order error:', error);
      res.status(500).json({ error: 'Failed to fetch order' });
    }
  },

  // Get user's orders
  async getUserOrders(req: Request, res: Response) {
    try {
      const userId = (req as AuthRequest).user!.userId;

      const orders = await OrderModel.getByUserId(userId);

      res.json({ orders });
    } catch (error) {
      console.error('Get user orders error:', error);
      res.status(500).json({ error: 'Failed to fetch orders' });
    }
  },

  // Get all orders (Admin only)
  async getAllOrders(req: Request, res: Response) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 50;
      const offset = (page - 1) * limit;

      const { orders, total } = await OrderModel.getAll(limit, offset);

      res.json({
        orders,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      console.error('Get all orders error:', error);
      res.status(500).json({ error: 'Failed to fetch orders' });
    }
  },

  // Update order status (Admin only)
  async updateOrderStatus(req: Request, res: Response) {
    try {
      const orderId = parseInt(req.params.id!);
      const { status } = req.body;

      const validStatuses = ['pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled'];

      if (!validStatuses.includes(status)) {
        return res.status(400).json({ 
          error: 'Invalid status',
          validStatuses 
        });
      }

      const order = await OrderModel.updateStatus(orderId, status);

      if (!order) {
        return res.status(404).json({ error: 'Order not found' });
      }

      res.json({
        message: 'Order status updated',
        order
      });
    } catch (error) {
      console.error('Update order status error:', error);
      res.status(500).json({ error: 'Failed to update order status' });
    }
  },

  // Stripe webhook handler
  async handleWebhook(req: Request, res: Response) {
    const sig = req.headers['stripe-signature'] as string;

    let event;

    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET!
      );
    } catch (err: any) {
      console.error('Webhook signature verification failed:', err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle the event
    switch (event.type) {
      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object;
        console.log('PaymentIntent was successful:', paymentIntent.id);
        
        // Update order status
        const order = await OrderModel.getByPaymentIntent(paymentIntent.id);
        if (order && order.status === 'pending') {
          await OrderModel.updateStatus(order.id, 'paid');
        }
        break;

      case 'payment_intent.payment_failed':
        const failedIntent = event.data.object;
        console.log('PaymentIntent failed:', failedIntent.id);
        
        // Update order status to failed
        const failedOrder = await OrderModel.getByPaymentIntent(failedIntent.id);
        if (failedOrder) {
          await OrderModel.updateStatus(failedOrder.id, 'failed');
        }
        break;

      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    res.json({ received: true });
  }
};