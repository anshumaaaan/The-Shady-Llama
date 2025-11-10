import axios from 'axios';
import { AuthResponse, Product, CartItem, Order } from '../types';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_URL,
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth APIs
export const authApi = {
  register: (email: string, password: string, fullName: string) =>
    api.post<AuthResponse>('/auth/register', { email, password, fullName }),
  
  login: (email: string, password: string) =>
    api.post<AuthResponse>('/auth/login', { email, password }),
  
  getProfile: () =>
    api.get<{ user: any }>('/auth/profile'),
};

// Product APIs
export const productApi = {
  getAll: (page = 1, limit = 12) =>
    api.get<{ products: Product[]; pagination: any }>('/products', {
      params: { page, limit },
    }),
  
  getById: (id: number) =>
    api.get<{ product: Product }>(`/products/${id}`),
  
  search: (query: string, page = 1, limit = 12) =>
    api.get<{ products: Product[]; pagination: any }>('/products/search', {
      params: { q: query, page, limit },
    }),
  
  getByCategory: (category: string, page = 1, limit = 12) =>
    api.get<{ products: Product[]; pagination: any }>(`/products/category/${category}`, {
      params: { page, limit },
    }),
  
  getCategories: () =>
    api.get<{ categories: string[] }>('/products/categories'),
  
  create: (data: any) =>
    api.post<{ product: Product }>('/products', data),
  
  update: (id: number, data: any) =>
    api.put<{ product: Product }>(`/products/${id}`, data),
  
  delete: (id: number) =>
    api.delete(`/products/${id}`),
};

// Cart APIs
export const cartApi = {
  getCart: () =>
    api.get<{ cartItems: CartItem[]; summary: { itemCount: number; total: string } }>('/cart'),
  
  addItem: (productId: number, quantity: number) =>
    api.post('/cart/add', { productId, quantity }),
  
  updateQuantity: (productId: number, quantity: number) =>
    api.put(`/cart/${productId}`, { quantity }),
  
  removeItem: (productId: number) =>
    api.delete(`/cart/${productId}`),
  
  clearCart: () =>
    api.delete('/cart'),
  
  getCartSummary: () =>
    api.get<{ itemCount: number; total: string }>('/cart/summary'),
  
  validateCart: () =>
    api.get('/cart/validate'),
};

// Order APIs
export const orderApi = {
  createPaymentIntent: (shippingAddress: string) =>
    api.post<{ clientSecret: string; orderId: number; total: string }>('/orders/create-payment-intent', {
      shippingAddress,
    }),
  
  confirmPayment: (paymentIntentId: string) =>
    api.post('/orders/confirm-payment', { paymentIntentId }),
  
  getUserOrders: () =>
    api.get<{ orders: Order[] }>('/orders/my-orders'),
  
  getOrderById: (id: number) =>
    api.get<{ order: Order }>(`/orders/${id}`),
  
  getAllOrders: (page = 1, limit = 50) =>
    api.get<{ orders: Order[]; pagination: any }>('/orders', {
      params: { page, limit },
    }),
  
  updateOrderStatus: (id: number, status: string) =>
    api.put(`/orders/${id}/status`, { status }),
};

export default api;