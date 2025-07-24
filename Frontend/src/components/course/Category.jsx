import React from 'react';
import PropTypes from 'prop-types';
import { motion } from 'framer-motion';

function CategoryComponent({ category, onClick, isSelected }) {
  return (
    <motion.button
      onClick={onClick}
      className={`px-sm py-1 rounded-full text-sm font-sans font-medium transition-colors duration-200 ${
        isSelected
          ? 'bg-primary-main text-background-card'
          : 'bg-secondary-light text-text-primary hover:bg-primary-light hover:text-background-card'
      }`}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      {category.name}
    </motion.button>
  );
}

CategoryComponent.propTypes = {
  category: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
  }).isRequired,
  onClick: PropTypes.func.isRequired,
  isSelected: PropTypes.bool.isRequired,
};

export default CategoryComponent;