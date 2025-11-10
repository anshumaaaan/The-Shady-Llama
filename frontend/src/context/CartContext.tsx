import React, { createContext, useState, useContext, useEffect } from 'react';
import { CartItem } from '../types';
import { cartApi } from '../services/api';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

interface CartContextType {
  cartItems: CartItem[];
  itemCount: number;
  total: string;
  addToCart: (productId: number, quantity: number) => Promise<void>;
  updateQuantity: (productId: number, quantity: number) => Promise<void>;
  removeFromCart: (productId: number) => Promise<void>;
  clearCart: () => Promise<void>;
  refreshCart: () => Promise<void>;
  loading: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [itemCount, setItemCount] = useState(0);
  const [total, setTotal] = useState('0.00');
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const refreshCart = async () => {
    if (!user) {
      setCartItems([]);
      setItemCount(0);
      setTotal('0.00');
      return;
    }

    try {
      setLoading(true);
      const response = await cartApi.getCart();
      setCartItems(response.data.cartItems);
      setItemCount(response.data.summary.itemCount);
      setTotal(response.data.summary.total);
    } catch (error) {
      console.error('Error fetching cart:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshCart();
  }, [user]);

  const addToCart = async (productId: number, quantity: number) => {
    try {
      await cartApi.addItem(productId, quantity);
      await refreshCart();
      toast.success('Added to cart!');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to add to cart');
      throw error;
    }
  };

  const updateQuantity = async (productId: number, quantity: number) => {
    try {
      await cartApi.updateQuantity(productId, quantity);
      await refreshCart();
      toast.success('Cart updated!');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to update cart');
      throw error;
    }
  };

  const removeFromCart = async (productId: number) => {
    try {
      await cartApi.removeItem(productId);
      await refreshCart();
      toast.success('Item removed from cart');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to remove item');
      throw error;
    }
  };

  const clearCart = async () => {
    try {
      await cartApi.clearCart();
      await refreshCart();
      toast.success('Cart cleared');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to clear cart');
      throw error;
    }
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        itemCount,
        total,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        refreshCart,
        loading,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};