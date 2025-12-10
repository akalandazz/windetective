import React from 'react';
import type { ContainerProps } from '@/lib/types';
import { buildClassName } from '@/lib/design-system';

const Container: React.FC<ContainerProps> = ({
  children,
  size = 'xl',
  centered = true,
  className = '',
}) => {
  const sizeClasses = {
    sm: 'max-w-2xl', // 672px
    md: 'max-w-4xl', // 896px
    lg: 'max-w-6xl', // 1152px
    xl: 'max-w-7xl', // 1280px
    '2xl': 'max-w-screen-2xl', // 1536px
    full: 'max-w-none w-full',
  };

  const baseClasses = 'w-full px-4 sm:px-6 lg:px-8';
  const centerClasses = centered ? 'mx-auto' : '';

  const classes = buildClassName(
    baseClasses,
    sizeClasses[size],
    centerClasses,
    className
  );

  return (
    <div className={classes}>
      {children}
    </div>
  );
};

export default Container;