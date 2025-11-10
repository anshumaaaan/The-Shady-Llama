import React, { useState, useEffect } from 'react';
import { orderApi } from '../services/api';
import { Order } from '../types';
import toast from 'react-hot-toast';

const OrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await orderApi.getUserOrders();
      setOrders(response.data.orders);
    } catch (error) {
      toast.error('Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'shipped':
        return 'bg-purple-100 text-purple-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="text-xl text-gray-600">Loading orders...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">My Orders</h1>

      {orders.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <p className="text-gray-600 mb-4">You haven't placed any orders yet.</p>
          
            <a href="/"
            className="inline-block bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition"
          >
            Start Shopping
          </a>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order.id} className="bg-white rounded-lg shadow-md overflow-hidden">
              {/* Order Header */}
              <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                <div className="flex flex-wrap justify-between items-center gap-4">
                  <div>
                    <p className="text-sm text-gray-600">
                      Order #{order.id} • {new Date(order.created_at).toLocaleDateString()}
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      {order.shipping_address}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(
                        order.status
                      )}`}
                    >
                      {order.status.toUpperCase()}
                    </span>
                    <p className="text-xl font-bold text-blue-600">
                      ${parseFloat(order.total.toString()).toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Order Items */}
              <div className="px-6 py-4">
                <div className="space-y-3">
                  {order.items.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center gap-4 border-b border-gray-100 pb-3 last:border-b-0"
                    >
                      <div className="w-16 h-16 bg-gray-200 rounded-md flex items-center justify-center flex-shrink-0">
                        {item.product_image_url ? (
                          <img
                            src={item.product_image_url}
                            alt={item.product_name}
                            className="w-full h-full object-cover rounded-md"
                          />
                        ) : (
                          <span className="text-gray-400 text-xl">📦</span>
                        )}
                      </div>

                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-800">
                          {item.product_name}
                        </h3>
                        <p className="text-sm text-gray-600">
                          Quantity: {item.quantity} × ${parseFloat(item.price.toString()).toFixed(2)}
                        </p>
                      </div>

                      <div className="text-right">
                        <p className="font-bold text-gray-800">
                          ${(parseFloat(item.price.toString()) * item.quantity).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* View Details Button */}
                <button
                  onClick={() => setSelectedOrder(selectedOrder?.id === order.id ? null : order)}
                  className="mt-4 text-blue-600 hover:text-blue-800 text-sm font-semibold"
                >
                  {selectedOrder?.id === order.id ? 'Hide Details' : 'View Details'}
                </button>

                {/* Order Details */}
                {selectedOrder?.id === order.id && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">Payment Intent ID:</p>
                        <p className="font-mono text-xs mt-1 break-all">
                          {order.payment_intent_id}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-600">Order Date:</p>
                        <p className="mt-1">
                          {new Date(order.created_at).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrdersPage;