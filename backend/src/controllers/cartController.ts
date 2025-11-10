import type { Request, Response } from "express";
import type { AuthRequest } from "../middleware/authMiddleware.ts";
import { CartModel } from "../models/cartModel";
import { ProductModel } from "../models/productModel";

export const cartController ={
    // add items to cart
    async addItem(req: Request, res: Response){
        try{
            const userId = (req as AuthRequest).user!.userId;
            const {productId, quantity} = req.body;

            // validation
            if(!productId || !quantity){
                return res.json({
                    error: 'Please provide productId and quantity'
                });
            }

            if(quantity <= 0){
                return res.status(400).json({
                    error: 'Quantity must be greater than 0'
                });
            }

            // check if prod exist
            const product = await ProductModel.getById(productId);
            if(!product){
                return res.status(404).json({ error: 'Product not found' });
            }

            // stock availablility
            if(product.stock < quantity){
                return res.status(400).json({
                    error: 'Only ${product.stock} items available in stock'
                });
            }

            const cartItem = await CartModel.addItem(userId, productId, quantity);

            res.status(201).json({
                message: 'Item added to cart',
                cartItem
            });
        } catch (error) {
            console.error('Add to cart error:', error);
            res.status(500).json({ error: 'Failed to add item to cart' });
        }
    },

    // get user's cart
    async getCart(req: Request, res:Response){
        try{
            const userId = (req as AuthRequest).user!.userId;

            const cartItems = await CartModel.getByUserId(userId);
            const total = await CartModel.getCartTotal(userId);
            const itemCount = await CartModel.getCartCount(userId);

            res.json({
                cartItems,
                summary: {
                    itemCount,
                    total: total.toFixed(2)
                }
            });
        } catch(error){
            console.error('Get cart error:', error);
            res.status(500).json({ error: 'Failed to fetch cart' });
        }
    },

    // update cart item quantity
    async updateQuantity(req:Request, res:Response){
        try{
            const userId = (req as AuthRequest).user!.userId;
            const productId = parseInt(req.params.productId!);
            const {quantity} = req.body;

            // validation 
            if (quantity === undefined) {
                return res.status(400).json({ error: 'Please provide quantity' });
            }

            if (quantity < 0) {
                return res.status(400).json({
                    error: 'Quantity cannot be negative'
                });
            }

            const product = await ProductModel.getById(productId);
            if (!product) {
                return res.status(404).json({ error: 'Product not found' });
            }

            if (quantity > 0 && product.stock < quantity) {
                return res.status(400).json({
                    error: `Only ${product.stock} items available in stock`
                });
            }

            const cartItem = await CartModel.updateQuantity(userId, productId, quantity);

            if(!cartItem){
                return res.status(404).json({ error: 'Cart item not found' });
            }

            res.json({
                message: quantity === 0 ? 'Item removed from cart' : 'Cart updated',
                cartItem
            });
        } catch(error) {
            console.error('Update cart error:', error);
            res.status(500).json({ error: 'Failed to update cart' });
        }
    },

    // remove item from cart
    async removeItem(req: Request, res: Response){
        try{
            const userId = (req as AuthRequest).user!.userId;
            const productId = parseInt(req.params.productId!);

            const cartItem = await CartModel.removeItem(userId, productId);

            if(!cartItem){
                return res.status(404).json({error: 'Cart item not found'});
            }

            res.json({
                message: 'Item removed from cart',
                cartItem
            });
        } catch (error) {
            console.error('Remove from cart error:', error);
            res.status(500).json({ error: 'Failed to remove item from cart' });
        }
    },
    
    // clear cart
    async clearCart(req: Request, res: Response){
        try{
            const userId = (req as AuthRequest).user!.userId;

            await CartModel.clearCart(userId);

            res.json({message: 'Cart cleared'});
        } catch(error){
            console.log('Clear cart error: ', error);
            res.status(500).json({error: 'Failed to clear cart'})
        }
    },

    // get cart summary
    async getCartSummary(req: Request, res: Response) {
    try {
      const userId = (req as AuthRequest).user!.userId;

      const itemCount = await CartModel.getCartCount(userId);
      const total = await CartModel.getCartTotal(userId);

      res.json({
        itemCount,
        total: total.toFixed(2)
      });
    } catch (error) {
      console.error('Get cart summary error:', error);
      res.status(500).json({ error: 'Failed to fetch cart summary' });
    }
  },

  // Validate cart (check stock availability)
  async validateCart(req: Request, res: Response) {
    try {
      const userId = (req as AuthRequest).user!.userId;

      const outOfStock = await CartModel.validateStock(userId);

      if (outOfStock.length > 0) {
        return res.status(400).json({
          valid: false,
          message: 'Some items in your cart are out of stock',
          outOfStockItems: outOfStock
        });
      }

      res.json({
        valid: true,
        message: 'All items are available'
      });
    } catch (error) {
      console.error('Validate cart error:', error);
      res.status(500).json({ error: 'Failed to validate cart' });
    }
  }
};