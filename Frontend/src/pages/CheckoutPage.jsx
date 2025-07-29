import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getCourseById, processPayment } from '../services/api';
import Loader from '../components/common/Loader';
import Button from '../components/common/Button';
import { PUBLIC_ROUTES, PROTECTED_ROUTES } from '../routes';

function CheckoutPage() {
  const navigate = useNavigate();
  const { isAuthenticated, user, showModal } = useAuth();
  const location = useLocation();
  const { courseId } = location.state || {}; 

  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      showModal({
        isOpen: true,
        title: "Login Required",
        message: "You need to log in to proceed to checkout.",
        type: "info",
      });
      navigate('/login', { replace: true });
      return;
    }

    if (!courseId) {
      setError("No course selected for checkout.");
      setLoading(false);
      return;
    }

    const fetchCourseDetails = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await getCourseById(courseId);
        setCourse(response.course);
      } catch (err) {
        setError(err.message || "Failed to load course details for checkout.");
        showModal({
          isOpen: true,
          title: "Error",
          message: err.message || "Failed to load course details for checkout.",
          type: "error",
        });
        navigate(PUBLIC_ROUTES.courseListing, { replace: true }); 
      } finally {
        setLoading(false);
      }
    };

    fetchCourseDetails();
  }, [courseId, isAuthenticated, navigate, showModal]);

  const handlePayment = async () => {
    setSubmitting(true);
    setError(null);

    if (!course) {
      setError("Course data is missing.");
      setSubmitting(false);
      return;
    }

    try {
      const paymentDetails = {
        amount: course.price,
        currency: 'IND', 
        paymentMethodNonce: 'mock_payment_token_123',
      };

      await processPayment(courseId, paymentDetails);
      showModal({
        isOpen: true,
        title: "Payment Successful!",
        message: `You have successfully purchased "${course.title}".`,
        type: "success",
      });
      navigate(PROTECTED_ROUTES.dashboard, { replace: true }); 
    } catch (err) {
      setError(err.message || "Payment failed. Please try again.");
      showModal({
        isOpen: true,
        title: "Payment Failed",
        message: err.message || "Payment could not be processed.",
        type: "error",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Loader />;
  if (error) return <div className="text-accent-error text-center p-lg text-lg">{error}</div>;
  if (!course) return null; 

  return (
    <div className="min-h-screen bg-background-main p-lg font-sans flex items-center justify-center">
      <div className="container mx-auto max-w-2xl bg-background-card p-xl rounded-lg shadow-md border border-gray-100">
        <h1 className="text-4xl font-bold text-text-primary text-center mb-xl">Checkout</h1>

        <div className="flex flex-col md:flex-row items-center md:items-start md:space-x-lg mb-xl border-b pb-xl">
          <img
            src={course.imageUrl || 'https://placehold.co/200x150/F9F3EF/1B3C53?text=Course'}
            alt={course.title}
            className="w-full md:w-1/3 rounded-lg object-cover mb-md md:mb-0"
          />
          <div className="flex-1 text-center md:text-left">
            <h2 className="text-2xl font-bold text-text-primary mb-sm">{course.title}</h2>
            <p className="text-text-secondary mb-sm">{course.description.substring(0, 100)}...</p>
            <p className="text-primary-main text-xl font-bold">
              Total: {course.price === 0 ? 'Free' : `$${course.price.toFixed(2)}`}
            </p>
          </div>
        </div>

        {error && <p className="text-accent-error text-center mb-md">{error}</p>}

        {course.price === 0 ? (
            <div className="text-center">
                <p className="text-lg text-text-primary mb-md">This course is free. Click "Enroll Now" to get started!</p>
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
                    text={submitting ? 'Processing Payment...' : `Pay $${course.price.toFixed(2)}`}
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
