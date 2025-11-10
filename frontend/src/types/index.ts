export interface User {
  id: number;
  email: string;
  fullName: string;
  role: string;
}

export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  stock: number;
  category: string;
  image_url: string;
  created_at: string;
}

export interface CartItem {
  id: number;
  user_id: number;
  product_id: number;
  quantity: number;
  product_name: string;
  product_price: number;
  product_stock: number;
  product_image_url: string;
  product_description: string;
}

export interface Order {
  id: number;
  user_id: number;
  total: number;
  status: string;
  payment_intent_id: string;
  shipping_address: string;
  created_at: string;
  items: OrderItem[];
}

export interface OrderItem {
  id: number;
  order_id: number;
  product_id: number;
  quantity: number;
  price: number;
  product_name: string;
  product_image_url: string;
}

export interface AuthResponse {
  token: string;
  user: User;
  message: string;
}

export interface ApiError {
  error: string;
}