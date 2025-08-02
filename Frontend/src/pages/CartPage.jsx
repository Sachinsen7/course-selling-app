import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../hooks/useCart';
import Button from '../components/common/Button';
import { PUBLIC_ROUTES, PROTECTED_ROUTES } from '../routes';

function CartPage() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { 
    cartItems, 
    cartCount, 
    removeFromCart, 
    clearCart, 
    getCartSummary, 
    proceedToCheckout 
  } = useCart();

  const [removingItemId, setRemovingItemId] = useState(null);
  const cartSummary = getCartSummary();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { replace: true });
      return;
    }
  }, [isAuthenticated, navigate]);

  const handleRemoveItem = async (courseId, courseTitle) => {
    setRemovingItemId(courseId);
    await removeFromCart(courseId);
    setRemovingItemId(null);
  };

  const handleCheckout = () => {
    console.log('Checkout clicked, cart items:', cartItems);
    console.log('Cart summary:', cartSummary);

    if (cartItems.length === 0) {
      alert('Your cart is empty. Add some courses before proceeding to checkout.');
      return;
    }

    console.log('Navigating to checkout...');
    navigate(PROTECTED_ROUTES.checkout, {
      state: {
        cartItems,
        cartSummary
      }
    });
  };

  if (!isAuthenticated) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Shopping Cart</h1>
            <div className="flex items-center space-x-4">
              <span className="text-gray-600">
                {cartCount} {cartCount === 1 ? 'item' : 'items'}
              </span>
              <Link
                to={PUBLIC_ROUTES.courseListing}
                className="text-primary-main hover:text-primary-light transition-colors duration-200"
              >
                Continue Shopping
              </Link>
            </div>
          </div>

          {cartItems.length === 0 ? (
            /* Empty Cart State */
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-16"
            >
              <div className="mb-6">
                <svg
                  className="w-24 h-24 mx-auto text-gray-300"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m0 0h8m-8 0a2 2 0 100 4 2 2 0 000-4zm8 0a2 2 0 100 4 2 2 0 000-4z"
                  />
                </svg>
              </div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                Your cart is empty
              </h2>
              <p className="text-gray-600 mb-8 max-w-md mx-auto">
                Looks like you haven't added any courses to your cart yet. Start exploring our courses!
              </p>
              <Button
                text="Browse Courses"
                onClick={() => navigate(PUBLIC_ROUTES.courseListing)}
                className="px-8 py-3"
              />
            </motion.div>
          ) : (
            /* Cart with Items */
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Cart Items */}
              <div className="lg:col-span-2">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                  <div className="p-6 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                      <h2 className="text-lg font-semibold text-gray-900">
                        Cart Items ({cartCount})
                      </h2>
                      {cartItems.length > 0 && (
                        <button
                          onClick={clearCart}
                          className="text-red-600 hover:text-red-700 text-sm font-medium transition-colors duration-200"
                        >
                          Clear All
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="divide-y divide-gray-200">
                    <AnimatePresence>
                      {cartItems.map((item) => (
                        <motion.div
                          key={item._id}
                          layout
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 20 }}
                          transition={{ duration: 0.3 }}
                          className="p-6"
                        >
                          <div className="flex items-start space-x-4">
                            <img
                              src={item.imageUrl || 'https://placehold.co/120x80/F9FAFB/1B3C53?text=Course'}
                              alt={item.title}
                              className="w-20 h-14 object-cover rounded-md flex-shrink-0"
                            />
                            
                            <div className="flex-1 min-w-0">
                              <h3 className="text-lg font-medium text-gray-900 mb-1">
                                {item.title}
                              </h3>
                              <p className="text-gray-600 text-sm mb-2 line-clamp-2">
                                {item.description}
                              </p>
                              <div className="flex items-center space-x-4 text-sm text-gray-500">
                                {item.level && (
                                  <span className="px-2 py-1 bg-gray-100 rounded-full">
                                    {item.level}
                                  </span>
                                )}
                                {item.duration && (
                                  <span>{item.duration}h</span>
                                )}
                                {item.category && (
                                  <span>{item.category}</span>
                                )}
                              </div>
                            </div>

                            <div className="flex flex-col items-end space-y-2">
                              <span className="text-xl font-bold text-gray-900">
                                ₹{item.price?.toFixed(2) || '0.00'}
                              </span>
                              <button
                                onClick={() => handleRemoveItem(item._id, item.title)}
                                disabled={removingItemId === item._id}
                                className="text-red-600 hover:text-red-700 text-sm font-medium transition-colors duration-200 disabled:opacity-50"
                              >
                                {removingItemId === item._id ? 'Removing...' : 'Remove'}
                              </button>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                </div>
              </div>

              {/* Order Summary */}
              <div className="lg:col-span-1">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 sticky top-24">
                  <div className="p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">
                      Order Summary
                    </h2>
                    
                    <div className="space-y-3 mb-6">
                      <div className="flex justify-between text-gray-600">
                        <span>Subtotal ({cartCount} items)</span>
                        <span>₹{cartSummary.subtotal.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-gray-600">
                        <span>Tax</span>
                        <span>₹{cartSummary.tax.toFixed(2)}</span>
                      </div>
                      <div className="border-t border-gray-200 pt-3">
                        <div className="flex justify-between text-lg font-semibold text-gray-900">
                          <span>Total</span>
                          <span>₹{cartSummary.total.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>

                    <Button
                      text="Proceed to Checkout"
                      onClick={handleCheckout}
                      className="w-full mb-4"
                    />

                    <div className="text-center">
                      <Link
                        to={PUBLIC_ROUTES.courseListing}
                        className="text-primary-main hover:text-primary-light text-sm transition-colors duration-200"
                      >
                        ← Continue Shopping
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}

export default CartPage;
