import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useSelector, useDispatch } from 'react-redux';
import { selectIsAuthenticated, selectUser } from '../Redux/slices/authSlice';
import { showModal } from '../Redux/slices/uiSlice';
import { useCart } from '../hooks/useCart';
import { getCourseById, processPayment } from '../services/api';
import Loader from '../components/common/Loader';
import Button from '../components/common/Button';
import { PUBLIC_ROUTES, PROTECTED_ROUTES } from '../routes';

function CheckoutPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const user = useSelector(selectUser);
  const { cartItems, getCartSummary, clearCart } = useCart();
  const location = useLocation();

  // Can come from cart or single course purchase
  const { course: singleCourse, cartItems: passedCartItems, cartSummary: passedCartSummary } = location.state || {};
  const { courseId } = location.state || {};

  const [course, setCourse] = useState(singleCourse || null);
  const [checkoutItems, setCheckoutItems] = useState([]);
  const [orderSummary, setOrderSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [paymentDetails, setPaymentDetails] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardholderName: '',
    billingAddress: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: ''
    }
  });

  useEffect(() => {
    if (!isAuthenticated) {
      dispatch(showModal({
        title: "Login Required",
        message: "You need to log in to proceed to checkout.",
        type: "info",
      }));
      navigate('/login', { replace: true });
      return;
    }

    const initializeCheckout = async () => {
      setLoading(true);
      setError(null);

      try {
        console.log('Initializing checkout with:', {
          passedCartItems,
          passedCartSummary,
          cartItems,
          courseId,
          singleCourse
        });

        // Check if coming from cart with passed items
        if (passedCartItems && passedCartItems.length > 0 && passedCartSummary) {
          console.log('Using passed cart items:', passedCartItems);
          setCheckoutItems(passedCartItems);
          setOrderSummary(passedCartSummary);
        }
        // Check if coming from current cart
        else if (cartItems && cartItems.length > 0) {
          console.log('Using current cart items:', cartItems);
          setCheckoutItems(cartItems);
          setOrderSummary(getCartSummary());
        }
        // Single course checkout
        else if (courseId || singleCourse) {
          console.log('Single course checkout');
          if (singleCourse) {
            const courseItem = {
              ...singleCourse,
              addedAt: new Date().toISOString()
            };
            setCheckoutItems([courseItem]);
            setOrderSummary({
              subtotal: singleCourse.price || 0,
              tax: (singleCourse.price || 0) * 0.1,
              total: (singleCourse.price || 0) * 1.1,
              itemCount: 1,
              items: [courseItem]
            });
          } else if (courseId) {
            // Fetch course details for single course
            try {
              const response = await getCourseById(courseId);
              const fetchedCourse = response.course;
              setCourse(fetchedCourse);

              const courseItem = {
                ...fetchedCourse,
                addedAt: new Date().toISOString()
              };
              setCheckoutItems([courseItem]);
              setOrderSummary({
                subtotal: fetchedCourse.price || 0,
                tax: (fetchedCourse.price || 0) * 0.1,
                total: (fetchedCourse.price || 0) * 1.1,
                itemCount: 1,
                items: [courseItem]
              });
            } catch (err) {
              setError(err.message || "Failed to load course details for checkout.");
              dispatch(showModal({
                title: "Error",
                message: err.message || "Failed to load course details for checkout.",
                type: "error",
              }));
            }
          }
        } else {
          console.log('No items found for checkout');
          setError("No items to checkout. Please add courses to your cart first.");
        }
      } catch (err) {
        console.error('Checkout initialization error:', err);
        setError(err.message || "Failed to load checkout details.");
        dispatch(showModal({
          title: "Error",
          message: err.message || "Failed to load checkout details.",
          type: "error",
        }));
      } finally {
        setLoading(false);
      }
    };

    initializeCheckout();
  }, [courseId, singleCourse, passedCartItems, passedCartSummary, cartItems, isAuthenticated, navigate, dispatch, getCartSummary]);

  const handlePayment = async () => {
    setSubmitting(true);
    setError(null);

    if (!checkoutItems || checkoutItems.length === 0 || !orderSummary) {
      setError("No items to purchase.");
      setSubmitting(false);
      return;
    }

    try {
      console.log('Processing payment for items:', checkoutItems);

      // For single course purchase
      if (checkoutItems.length === 1) {
        const course = checkoutItems[0];
        const paymentDetails = {
          amount: course.price,
          currency: 'INR',
          paymentMethodNonce: 'mock_payment_token_123',
        };

        await processPayment(course._id, paymentDetails);
        dispatch(showModal({
          title: "Payment Successful!",
          message: `You have successfully purchased "${course.title}".`,
          type: "success",
        }));
      } else {
        // For multiple courses (cart purchase)
        // Note: This would need a different API endpoint for bulk purchases
        const paymentDetails = {
          amount: orderSummary.total,
          currency: 'INR',
          paymentMethodNonce: 'mock_payment_token_123',
          courses: checkoutItems.map(item => item._id)
        };

        // For now, process each course individually
        for (const course of checkoutItems) {
          await processPayment(course._id, {
            amount: course.price,
            currency: 'INR',
            paymentMethodNonce: 'mock_payment_token_123',
          });
        }

        dispatch(showModal({
          title: "Payment Successful!",
          message: `You have successfully purchased ${checkoutItems.length} courses.`,
          type: "success",
        }));

        // Clear cart after successful purchase
        clearCart();
      }

      navigate(PROTECTED_ROUTES.dashboard, { replace: true });
    } catch (err) {
      console.error('Payment error:', err);
      setError(err.message || "Payment failed. Please try again.");
      dispatch(showModal({
        title: "Payment Failed",
        message: err.message || "Payment could not be processed.",
        type: "error",
      }));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Loader />;
  if (error) return <div className="text-accent-error text-center p-lg text-lg">{error}</div>;
  if (!checkoutItems || checkoutItems.length === 0) {
    return (
      <div className="text-center p-lg">
        <h2 className="text-2xl font-bold text-text-primary mb-md">No Items to Checkout</h2>
        <p className="text-text-secondary">Please add courses to your cart first.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background-main p-lg font-sans flex items-center justify-center">
      <div className="container mx-auto max-w-2xl bg-background-card p-xl rounded-lg shadow-md border border-gray-100">
        <h1 className="text-4xl font-bold text-text-primary text-center mb-xl">Checkout</h1>

        {/* Checkout Items */}
        <div className="mb-xl border-b pb-xl">
          <h2 className="text-2xl font-bold text-text-primary mb-lg">Order Summary</h2>
          <div className="space-y-md">
            {checkoutItems.map((item, index) => (
              <div key={item._id || index} className="flex flex-col md:flex-row items-center md:items-start md:space-x-lg border border-gray-200 rounded-lg p-md">
                <img
                  src={item.imageUrl?.startsWith('http')
                    ? item.imageUrl
                    : `http://localhost:3000${item.imageUrl}` || 'https://placehold.co/150x100/F9F3EF/1B3C53?text=Course'}
                  alt={item.title}
                  className="w-full md:w-32 h-20 rounded-lg object-cover mb-md md:mb-0"
                />
                <div className="flex-1 text-center md:text-left">
                  <h3 className="text-lg font-bold text-text-primary mb-sm">{item.title}</h3>
                  <p className="text-text-secondary mb-sm text-sm">{item.description?.substring(0, 80)}...</p>
                  <p className="text-primary-main font-bold">
                    {item.price === 0 ? 'Free' : `₹${item.price.toFixed(2)}`}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Order Total */}
          {orderSummary && (
            <div className="mt-lg p-md bg-gray-50 rounded-lg">
              <div className="flex justify-between items-center mb-sm">
                <span className="text-text-secondary">Subtotal ({orderSummary.itemCount} items):</span>
                <span className="font-semibold">₹{orderSummary.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center mb-sm">
                <span className="text-text-secondary">Tax:</span>
                <span className="font-semibold">₹{orderSummary.tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center text-lg font-bold border-t pt-sm">
                <span>Total:</span>
                <span className="text-primary-main">₹{orderSummary.total.toFixed(2)}</span>
              </div>
            </div>
          )}
        </div>

        {error && <p className="text-accent-error text-center mb-md">{error}</p>}

        {orderSummary && orderSummary.total === 0 ? (
            <div className="text-center">
                <p className="text-lg text-text-primary mb-md">
                  {checkoutItems.length === 1 ? 'This course is free.' : 'These courses are free.'}
                  Click "Enroll Now" to get started!
                </p>
                <Button
                    text={submitting ? 'Enrolling...' : 'Enroll Now'}
                    onClick={handlePayment}
                    className="px-xl py-md text-lg"
                    disabled={submitting}
                />
            </div>
        ) : (
            <div className="space-y-md">
                <h2 className="text-3xl font-bold text-text-primary mb-lg border-b pb-sm text-center">Payment Details</h2>
                <div className="bg-background-main p-md rounded-md border border-gray-200">
                    <p className="text-text-primary font-semibold mb-sm">Card Information (Mock)</p>
                    <div className="space-y-sm">
                        <input
                            type="text"
                            placeholder="Card Number"
                            className="w-full px-md py-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-light"
                            disabled={submitting}
                        />
                        <div className="flex space-x-sm">
                            <input
                                type="text"
                                placeholder="MM/YY"
                                className="w-1/2 px-md py-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-light"
                                disabled={submitting}
                            />
                            <input
                                type="text"
                                placeholder="CVC"
                                className="w-1/2 px-md py-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-light"
                                disabled={submitting}
                            />
                        </div>
                        <input
                            type="text"
                            placeholder="Cardholder Name"
                            className="w-full px-md py-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-light"
                            disabled={submitting}
                        />
                    </div>
                </div>
                <Button
                    text={submitting ? 'Processing Payment...' : `Pay ₹${orderSummary?.total?.toFixed(2) || '0.00'}`}
                    onClick={handlePayment}
                    className="w-full px-xl py-md text-lg"
                    disabled={submitting}
                />
            </div>
        )}
      </div>
    </div>
  );
}

export default CheckoutPage;
