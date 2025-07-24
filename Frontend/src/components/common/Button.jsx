import PropTypes from 'prop-types';
import { motion } from 'framer-motion';

function Button({ text, onClick, className, disabled, variant }) {
  const baseClasses = 'px-md py-sm rounded-lg font-sans font-semibold transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary-main focus:ring-offset-2';
  const variantClasses =
    variant === 'outline'
      ? 'bg-transparent border border-primary-main text-primary-main hover:bg-primary-light hover:text-background-card'
      : 'bg-primary-main text-background-card hover:bg-primary-light';

  return (
    <motion.button
      className={`${baseClasses} ${variantClasses} ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
      onClick={onClick}
      disabled={disabled}
      whileHover={{ scale: disabled ? 1 : 1.05 }}
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
  variant: PropTypes.oneOf(['solid', 'outline']),
};

Button.defaultProps = {
  className: '',
  onClick: () => {},
  disabled: false,
  variant: 'solid',
};

export default Button;