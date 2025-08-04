import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { toggleTheme, selectThemeMode } from '../../Redux/slices/themeSlice';
import { FiSun, FiMoon } from 'react-icons/fi';

const ThemeToggle = ({ className = '', size = 'md' }) => {
  const dispatch = useDispatch();
  const themeMode = useSelector(selectThemeMode);

  const handleToggle = () => {
    dispatch(toggleTheme());
  };

  const sizeClasses = {
    sm: 'w-8 h-8 text-sm',
    md: 'w-10 h-10 text-base',
    lg: 'w-12 h-12 text-lg',
  };

  const iconSizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  return (
    <button
      onClick={handleToggle}
      className={`
        ${sizeClasses[size]}
        ${className}
        relative
        rounded-full
        border-2
        border-gray-300
        dark:border-gray-600
        bg-white
        dark:bg-gray-800
        text-gray-700
        dark:text-gray-300
        hover:bg-gray-50
        dark:hover:bg-gray-700
        hover:border-gray-400
        dark:hover:border-gray-500
        transition-all
        duration-300
        ease-in-out
        focus:outline-none
        focus:ring-2
        focus:ring-blue-500
        focus:ring-offset-2
        dark:focus:ring-offset-gray-800
        shadow-sm
        hover:shadow-md
        active:scale-95
        flex
        items-center
        justify-center
      `}
      title={themeMode === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
      aria-label={themeMode === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
    >
      <div className="relative overflow-hidden">
        {/* Sun Icon */}
        <FiSun
          className={`
            ${iconSizeClasses[size]}
            absolute
            transition-all
            duration-300
            ease-in-out
            ${themeMode === 'light' 
              ? 'opacity-100 rotate-0 scale-100' 
              : 'opacity-0 rotate-90 scale-75'
            }
          `}
        />
        
        {/* Moon Icon */}
        <FiMoon
          className={`
            ${iconSizeClasses[size]}
            absolute
            transition-all
            duration-300
            ease-in-out
            ${themeMode === 'dark' 
              ? 'opacity-100 rotate-0 scale-100' 
              : 'opacity-0 -rotate-90 scale-75'
            }
          `}
        />
      </div>
    </button>
  );
};

export default ThemeToggle;
