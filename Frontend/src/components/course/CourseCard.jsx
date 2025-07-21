import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { PUBLIC_ROUTES } from '../../routes'; 

function CourseCard({ course }) {
  if (!course) {
    return null; 
  }

  return (
    <Link to={PUBLIC_ROUTES.courseDetail.replace(':id', course._id)} className="block">
      <div className="bg-background-card rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 border border-gray-100">
        <img
          src={course.imageUrl || 'https://placehold.co/400x250/F9F3EF/1B3C53?text=Course+Image'} // Use theme colors for placeholder
          alt={course.title}
          className="w-full h-48 object-cover"
        />
        <div className="p-md">
          <h3 className="text-xl font-semibold text-text-primary mb-sm truncate">{course.title}</h3> {/* Use theme spacing */}
          <p className="text-text-secondary text-sm mb-md line-clamp-2">{course.description}</p> {/* Use theme spacing */}
          <div className="flex justify-between items-center">
            <span className="text-lg font-bold text-primary-main">
              {course.price === 0 ? 'Free' : `$${course.price?.toFixed(2)}`}
            </span>
            <span className="text-sm text-text-secondary">
              Rating: {course.averageRating ? course.averageRating.toFixed(1) : 'N/A'} ({course.numberOfReviews || 0} reviews)
            </span>
          </div>
          {course.creatorId && (
            <p className="text-text-secondary text-xs mt-sm">
              By: {course.creatorId.firstName} {course.creatorId.lastName}
            </p>
          )}
        </div>
      </div>
    </Link>
  );
}

CourseCard.propTypes = {
  course: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    imageUrl: PropTypes.string,
    price: PropTypes.number.isRequired,
    averageRating: PropTypes.number,
    numberOfReviews: PropTypes.number,
    creatorId: PropTypes.shape({ 
      firstName: PropTypes.string,
      lastName: PropTypes.string,
    }),
  }).isRequired,
};

export default CourseCard;
