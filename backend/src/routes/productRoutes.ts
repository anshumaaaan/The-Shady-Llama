import { Router } from "express";
import { productController } from "../controllers/productController";
import { authMiddleware, adminMiddleware } from "../middleware/authMiddleware";

const router = Router();

//public routes
router.get('/', productController.getAll);
router.get('/search', productController.search);
router.get('/categories', productController.getCategories);
router.get('/category/:category', productController.getByCategory);
router.get('/:id', productController.getById);

// Admin only routes
router.post('/', authMiddleware, adminMiddleware, productController.create);
router.put('/:id', authMiddleware, adminMiddleware, productController.update);
router.delete('/:id', authMiddleware, adminMiddleware, productController.delete);

export default router;