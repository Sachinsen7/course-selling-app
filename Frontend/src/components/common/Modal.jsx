import React, { useEffect, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import PropTypes from 'prop-types';
import { twMerge } from 'tailwind-merge';
import Button from './Button';

function Modal({ isOpen, onClose, title, message, type = 'info', children, loading = false }) {
  const modalRef = useRef(null);

  const handleEscape = useCallback(
    (event) => {
      if (event.key === 'Escape' && !loading) {
        onClose();
      }
    },
    [onClose, loading]
  );


  const handleClickOutside = useCallback(
    (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target) && !loading) {
        onClose();
      }
    },
    [onClose, loading]
  );


  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.addEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'hidden'; 
      const focusable = modalRef.current?.querySelector('button, input, select, textarea, [tabindex="0"]');
      if (focusable) focusable.focus();
    }
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = ''; 
    };
  }, [isOpen, handleEscape, handleClickOutside]);


  const typeColors = {
    info: 'text-[#4A8292]',
    success: 'text-[#4A8292]',
    error: 'text-[#DC2626]',
    warning: 'text-[#D97706]',
  };

  const icon = {
    info: (
      <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    success: (
      <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    error: (
      <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    warning: (
      <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
    ),
  };


  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-[#1B3C53]/50 backdrop-blur-sm font-sans"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <motion.div
            ref={modalRef}
            className="relative bg-[#FFFFFF] rounded-xl shadow-lg p-6 w-full max-w-lg"
            initial={{ scale: 0.9, y: 50, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.9, y: 50, opacity: 0 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            role="dialog"
            aria-modal="true"
            aria-labelledby={title ? 'modal-title' : undefined}
            aria-describedby={message ? 'modal-message' : undefined}
          >
            {loading && (
              <motion.div
                className="absolute top-0 left-0 h-1 bg-[#4A8292]"
                initial={{ width: '0%' }}
                animate={{ width: ['0%', '80%', '20%'], x: ['0%', '20%', '0%'] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              />
            )}

            <button
              onClick={(e) => {
                e.stopPropagation();
                onClose(); 
              }}
              className="absolute top-3 right-3 text-[#6B7280] hover:text-[#1B3C53] transition-colors focus:outline-none focus:ring-2 focus:ring-[#4A8292]"
              aria-label="Close modal"
              disabled={loading}
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="flex flex-col items-center text-center">
              {icon[type] && (
                <div className={twMerge('mb-4', typeColors[type])}>
                  {icon[type]}
                </div>
              )}
              {title && (
                <h3 id="modal-title" className="text-xl font-semibold text-[#1B3C53] mb-2">
                  {title}
                </h3>
              )}
              {message && (
                <p id="modal-message" className="text-[#6B7280] text-sm mb-4">
                  {message}
                </p>
              )}
              {children || (
                <Button
                  text="OK"
                  onClick={(e) => {
                    e.stopPropagation();
                    onClose(); 
                  }}
                  className="mt-4 px-6 py-2 bg-[#1B3C53] text-[#FFFFFF] hover:bg-[#456882] rounded-md"
                  disabled={loading}
                />
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}

Modal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  title: PropTypes.string,
  message: PropTypes.string,
  type: PropTypes.oneOf(['info', 'success', 'error', 'warning']),
  children: PropTypes.node,
  loading: PropTypes.bool,
};

Modal.defaultProps = {
  title: '',
  message: '',
  type: 'info',
  children: null,
  loading: false,
};

export default Modal;
