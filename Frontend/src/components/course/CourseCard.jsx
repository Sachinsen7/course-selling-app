import React from 'react';
import PropTypes from 'prop-types';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import Button from '../common/Button';
import { useAuth } from '../../context/AuthContext';
import { PUBLIC_ROUTES, PROTECTED_ROUTES } from '../../routes';

function CourseCard({ course }) {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  if (!course) {
    return null;
  }

  const handleEnroll = (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      navigate(PUBLIC_ROUTES.login);
      return;
    }
    navigate(PROTECTED_ROUTES.checkout, { state: { course } });
  };

  return (
    <Link to={PUBLIC_ROUTES.courseDetail(course._id)} className="block">
      <motion.div
        className="bg-background-card rounded-lg shadow-md overflow-hidden border border-secondary-light relative group"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="relative">
          <img
            src={course.imageUrl || 'https://via.placeholder.com/400x250/F9F3EF/1B3C53?text=Course+Image'}
            alt={course.title}
            className="w-full h-48 object-cover"
          />
          {/* {course.category && (
            <span className="absolute top-2 left-2 bg-primary-main text-background-card text-xs font-semibold px-sm py-1 rounded">
              {course.category}
            </span>
          )} */}
          {/* Hover Overlay */}
          <motion.div
            className="absolute inset-0 bg-primary-main/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0 }}
            whileHover={{ opacity: 1 }}
          >
            <Button
              text="Enroll Now"
              onClick={handleEnroll}
              className="px-sm py-1 bg-background-card text-background-main hover:bg-primary-light hover:text-background-card"
            />
          </motion.div>
        </div>
        <div className="p-md">
          <h3 className="text-xl font-semibold text-text-primary mb-sm truncate">{course.title}</h3>
          <p className="text-text-secondary text-sm mb-md line-clamp-2">{course.description}</p>
          <div className="flex justify-between items-center">
            <span className="text-lg font-bold text-primary-main">
              {course.price === 0 ? 'Free' : `$${course.price.toFixed(2)}`}
            </span>
            <span className="text-sm text-text-secondary">
              Rating: {course.averageRating ? course.averageRating.toFixed(1) : 'N/A'} ({course.numberOfReviews || 0})
            </span>
          </div>
          {course.creatorId && (
            <p className="text-text-secondary text-xs mt-sm">
              By: {course.creatorId.firstName} {course.creatorId.secondName}
            </p>
          )}
        </div>
      </motion.div>
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
    category: PropTypes.string,
    creatorId: PropTypes.shape({
      firstName: PropTypes.string,
      secondName: PropTypes.string,
    }),
  }).isRequired,
};

export default CourseCard;