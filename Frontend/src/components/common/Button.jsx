import PropTypes from 'prop-types';
import { motion } from 'framer-motion';

function Button({ text, onClick, className, disabled }) {
  return (
    <motion.button
      className={`px-md py-sm rounded-md font-sans  bg-primary-main text-background-card hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary-main focus:ring-offset-2 ${className}`}
      onClick={onClick}
      disabled={disabled}
      whileHover={{ scale: disabled ? 1 : 1 }}
      whileTap={{ scale: disabled ? 1 : 0.95 }}
      transition={{ duration: 0.2 }}
      aria-label={text}
    >
      {text}
    </motion.button>
  );
}

Button.propTypes = {
  text: PropTypes.string.isRequired,
  className: PropTypes.string,
  onClick: PropTypes.func,
  disabled: PropTypes.bool,
};

Button.defaultProps = {
  className: '',
  onClick: () => {},
  disabled: false,
};

export default Button;