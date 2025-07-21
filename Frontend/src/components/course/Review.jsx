import React from 'react';
import PropTypes from 'prop-types';

function Review({ review }) {
  if (!review) {
    return null;
  }

  return (
    <div className="bg-background-main p-md rounded-md shadow-sm border border-gray-100"> 
      <div className="flex items-center mb-2">
        <img
          src={review.userId?.profilePicture || 'https://placehold.co/40x40/F9F3EF/1B3C53?text=U'}
          alt={review.userId?.firstName || 'User'}
          className="w-10 h-10 rounded-full mr-3 object-cover"
        />
        <div>
          <p className="font-semibold text-text-primary">{review.userId?.firstName} {review.userId?.lastName || review.userId?.email}</p>
          <p className="text-sm text-text-secondary">Rating: {review.rating} / 5</p>
        </div>
      </div>
      <p className="text-text-primary">{review.comment}</p>
      <p className="text-xs text-text-secondary mt-2">
        {new Date(review.createdAt).toLocaleDateString()}
      </p>
    </div>
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
};

export default Review;
