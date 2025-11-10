import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { useCart } from '../context/CartContext';
import { orderApi } from '../services/api';
import toast from 'react-hot-toast';

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLIC_KEY!);

const CheckoutForm: React.FC = () => {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();
  const { cartItems, total, refreshCart } = useCart();

  const [loading, setLoading] = useState(false);
  const [clientSecret, setClientSecret] = useState('');
  const [orderId, setOrderId] = useState<number | null>(null);
  const [shippingAddress, setShippingAddress] = useState({
    fullName: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'US',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setShippingAddress({
      ...shippingAddress,
      [e.target.name]: e.target.value,
    });
  };

  const createPaymentIntent = async () => {
    const addressString = `${shippingAddress.fullName}, ${shippingAddress.address}, ${shippingAddress.city}, ${shippingAddress.state} ${shippingAddress.zipCode}, ${shippingAddress.country}`;

    try {
      const response = await orderApi.createPaymentIntent(addressString);
      setClientSecret(response.data.clientSecret);
      setOrderId(response.data.orderId);
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to create payment intent');
      throw error;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    // Validate shipping address
    if (!shippingAddress.fullName || !shippingAddress.address || !shippingAddress.city || !shippingAddress.state || !shippingAddress.zipCode) {
      toast.error('Please fill in all shipping address fields');
      return;
    }

    setLoading(true);

    try {
      // Create payment intent if not already created
      if (!clientSecret) {
        await createPaymentIntent();
      }

      // Confirm card payment
      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement)!,
          billing_details: {
            name: shippingAddress.fullName,
            address: {
              line1: shippingAddress.address,
              city: shippingAddress.city,
              state: shippingAddress.state,
              postal_code: shippingAddress.zipCode,
              country: shippingAddress.country,
            },
          },
        },
      });

      if (error) {
        toast.error(error.message || 'Payment failed');
      } else if (paymentIntent.status === 'succeeded') {
        // Confirm payment on backend
        await orderApi.confirmPayment(paymentIntent.id);
        
        toast.success('Payment successful!');
        await refreshCart();
        navigate(`/orders`);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Payment failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Shipping Address */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Shipping Address</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="block text-gray-700 mb-2">Full Name</label>
            <input
              type="text"
              name="fullName"
              value={shippingAddress.fullName}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-gray-700 mb-2">Address</label>
            <input
              type="text"
              name="address"
              value={shippingAddress.address}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-gray-700 mb-2">City</label>
            <input
              type="text"
              name="city"
              value={shippingAddress.city}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-gray-700 mb-2">State</label>
            <input
              type="text"
              name="state"
              value={shippingAddress.state}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-gray-700 mb-2">ZIP Code</label>
            <input
              type="text"
              name="zipCode"
              value={shippingAddress.zipCode}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-gray-700 mb-2">Country</label>
            <input
              type="text"
              name="country"
              value={shippingAddress.country}
              onChange={handleInputChange}
              required
              disabled
              className="w-full px-4 py-2 border border-gray-300 rounded-md bg-gray-100 cursor-not-allowed"
            />
          </div>
        </div>
      </div>

      {/* Payment Information */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Payment Information</h2>
        
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Card Details</label>
          <div className="border border-gray-300 rounded-md p-3">
            <CardElement
              options={{
                style: {
                  base: {
                    fontSize: '16px',
                    color: '#424770',
                    '::placeholder': {
                      color: '#aab7c4',
                    },
                  },
                  invalid: {
                    color: '#9e2146',
                  },
                },
              }}
            />
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-md p-3 text-sm">
          <p className="text-blue-800">
            <strong>Test Card:</strong> 4242 4242 4242 4242
          </p>
          <p className="text-blue-600">Use any future expiry date and any 3-digit CVC</p>
        </div>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={!stripe || loading}
        className="w-full bg-blue-600 text-white py-3 px-6 rounded-md hover:bg-blue-700 transition font-semibold disabled:bg-gray-300 disabled:cursor-not-allowed"
      >
        {loading ? 'Processing...' : `Pay $${total}`}
      </button>
    </form>
  );
};

const CheckoutPage: React.FC = () => {
  const { cartItems, total } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    if (cartItems.length === 0) {
      toast.error('Your cart is empty');
      navigate('/cart');
    }
  }, [cartItems, navigate]);

  if (cartItems.length === 0) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Checkout</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Checkout Form */}
        <div className="lg:col-span-2">
          <Elements stripe={stripePromise}>
            <CheckoutForm />
          </Elements>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Order Summary</h2>

            <div className="space-y-3 mb-6">
              {cartItems.map((item) => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span className="text-gray-600">
                    {item.product_name} x {item.quantity}
                  </span>
                  <span className="font-semibold">
                    ${(item.product_price * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}

              <div className="border-t border-gray-200 pt-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal:</span>
                  <span className="font-semibold">${total}</span>
                </div>
                <div className="flex justify-between text-sm mt-2">
                  <span className="text-gray-600">Shipping:</span>
                  <span className="text-green-600">FREE</span>
                </div>
                <div className="flex justify-between mt-3 pt-3 border-t border-gray-200">
                  <span className="text-lg font-bold">Total:</span>
                  <span className="text-lg font-bold text-blue-600">${total}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;