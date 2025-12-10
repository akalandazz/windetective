import React, { forwardRef } from 'react';
import type { InputProps } from '@/lib/types';
import { buildClassName } from '@/lib/design-system';

const Input = forwardRef<HTMLInputElement, InputProps>(({
  value,
  onChange,
  placeholder = '',
  error,
  disabled = false,
  maxLength,
  pattern,
  'aria-describedby': ariaDescribedBy,
  'aria-invalid': ariaInvalid,
  className = '',
  ...props
}, ref) => {
  const baseClasses = 'w-full px-3 py-2 border rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 disabled:bg-neutral-50 disabled:text-neutral-500 disabled:cursor-not-allowed';
  
  const stateClasses = error
    ? 'border-error-300 text-error-900 placeholder-error-400 focus:ring-error-500 focus:border-error-500'
    : 'border-neutral-300 text-neutral-900 placeholder-neutral-500';
  
  const classes = buildClassName(
    baseClasses,
    stateClasses,
    className
  );
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };
  
  return (
    <input
      ref={ref}
      type="text"
      value={value}
      onChange={handleChange}
      placeholder={placeholder}
      disabled={disabled}
      maxLength={maxLength}
      pattern={pattern}
      aria-describedby={ariaDescribedBy}
      aria-invalid={ariaInvalid || !!error}
      className={classes}
      {...props}
    />
  );
});

Input.displayName = 'Input';

export default Input;