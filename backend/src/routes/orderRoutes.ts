import { Router } from 'express';
import { orderController } from '../controllers/orderController';
import { authMiddleware, adminMiddleware } from '../middleware/authMiddleware';
import express from 'express';

const router = Router();

// Webhook route (must be before express.json() middleware)
router.post(
  '/webhook',
  express.raw({ type: 'application/json' }),
  orderController.handleWebhook
);


router.post('/create-payment-intent', authMiddleware, orderController.createPaymentIntent);
router.post('/confirm-payment', authMiddleware, orderController.confirmPayment);
router.get('/my-orders', authMiddleware, orderController.getUserOrders);
router.get('/:id', authMiddleware, orderController.getOrderById);

// Admin routes
router.get('/', authMiddleware, adminMiddleware, orderController.getAllOrders);
router.put('/:id/status', authMiddleware, adminMiddleware, orderController.updateOrderStatus);

export default router;