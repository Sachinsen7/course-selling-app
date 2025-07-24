import React from 'react';
import PropTypes from 'prop-types';
import { motion } from 'framer-motion';

function Review({ review }) {
  if (!review) {
    return null;
  }

  return (
    <motion.div
      className="bg-background-card p-md rounded-md shadow-md border border-secondary-light"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex items-center mb-sm">
        <img
          src={review.userId?.profilePicture || 'https://via.placeholder.com/40x40/F9F3EF/1B3C53?text=U'}
          alt={review.userId?.firstName || 'User'}
          className="w-10 h-10 rounded-full mr-md object-cover border border-secondary-light"
        />
        <div className="flex-1">
          <p className="font-semibold text-text-primary text-md">
            {review.userId?.firstName} {review.userId?.secondName || review.userId?.email}
          </p>
          <div className="flex items-center space-x-1">
            {[...Array(5)].map((_, i) => (
              <span
                key={i}
                className={`text-lg ${i < review.rating ? 'text-accent-warning' : 'text-text-secondary'}`}
              >
                ★
              </span>
            ))}
          </div>
        </div>
      </div>
      <p className="text-text-primary text-sm mb-sm">{review.comment}</p>
      <p className="text-xs text-text-secondary">
        {new Date(review.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
      </p>
    </motion.div>
  );
}

Review.propTypes = {
  review: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    rating: PropTypes.number.isRequired,
    comment: PropTypes.string.isRequired,
    createdAt: PropTypes.string.isRequired,
    userId: PropTypes.shape({
      _id: PropTypes.string,
      firstName: PropTypes.string,
      lastName: PropTypes.string, // Aligned with backend schema
      email: PropTypes.string,
      profilePicture: PropTypes.string,
    }),
  }).isRequired,
};

export default Review;