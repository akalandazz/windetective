// Design System Entry Point
export * from './tokens';

// Re-export design system for easy access
import { designSystem } from './tokens';
export { designSystem };
export default designSystem;

// Class name builders for consistent styling
export const buildClassName = (...classes: (string | undefined | null | false)[]): string => {
  return classes.filter(Boolean).join(' ');
};