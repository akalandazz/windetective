import React from 'react';
import type { LoadingStateProps } from '@/lib/types';
import { buildClassName } from '@/lib/design-system';
import Button from './ui/button';

const LoadingState: React.FC<LoadingStateProps> = ({
  state,
  steps = [],
  onCancel,
  className = '',
}) => {
  const defaultSteps = [
    {
      id: 'validate',
      title: 'Validating VIN',
      description: 'Verifying vehicle identification number format and authenticity',
      status: 'completed' as const,
      duration: 2,
    },
    {
      id: 'gather',
      title: 'Gathering Data',
      description: 'Collecting information from multiple automotive databases',
      status: state.status === 'processing' && state.progress < 50 ? 'active' : 
             state.status === 'completed' || state.progress >= 50 ? 'completed' : 'pending',
      duration: 8,
    },
    {
      id: 'analyze',
      title: 'AI Analysis',
      description: 'Analyzing patterns and generating insights using advanced AI',
      status: state.status === 'processing' && state.progress >= 50 ? 'active' : 
             state.status === 'completed' ? 'completed' : 'pending',
      duration: 5,
    },
    {
      id: 'generate',
      title: 'Creating Report',
      description: 'Compiling comprehensive vehicle history report with recommendations',
      status: state.status === 'completed' ? 'completed' : 'pending',
      duration: 3,
    },
  ];

  const currentSteps = steps.length > 0 ? steps : defaultSteps;
  const currentStepIndex = currentSteps.findIndex(step => step.status === 'active');
  const currentStep = currentSteps[currentStepIndex];

  const getStepIcon = (status: 'pending' | 'active' | 'completed' | 'error') => {
    const baseClasses = 'w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all duration-300';
    
    switch (status) {
      case 'completed':
        return (
          <div className={`${baseClasses} bg-success-500 border-success-500`}>
            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </div>
        );
      case 'active':
        return (
          <div className={`${baseClasses} bg-primary-500 border-primary-500`}>
            <div className="w-4 h-4 bg-white rounded-full animate-pulse-subtle" />
          </div>
        );
      case 'error':
        return (
          <div className={`${baseClasses} bg-error-500 border-error-500`}>
            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </div>
        );
      case 'pending':
      default:
        return (
          <div className={`${baseClasses} bg-neutral-200 border-neutral-300`}>
            <div className="w-3 h-3 bg-neutral-400 rounded-full" />
          </div>
        );
    }
  };

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
    <div className={buildClassName('w-full max-w-2xl mx-auto', className)}>
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 rounded-full mb-4">
          <svg className="w-8 h-8 text-primary-600 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        </div>
        
        <h2 className="text-2xl font-bold text-neutral-900 mb-2">
          Generating Your Vehicle Report
        </h2>
        
        <p className="text-neutral-600 mb-4">
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
        
        <div className="flex justify-between items-center text-sm">
          <span className="text-neutral-600">
            {state.progress}% Complete
          </span>
          <span className="text-neutral-600">
            {getEstimatedTimeRemaining()}
          </span>
        </div>
      </div>

      {/* Steps */}
      <div className="space-y-6 mb-8">
        {currentSteps.map((step, index) => (
          <div
            key={step.id}
            className={buildClassName(
              'flex items-start gap-4 p-4 rounded-lg transition-all duration-300',
              step.status === 'active' ? 'bg-primary-50 border border-primary-200' : 
              step.status === 'completed' ? 'bg-success-50 border border-success-200' :
              step.status === 'error' ? 'bg-error-50 border border-error-200' : 'bg-neutral-50'
            )}
          >
            {/* Step Icon */}
            <div className="flex-shrink-0 mt-1">
              {getStepIcon(step.status as 'pending' | 'active' | 'completed' | 'error')}
            </div>
            
            {/* Step Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className={buildClassName(
                  'font-semibold text-sm',
                  step.status === 'completed' ? 'text-success-800' :
                  step.status === 'active' ? 'text-primary-800' :
                  step.status === 'error' ? 'text-error-800' : 'text-neutral-600'
                )}>
                  {step.title}
                </h3>
                
                {step.status === 'active' && (
                  <div className="flex gap-1">
                    <div className="w-1 h-1 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-1 h-1 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-1 h-1 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                )}
              </div>
              
              <p className={buildClassName(
                'text-sm',
                step.status === 'completed' ? 'text-success-700' :
                step.status === 'active' ? 'text-primary-700' :
                step.status === 'error' ? 'text-error-700' : 'text-neutral-500'
              )}>
                {step.description}
              </p>
              
              {step.status === 'active' && state.currentStep && (
                <div className="mt-2 text-xs text-primary-600 font-medium">
                  {state.currentStep}
                </div>
              )}
            </div>
            
            {/* Step Duration */}
            {step.duration && (
              <div className="text-xs text-neutral-500 mt-1">
                ~{step.duration}s
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Current Status */}
      {currentStep && (
        <div className="bg-neutral-100 rounded-lg p-4 mb-6">
          <div className="flex items-center gap-2 text-sm">
            <div className="w-2 h-2 bg-primary-500 rounded-full animate-pulse" />
            <span className="font-medium text-neutral-900">
              Currently: {currentStep.title}
            </span>
          </div>
          <p className="text-neutral-600 text-sm mt-1">
            {currentStep.description}
          </p>
        </div>
      )}

      {/* Error State */}
      {state.status === 'error' && state.error && (
        <div className="bg-error-50 border border-error-200 rounded-lg p-4 mb-6">
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
        {onCancel && state.status === 'processing' && (
          <Button
            onClick={onCancel}
            variant="outline"
            size="md"
            className="px-6"
          >
            Cancel
          </Button>
        )}
        
        <Button
          variant="ghost"
          size="md"
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
      <div className="mt-8 p-6 bg-gradient-to-r from-neutral-50 to-neutral-100 rounded-lg">
        <div className="text-center">
          <h4 className="font-semibold text-neutral-900 mb-2">Trusted Data Sources</h4>
          <div className="flex items-center justify-center gap-6 text-sm text-neutral-600">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-success-500 rounded-full" />
              <span>CARFAX</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-success-500 rounded-full" />
              <span>AutoCheck</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-success-500 rounded-full" />
              <span>NHTSA</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-success-500 rounded-full" />
              <span>Insurance Records</span>
            </div>
          </div>
          <p className="text-xs text-neutral-500 mt-2">
            Your report is compiled from official automotive databases and verified sources
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoadingState;