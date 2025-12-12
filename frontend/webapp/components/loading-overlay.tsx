import React from 'react';
import type { LoadingOverlayProps } from '@/lib/types/components';
import { cn } from '@/lib/utils';
import { Button } from './ui/button';

const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  isVisible,
  state,
  onCancel,
  className = '',
}) => {
  if (!isVisible) return null;

  const getProgressBarWidth = () => {
    if (state.status === 'completed') return '100%';
    if (state.status === 'error') return '0%';
    return `${Math.max(0, Math.min(100, state.progress))}%`;
  };

  const getEstimatedTimeRemaining = () => {
    if (state.estimatedTime && state.estimatedTime > 0) {
      const minutes = Math.floor(state.estimatedTime / 60);
      const seconds = state.estimatedTime % 60;

      if (minutes > 0) {
        return `${minutes}m ${seconds}s remaining`;
      }
      return `${seconds}s remaining`;
    }
    return 'Calculating time remaining...';
  };

  return (
    <div className={cn(
      'fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm',
      className
    )}>
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 rounded-full mb-4">
            <svg className="w-8 h-8 text-primary-600 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          </div>

          <h2 className="text-xl font-bold text-neutral-900 mb-2">
            Generating Your Vehicle Report
          </h2>

          <p className="text-neutral-600 text-sm mb-4">
            Our AI is analyzing your vehicle's history from multiple trusted sources
          </p>

          {/* Progress Bar */}
          <div className="progress-bar h-2 mb-4">
            <div
              className="progress-fill h-full transition-all duration-500 ease-out"
              style={{ width: getProgressBarWidth() }}
              role="progressbar"
              aria-valuenow={state.progress}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={`Report generation progress: ${state.progress}%`}
            />
          </div>

          <div className="flex justify-between items-center text-sm mb-4">
            <span className="text-neutral-600">
              {state.progress}% Complete
            </span>
            <span className="text-neutral-600">
              {getEstimatedTimeRemaining()}
            </span>
          </div>

          {/* Current Step */}
          {state.currentStep && (
            <div className="bg-neutral-50 rounded-lg p-3 mb-4">
              <div className="flex items-center gap-2 text-sm">
                <div className="w-2 h-2 bg-primary-500 rounded-full animate-pulse" />
                <span className="font-medium text-neutral-900">
                  {state.currentStep}
                </span>
              </div>
            </div>
          )}

          {/* Task ID display */}
          {state.taskId && (
            <div className="text-xs text-neutral-500">
              Task ID: {state.taskId}
            </div>
          )}
        </div>

        {/* Error State */}
        {state.status === 'error' && state.error && (
          <div className="bg-error-50 border border-error-200 rounded-lg p-4 mb-4">
            <div className="flex items-center gap-2 mb-2">
              <svg className="w-5 h-5 text-error-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <h3 className="font-semibold text-error-900">Processing Error</h3>
            </div>
            <p className="text-error-800 text-sm">{state.error}</p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-center gap-4">
          {onCancel && state.status !== 'completed' && state.status !== 'error' && (
            <Button
              onClick={onCancel}
              variant="outline"
              className="px-6"
            >
              Cancel
            </Button>
          )}

          <Button
            variant="ghost"
            className="px-6"
            disabled
          >
            <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            Please wait...
          </Button>
        </div>

        {/* Trust Indicators */}
        <div className="mt-6 p-4 bg-gradient-to-r from-neutral-50 to-neutral-100 rounded-lg">
          <div className="text-center">
            <h4 className="font-semibold text-neutral-900 mb-2 text-sm">Trusted Data Sources</h4>
            <div className="flex items-center justify-center gap-4 text-xs text-neutral-600">
              <span>CARFAX</span>
              <span>AutoCheck</span>
              <span>NHTSA</span>
              <span>Insurance</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoadingOverlay;