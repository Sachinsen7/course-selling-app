import React from 'react';
import PropTypes from 'prop-types';
import { twMerge } from 'tailwind-merge';

function Category({ category, onClick, isSelected, className }) {
  return (
    <button
      onClick={() => onClick && onClick(category._id)}
      className={twMerge(
        `flex flex-col items-center p-md rounded-lg shadow-sm transition-all duration-200
        ${isSelected ? 'bg-primary-main text-white' : 'bg-background-card text-text-primary hover:bg-gray-100'}
        ${onClick ? 'cursor-pointer' : ''}`,
        className
      )}
    >
      <img
        src={category.imageUrl || 'https://placehold.co/60x60/F9F3EF/1B3C53?text=Cat'}
        alt={category.name}
        className="w-12 h-12 object-cover rounded-full mb-sm"
      />
      <span className={`text-sm font-semibold text-center ${isSelected ? 'text-white' : 'text-text-primary'}`}>
        {category.name}
      </span>
    </button>
  );
}

Category.propTypes = {
  category: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    imageUrl: PropTypes.string,
  }).isRequired,
  onClick: PropTypes.func, 
  isSelected: PropTypes.bool,
  className: PropTypes.string,
};

export default Category;
