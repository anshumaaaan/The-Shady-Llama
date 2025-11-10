import { Router } from "express";
import { cartController } from "../controllers/cartController";
import { authMiddleware } from "../middleware/authMiddleware";

const router = Router();

router.use(authMiddleware);

router.get('/', cartController.getCart);
router.get('/summary', cartController.getCartSummary);
router.get('/validate', cartController.validateCart);
router.post('/add', cartController.addItem);
router.put('/:productId', cartController.updateQuantity);
router.delete('/:productId', cartController.removeItem);
router.delete('/', cartController.clearCart);

export default router;