import PropTypes from "prop-types"
import { motion } from "framer-motion"



function Button({text, onClick, className, disabled}) {
  
  return (
    <motion.button
      className={`px-spacing-md py-spacing-sm rounded font-sans font-semibold bg-primary-main text-background-card hover:bg-primary-light disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
      onClick={onClick}
      disabled={disabled}
      whileHover={{ scale: disabled ? 1 : 1.05 }}
      whileTap={{ scale: disabled ? 1 : 0.95 }}
      transition={{ duration: 0.2 }}
      aria-label={text}
    >
      {text}
    </motion.button>

  )
}

Button.propTypes = {
  text: PropTypes.string.isRequired,
  className: PropTypes.string,
  onClick: PropTypes.func,
  disabled: PropTypes.bool
}

Button.defaultProps = {
  className: "",
  onclick: () => {},
  disabled: false
}

export default Button