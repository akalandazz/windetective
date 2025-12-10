import type { Config } from 'tailwindcss';
import { designSystem } from './lib/design-system/tokens';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      // Colors from design system
      colors: {
        primary: designSystem.colors.primary,
        secondary: designSystem.colors.secondary,
        success: designSystem.colors.success,
        warning: designSystem.colors.warning,
        error: designSystem.colors.error,
        neutral: designSystem.colors.neutral,
        automotive: designSystem.colors.automotive,
        
        // Semantic color mappings
        'status-clean': designSystem.semanticColors.status.clean,
        'status-warning': designSystem.semanticColors.status.warning,
        'status-critical': designSystem.semanticColors.status.critical,
        'status-unavailable': designSystem.semanticColors.status.unavailable,
        
        'condition-excellent': designSystem.semanticColors.condition.excellent,
        'condition-good': designSystem.semanticColors.condition.good,
        'condition-fair': designSystem.semanticColors.condition.fair,
        'condition-poor': designSystem.semanticColors.condition.poor,
        
        'risk-low': designSystem.semanticColors.risk.low,
        'risk-medium': designSystem.semanticColors.risk.medium,
        'risk-high': designSystem.semanticColors.risk.high,
        
        // UI colors
        'ui-bg': designSystem.semanticColors.ui.background,
        'ui-bg-secondary': designSystem.semanticColors.ui.backgroundSecondary,
        'ui-border': designSystem.semanticColors.ui.border,
        'ui-border-hover': designSystem.semanticColors.ui.borderHover,
        'ui-text': designSystem.semanticColors.ui.text,
        'ui-text-secondary': designSystem.semanticColors.ui.textSecondary,
        'ui-text-muted': designSystem.semanticColors.ui.textMuted,
      },

      // Typography from design system
      fontFamily: designSystem.typography.fontFamily,
      fontSize: designSystem.typography.fontSize,
      fontWeight: designSystem.typography.fontWeight,
      lineHeight: designSystem.typography.lineHeight,
      letterSpacing: designSystem.typography.letterSpacing,

      // Spacing from design system
      spacing: designSystem.spacing,

      // Border radius from design system
      borderRadius: designSystem.borderRadius,

      // Box shadows from design system
      boxShadow: designSystem.boxShadow,

      // Animation and transitions
      transitionDuration: designSystem.animation.duration,
      transitionTimingFunction: designSystem.animation.ease,

      // Z-index values
      zIndex: designSystem.zIndex,

      // Custom breakpoints
      screens: {
        sm: designSystem.breakpoints.sm,
        md: designSystem.breakpoints.md,
        lg: designSystem.breakpoints.lg,
        xl: designSystem.breakpoints.xl,
        '2xl': designSystem.breakpoints['2xl'],
      },

      // Custom animations and keyframes
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'fade-out': {
          '0%': { opacity: '1' },
          '100%': { opacity: '0' },
        },
        'slide-in-from-right': {
          '0%': { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(0)' },
        },
        'slide-in-from-left': {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(0)' },
        },
        'slide-up': {
          '0%': { transform: 'translateY(100%)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'pulse-subtle': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.8' },
        },
        'skeleton': {
          '0%': { backgroundColor: '#f3f4f6' },
          '50%': { backgroundColor: '#e5e7eb' },
          '100%': { backgroundColor: '#f3f4f6' },
        },
        'progress': {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
        'bounce-light': {
          '0%, 100%': { transform: 'translateY(-5%)', animationTimingFunction: 'cubic-bezier(0.8, 0, 1, 1)' },
          '50%': { transform: 'translateY(0)', animationTimingFunction: 'cubic-bezier(0, 0, 0.2, 1)' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.2s ease-out',
        'fade-out': 'fade-out 0.2s ease-out',
        'slide-in-right': 'slide-in-from-right 0.3s ease-out',
        'slide-in-left': 'slide-in-from-left 0.3s ease-out',
        'slide-up': 'slide-up 0.3s ease-out',
        'pulse-subtle': 'pulse-subtle 2s ease-in-out infinite',
        'skeleton': 'skeleton 2s ease-in-out infinite',
        'progress': 'progress 2s ease-in-out infinite',
        'bounce-light': 'bounce-light 1s infinite',
      },

      // Custom gradients for automotive feel
      backgroundImage: {
        'gradient-automotive': 'linear-gradient(135deg, #2c5aa0 0%, #4a5568 100%)',
        'gradient-status-clean': 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
        'gradient-status-warning': 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
        'gradient-status-critical': 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
        'gradient-card': 'linear-gradient(135deg, #ffffff 0%, #f9fafb 100%)',
      },

      // Custom aspect ratios for charts and images
      aspectRatio: {
        'chart': '16 / 9',
        'card': '4 / 3',
      },
    },
  },
  plugins: [
    // Custom plugin for component utilities
    function({ addUtilities, theme }: { addUtilities: any; theme: any }) {
      const newUtilities = {
        // Status badge utilities
        '.status-clean': {
          backgroundColor: theme('colors.status-clean'),
          color: theme('colors.white'),
        },
        '.status-warning': {
          backgroundColor: theme('colors.status-warning'),
          color: theme('colors.white'),
        },
        '.status-critical': {
          backgroundColor: theme('colors.status-critical'),
          color: theme('colors.white'),
        },
        '.status-unavailable': {
          backgroundColor: theme('colors.status-unavailable'),
          color: theme('colors.white'),
        },

        // Text utilities for conditions
        '.text-condition-excellent': {
          color: theme('colors.condition-excellent'),
        },
        '.text-condition-good': {
          color: theme('colors.condition-good'),
        },
        '.text-condition-fair': {
          color: theme('colors.condition-fair'),
        },
        '.text-condition-poor': {
          color: theme('colors.condition-poor'),
        },

        // Card component utilities
        '.card': {
          backgroundColor: theme('colors.ui-bg'),
          border: `1px solid ${theme('colors.ui-border')}`,
          borderRadius: theme('borderRadius.lg'),
          boxShadow: theme('boxShadow.sm'),
        },
        '.card-hover': {
          '&:hover': {
            boxShadow: theme('boxShadow.md'),
            borderColor: theme('colors.ui-border-hover'),
          },
        },

        // Button component utilities
        '.btn': {
          padding: `${theme('spacing.2')} ${theme('spacing.4')}`,
          borderRadius: theme('borderRadius.md'),
          fontWeight: theme('fontWeight.medium'),
          transition: 'all 0.2s ease-in-out',
          cursor: 'pointer',
          '&:disabled': {
            opacity: '0.5',
            cursor: 'not-allowed',
          },
        },
        '.btn-primary': {
          backgroundColor: theme('colors.primary.600'),
          color: theme('colors.white'),
          '&:hover:not(:disabled)': {
            backgroundColor: theme('colors.primary.700'),
          },
        },
        '.btn-secondary': {
          backgroundColor: theme('colors.neutral.100'),
          color: theme('colors.neutral.900'),
          '&:hover:not(:disabled)': {
            backgroundColor: theme('colors.neutral.200'),
          },
        },

        // Skeleton loading utilities
        '.skeleton': {
          animation: 'skeleton 2s ease-in-out infinite',
          borderRadius: theme('borderRadius.base'),
        },
        '.skeleton-text': {
          height: theme('spacing.4'),
          marginBottom: theme('spacing.2'),
        },
        '.skeleton-avatar': {
          width: theme('spacing.12'),
          height: theme('spacing.12'),
          borderRadius: theme('borderRadius.full'),
        },

        // Focus utilities for accessibility
        '.focus-ring': {
          '&:focus': {
            outline: '2px solid transparent',
            outlineOffset: '2px',
            boxShadow: `0 0 0 2px ${theme('colors.primary.500')}`,
          },
        },
      };

      addUtilities(newUtilities);
    },
  ],
};

export default config;