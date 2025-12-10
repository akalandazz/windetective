import React, { useState } from 'react';
import type { ExecutiveSummaryProps } from '@/lib/types';
import { buildClassName, buildConditionClassName } from '@/lib/design-system';
import StatusBadge from './ui/status-badge';
import Button from './ui/button';

const ExecutiveSummary: React.FC<ExecutiveSummaryProps> = ({
  summary,
  onViewDetails,
  expanded = false,
  className = '',
}) => {
  const [isExpanded, setIsExpanded] = useState(expanded);

  const getConditionColor = (condition: string) => {
    switch (condition) {
      case 'excellent':
        return 'text-condition-excellent';
      case 'good':
        return 'text-condition-good';
      case 'fair':
        return 'text-condition-fair';
      case 'poor':
        return 'text-condition-poor';
      default:
        return 'text-neutral-600';
    }
  };

  const getRecommendationIcon = (action: string) => {
    switch (action) {
      case 'buy':
        return (
          <svg className="w-6 h-6 text-success-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        );
      case 'negotiate':
        return (
          <svg className="w-6 h-6 text-warning-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        );
      case 'inspect':
        return (
          <svg className="w-6 h-6 text-warning-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
          </svg>
        );
      case 'avoid':
        return (
          <svg className="w-6 h-6 text-error-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        );
      default:
        return (
          <svg className="w-6 h-6 text-neutral-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        );
    }
  };

  const getRecommendationColor = (action: string) => {
    switch (action) {
      case 'buy':
        return 'text-success-600 bg-success-50 border-success-200';
      case 'negotiate':
        return 'text-warning-600 bg-warning-50 border-warning-200';
      case 'inspect':
        return 'text-warning-600 bg-warning-50 border-warning-200';
      case 'avoid':
        return 'text-error-600 bg-error-50 border-error-200';
      default:
        return 'text-neutral-600 bg-neutral-50 border-neutral-200';
    }
  };

  const getRiskStatus = (level: string) => {
    switch (level) {
      case 'low':
        return 'clean' as const;
      case 'medium':
        return 'warning' as const;
      case 'high':
        return 'critical' as const;
      default:
        return 'unavailable' as const;
    }
  };

  const formatCurrency = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-success-600';
    if (confidence >= 0.6) return 'text-warning-600';
    return 'text-error-600';
  };

  return (
    <div className={buildClassName('card bg-gradient-to-br from-white to-neutral-50 border-2', className)}>
      {/* Header */}
      <div className="p-6 border-b border-neutral-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-primary-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M9 3a1 1 0 012 0v5.5a.5.5 0 001 0V4a1 1 0 112 0v4.5a.5.5 0 001 0V6a1 1 0 112 0v5a7 7 0 11-14 0V9a1 1 0 012 0v2.5a.5.5 0 001 0V4a1 1 0 012 0v4.5a.5.5 0 001 0V3z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-neutral-900">Executive Summary</h2>
              <p className="text-neutral-600">AI-powered vehicle analysis and recommendations</p>
            </div>
          </div>
          
          <div className="text-right">
            <div className={buildClassName('text-sm font-medium mb-1', getConfidenceColor(summary.confidence))}>
              {Math.round(summary.confidence * 100)}% Confidence
            </div>
            <div className="w-20 h-2 bg-neutral-200 rounded-full">
              <div 
                className={buildClassName(
                  'h-full rounded-full transition-all duration-300',
                  summary.confidence >= 0.8 ? 'bg-success-500' :
                  summary.confidence >= 0.6 ? 'bg-warning-500' : 'bg-error-500'
                )}
                style={{ width: `${summary.confidence * 100}%` }}
              />
            </div>
          </div>
        </div>
        
        {/* Key Metrics Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* Overall Condition */}
          <div className="text-center">
            <div className={buildClassName(
              'text-2xl font-bold mb-1 capitalize',
              getConditionColor(summary.overallCondition)
            )}>
              {summary.overallCondition}
            </div>
            <div className="text-sm text-neutral-600">Condition</div>
          </div>
          
          {/* Risk Level */}
          <div className="text-center">
            <div className="mb-2">
              <StatusBadge status={getRiskStatus(summary.riskLevel)} size="md" />
            </div>
            <div className="text-sm text-neutral-600">Risk Level</div>
          </div>
          
          {/* Estimated Value */}
          <div className="text-center">
            <div className="text-lg font-bold text-neutral-900 mb-1">
              {formatCurrency(summary.estimatedValue.min)} - {formatCurrency(summary.estimatedValue.max)}
            </div>
            <div className="text-sm text-neutral-600">Est. Value</div>
          </div>
          
          {/* Recommendation */}
          <div className="text-center">
            <div className="flex items-center justify-center mb-1">
              {getRecommendationIcon(summary.recommendedAction)}
            </div>
            <div className="text-sm font-medium text-neutral-900 capitalize">
              {summary.recommendedAction}
            </div>
          </div>
        </div>
      </div>

      {/* Recommendation Banner */}
      <div className={buildClassName(
        'p-4 border-l-4 m-6 rounded-lg border',
        getRecommendationColor(summary.recommendedAction)
      )}>
        <div className="flex items-start gap-3">
          {getRecommendationIcon(summary.recommendedAction)}
          <div>
            <h3 className="font-semibold text-lg mb-1 capitalize">
              Recommended Action: {summary.recommendedAction}
            </h3>
            <p className="text-sm opacity-90">
              {summary.recommendedAction === 'buy' && 'This vehicle shows excellent history with minimal risk factors. Proceed with confidence.'}
              {summary.recommendedAction === 'negotiate' && 'Some concerns identified. Use our findings to negotiate a better price.'}
              {summary.recommendedAction === 'inspect' && 'Professional inspection recommended before purchase. Several areas need attention.'}
              {summary.recommendedAction === 'avoid' && 'Significant issues found. We recommend avoiding this purchase.'}
            </p>
          </div>
        </div>
      </div>

      {/* Key Findings */}
      <div className="px-6 pb-6">
        <h3 className="font-semibold text-neutral-900 mb-4 flex items-center gap-2">
          <svg className="w-5 h-5 text-primary-600" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
          </svg>
          Key Findings ({summary.keyFindings.length})
        </h3>
        
        <div className="space-y-3 mb-6">
          {summary.keyFindings.slice(0, isExpanded ? undefined : 3).map((finding, index) => (
            <div key={index} className="flex items-start gap-3 p-3 bg-neutral-50 rounded-lg">
              <div className="w-6 h-6 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-primary-600 text-sm font-medium">{index + 1}</span>
              </div>
              <p className="text-neutral-700 text-sm leading-relaxed">{finding}</p>
            </div>
          ))}
        </div>
        
        {summary.keyFindings.length > 3 && (
          <div className="flex justify-center mb-4">
            <Button
              onClick={() => setIsExpanded(!isExpanded)}
              variant="ghost"
              size="sm"
              icon={
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d={
                    isExpanded 
                      ? "M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z"
                      : "M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                  } clipRule="evenodd" />
                </svg>
              }
            >
              {isExpanded ? 'Show Less' : `Show ${summary.keyFindings.length - 3} More`}
            </Button>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            onClick={onViewDetails}
            variant="primary"
            size="lg"
            fullWidth
            className="flex-1"
            icon={
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
              </svg>
            }
          >
            View Detailed Report
          </Button>
          
          <Button
            onClick={() => window.print()}
            variant="outline"
            size="lg"
            className="sm:w-auto"
            icon={
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5 4v3H4a2 2 0 00-2 2v3a2 2 0 002 2h1v2a2 2 0 002 2h6a2 2 0 002-2v-2h1a2 2 0 002-2V9a2 2 0 00-2-2h-1V4a2 2 0 00-2-2H7a2 2 0 00-2 2zm8 0H7v3h6V4zm0 8H7v4h6v-4z" clipRule="evenodd" />
              </svg>
            }
          >
            Print Summary
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ExecutiveSummary;