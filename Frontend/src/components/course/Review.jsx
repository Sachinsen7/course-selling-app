import React from 'react';
import PropTypes from 'prop-types';
import { motion } from 'framer-motion';

function Review({ review, className }) {
  if (!review) {
    return null;
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <motion.div
      className={`bg-[#FFFFFF] p-4 rounded-xl border border-[#E5E7EB] shadow-sm ${className}`}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      role="article"
    >
      <div className="flex items-center mb-3">
        <img
          src={review.userId?.profilePicture || 'https://via.placeholder.com/40x40/F9FAFB/1B3C53?text=U'}
          alt={`${review.userId?.firstName || 'User'}'s profile`}
          className="w-10 h-10 rounded-full mr-3 object-cover border-2 border-[#4A8292]"
        />
        <div className="flex-1">
          <p className="font-semibold text-[#1B3C53] text-base">
            {review.userId?.firstName} {review.userId?.lastName || review.userId?.email}
          </p>
          <div className="flex items-center space-x-0.5" aria-label={`Rating: ${review.rating} out of 5 stars`}>
            {[...Array(5)].map((_, i) => (
              <svg
                key={i}
                className={`w-4 h-4 ${i < review.rating ? 'text-[#D97706]' : 'text-[#6B7280]'}`}
                fill="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path d="M12 .587l3.668 7.431 8.332 1.21-6.001 5.853 1.416 8.249L12 18.897l-7.415 3.933 1.416-8.249-6.001-5.853 8.332-1.21L12 .587z" />
              </svg>
            ))}
          </div>
        </div>
      </div>
      <p className="text-[#6B7280] text-sm mb-2 leading-relaxed">{review.comment}</p>
      <p className="text-xs text-[#6B7280]">{formatDate(review.createdAt)}</p>
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
      lastName: PropTypes.string,
      email: PropTypes.string,
      profilePicture: PropTypes.string,
    }),
  }).isRequired,
  className: PropTypes.string,
};

Review.defaultProps = {
  className: '',
};

export default Review;