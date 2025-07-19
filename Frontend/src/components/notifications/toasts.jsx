import React, { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import PropTypes from 'prop-types';
import { twMerge } from 'tailwind-merge';

const ToastContext = React.createContext();

export const useToast = () => {
  const context = React.useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToasterProvider');
  }
  return context;
};

let toastCount = 0;

export const ToasterProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback(({ title, description, variant = 'default', duration = 3000 }) => {
    const id = `toast-${toastCount++}`;
    setToasts((prev) => [...prev, { id, title, description, variant, duration }]);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const value = React.useMemo(() => ({ toast: addToast }), [addToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      {createPortal(
        <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2">
          <AnimatePresence>
            {toasts.map((toast) => (
              <Toast key={toast.id} {...toast} onDismiss={() => removeToast(toast.id)} />
            ))}
          </AnimatePresence>
        </div>,
        document.body
      )}
    </ToastContext.Provider>
  );
};

ToasterProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

const Toast = ({ id, title, description, variant, duration, onDismiss }) => {
  useEffect(() => {
    if (duration) {
      const timer = setTimeout(() => {
        onDismiss(id);
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [id, duration, onDismiss]);

  const variants = {
    default: "bg-gray-800 text-white",
    success: "bg-accent-success text-white",
    error: "bg-accent-error text-white",
    warning: "bg-accent-warning text-gray-900",
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 50, scale: 0.3 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.5, transition: { duration: 0.2 } }}
      className={twMerge(
        "relative flex w-full max-w-sm flex-col items-center space-y-1 rounded-md p-4 shadow-lg transition-all md:flex-row md:items-center md:space-x-4 md:space-y-0",
        variants[variant]
      )}
    >
      <div className="flex-1">
        {title && <div className="font-semibold">{title}</div>}
        {description && <div className="text-sm opacity-90">{description}</div>}
      </div>
      <button
        onClick={() => onDismiss(id)}
        className="absolute top-2 right-2 p-1 rounded-full hover:bg-white/20 transition-colors"
        aria-label="Close toast"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </motion.div>
  );
};

Toast.propTypes = {
  id: PropTypes.string.isRequired,
  title: PropTypes.string,
  description: PropTypes.string,
  variant: PropTypes.oneOf(['default', 'success', 'error', 'warning']),
  duration: PropTypes.number,
  onDismiss: PropTypes.func.isRequired,
};
