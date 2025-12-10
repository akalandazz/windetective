import React from 'react';
import type { ButtonProps } from '@/lib/types';
import { buildClassName } from '@/lib/design-system';

const Button: React.FC<ButtonProps> = ({
  children,
  onClick,
  type = 'button',
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  icon,
  iconPosition = 'left',
  fullWidth = false,
  'aria-label': ariaLabel,
  className = '',
}) => {
  const baseClasses = 'btn focus-ring inline-flex items-center justify-center font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variantClasses = {
    primary: 'btn-primary',
    secondary: 'btn-secondary',
    outline: 'border-2 border-primary-600 text-primary-600 bg-transparent hover:bg-primary-50 disabled:hover:bg-transparent',
    ghost: 'text-neutral-700 bg-transparent hover:bg-neutral-100 disabled:hover:bg-transparent',
    danger: 'bg-error-600 text-white hover:bg-error-700 disabled:hover:bg-error-600',
  };
  
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm h-8',
    md: 'px-4 py-2 text-base h-10',
    lg: 'px-6 py-3 text-lg h-12',
  };
  
  const widthClasses = fullWidth ? 'w-full' : '';
  
  const classes = buildClassName(
    baseClasses,
    variantClasses[variant],
    sizeClasses[size],
    widthClasses,
    className
  );
  
  const iconElement = loading ? (
    <svg 
      className="animate-spin h-4 w-4" 
      xmlns="http://www.w3.org/2000/svg" 
      fill="none" 
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <circle 
        className="opacity-25" 
        cx="12" 
        cy="12" 
        r="10" 
        stroke="currentColor" 
        strokeWidth="4"
      />
      <path 
        className="opacity-75" 
        fill="currentColor" 
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  ) : icon;
  
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      aria-label={ariaLabel}
      aria-busy={loading}
      className={classes}
    >
      {iconElement && iconPosition === 'left' && (
        <span className={buildClassName('flex-shrink-0', children ? 'mr-2' : '')}>
          {iconElement}
        </span>
      )}
      
      {loading ? (
        <span>Loading...</span>
      ) : (
        children
      )}
      
      {iconElement && iconPosition === 'right' && (
        <span className={buildClassName('flex-shrink-0', children ? 'ml-2' : '')}>
          {iconElement}
        </span>
      )}
    </button>
  );
};

export default Button;