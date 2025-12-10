// Design System Entry Point
export * from './tokens';

// Re-export design system for easy access
import { designSystem } from './tokens';
export { designSystem };
export default designSystem;

// Utility functions for design system
export const getColor = (colorPath: string) => {
  const keys = colorPath.split('.');
  let value: any = designSystem.colors;
  
  for (const key of keys) {
    value = value?.[key];
    if (value === undefined) break;
  }
  
  return value;
};

export const getSpacing = (spacingKey: keyof typeof designSystem.spacing) => {
  return designSystem.spacing[spacingKey];
};

export const getBreakpoint = (breakpointKey: keyof typeof designSystem.breakpoints) => {
  return designSystem.breakpoints[breakpointKey];
};

// Component variant utilities
export const getButtonStyles = (variant: 'primary' | 'secondary' | 'danger' = 'primary') => {
  return designSystem.components.button[variant];
};

export const getStatusColor = (status: 'clean' | 'warning' | 'critical' | 'unavailable') => {
  return designSystem.semanticColors.status[status];
};

export const getConditionColor = (condition: 'excellent' | 'good' | 'fair' | 'poor') => {
  return designSystem.semanticColors.condition[condition];
};

export const getRiskColor = (risk: 'low' | 'medium' | 'high') => {
  return designSystem.semanticColors.risk[risk];
};

// Media query helpers
export const mediaQueries = {
  sm: `@media (min-width: ${designSystem.breakpoints.sm})`,
  md: `@media (min-width: ${designSystem.breakpoints.md})`,
  lg: `@media (min-width: ${designSystem.breakpoints.lg})`,
  xl: `@media (min-width: ${designSystem.breakpoints.xl})`,
  '2xl': `@media (min-width: ${designSystem.breakpoints['2xl']})`,
};

// Class name builders for consistent styling
export const buildClassName = (...classes: (string | undefined | null | false)[]): string => {
  return classes.filter(Boolean).join(' ');
};

export const buildStatusClassName = (status: 'clean' | 'warning' | 'critical' | 'unavailable'): string => {
  return `status-${status}`;
};

export const buildConditionClassName = (condition: 'excellent' | 'good' | 'fair' | 'poor'): string => {
  return `text-condition-${condition}`;
};

// Animation utilities
export const fadeIn = 'animate-fade-in';
export const slideUp = 'animate-slide-up';
export const pulseSubtle = 'animate-pulse-subtle';
export const skeleton = 'animate-skeleton';

// Common component combinations
export const cardClasses = 'card card-hover';
export const buttonPrimaryClasses = 'btn btn-primary focus-ring';
export const buttonSecondaryClasses = 'btn btn-secondary focus-ring';
export const inputClasses = 'focus-ring';
export const skeletonTextClasses = 'skeleton skeleton-text';