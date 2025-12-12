import { useState, useCallback, useRef, useEffect } from 'react';
import type { CarReport, ReportState, BackendReportResponse } from '@/lib/types';
import { apiClient, apiUtils, ApiError } from '@/lib/api/client';
import { transformBackendReport } from '@/lib/utils/data-transformer';

interface UseReportOptions {
  onSuccess?: (report: CarReport) => void;
  onError?: (error: string) => void;
  timeoutMs?: number;
  retryAttempts?: number;
}

export interface UseReportReturn {
  report: CarReport | null;
  state: ReportState;
  generateReport: (vin: string) => Promise<void>;
  cancelReport: () => void;
  reset: () => void;
  isLoading: boolean;
  hasError: boolean;
  error: string | null;
}

export const useReport = (options: UseReportOptions = {}): UseReportReturn => {
  const {
    onSuccess,
    onError,
    timeoutMs = 60000, // 60 seconds timeout
    retryAttempts = 2,
  } = options;

  const [report, setReport] = useState<CarReport | null>(null);
  const [state, setState] = useState<ReportState>({
    status: 'idle',
    progress: 0,
    estimatedTime: undefined,
    currentStep: undefined,
    error: undefined,
    taskId: undefined,
  });

  const abortControllerRef = useRef<AbortController | null>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const pollingTimeoutRef = useRef<number | null>(null);

  // Cleanup function
  const cleanup = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }
    if (pollingTimeoutRef.current) {
      clearTimeout(pollingTimeoutRef.current);
      pollingTimeoutRef.current = null;
    }
  }, []);

  // Progress simulation function
  const simulateProgress = useCallback((startProgress: number = 0, endProgress: number = 90) => {
    let currentProgress = startProgress;
    const increment = (endProgress - startProgress) / 20; // 20 updates over the duration
    
    progressIntervalRef.current = setInterval(() => {
      currentProgress = Math.min(currentProgress + increment, endProgress);
      
      setState((prev: ReportState) => ({
        ...prev,
        progress: Math.round(currentProgress),
      }));
 
      if (currentProgress >= endProgress) {
        if (progressIntervalRef.current) {
          clearInterval(progressIntervalRef.current);
          progressIntervalRef.current = null;
        }
      }
    }, 500); // Update every 500ms
  }, []);

  // Update current step based on progress
  useEffect(() => {
    if (state.status !== 'processing') return;
 
    let currentStep: string;
    if (state.progress < 25) {
      currentStep = 'Validating VIN and checking format';
    } else if (state.progress < 50) {
      currentStep = 'Gathering data from automotive databases';
    } else if (state.progress < 75) {
      currentStep = 'Running AI analysis on collected data';
    } else if (state.progress < 95) {
      currentStep = 'Generating comprehensive report';
    } else {
      currentStep = 'Finalizing report structure';
    }
 
    setState((prev: ReportState) => ({ ...prev, currentStep }));
  }, [state.progress, state.status]);

  const generateReport = useCallback(async (vin: string) => {
    // Reset state
    setReport(null);
    setState({
      status: 'validating',
      progress: 0,
      estimatedTime: 30,
      currentStep: 'Validating VIN format',
      error: undefined,
      taskId: undefined,
    } as ReportState);

    // Clean up any previous requests
    cleanup();

    // Validate VIN
    const validation = apiUtils.validateVin(vin);
    if (!validation.isValid) {
      setState((prev: ReportState) => ({
        ...prev,
        status: 'error',
        error: validation.error,
      }));
      onError?.(validation.error || 'Invalid VIN');
      return;
    }

    try {
      // Create abort controller for this request
      abortControllerRef.current = new AbortController();

      // Start task state
      setState((prev: ReportState) => ({
        ...prev,
        status: 'starting',
        progress: 10,
        currentStep: 'Starting report generation task',
      }));

      // Start the report task
      const taskResponse = await apiUtils.retry(
        () => apiUtils.withTimeout(
          apiClient.startReportTask(vin),
          timeoutMs
        ),
        retryAttempts
      );

      // Update state with task ID
      setState((prev: ReportState) => ({
        ...prev,
        status: 'polling',
        progress: 20,
        currentStep: 'Generating report (this may take a moment)',
        taskId: taskResponse.id,
      }));

      // Enhanced polling system with proper state management
          const backendResponse = await new Promise<BackendReportResponse>(async (resolve, reject) => {
            let attemptCount = 0;
            const maxAttempts = 100;
            const pollingInterval = 2000; // 2 seconds
            
            const pollTask = async () => {
              try {
                attemptCount++;
                console.log(`Polling attempt ${attemptCount} for task ${taskResponse.id}`);
                
                // Update progress based on attempts
                const progress = Math.min(90, 20 + Math.floor((attemptCount / maxAttempts) * 70));
                setState((prev: ReportState) => ({
                  ...prev,
                  progress,
                  currentStep: `Polling for results (attempt ${attemptCount}/${maxAttempts})`,
                }));
                
                const result = await apiClient.getTaskResult(taskResponse.id);
                
                console.log(`Task ${taskResponse.id} status: ${result.status}`);
  
                // Handle different task states
               switch (result.status) {
                 case 'SUCCESS':
                 case 'COMPLETED':
                   if (result.result) {
                     console.log('Task completed successfully');
                     resolve(result.result);
                     return;
                   } else {
                     throw new ApiError('Task completed but no result returned', undefined, 'NO_RESULT');
                   }
                 case 'PENDING':
                   console.log('Task is pending, continuing to poll...');
                   // Continue polling for PENDING tasks
                   if (attemptCount >= maxAttempts) {
                     console.error('Maximum polling attempts reached');
                     reject(new ApiError(
                       'Request taking too long. Please try again.',
                       undefined,
                       'POLLING_TIMEOUT'
                     ));
                     return;
                   }
                   // Schedule next poll
                   pollingTimeoutRef.current = window.setTimeout(pollTask, pollingInterval);
                   return;
                    
                 case 'FAILURE':
                 case 'REVOKED':
                   console.error('Task failed:', result.message || 'Unknown error');
                   reject(new ApiError(
                     result.message || 'Task failed',
                     undefined,
                     'TASK_FAILED'
                   ));
                   return;
                    
                 case 'PENDING':
                 case 'STARTED':
                 case 'IN_PROGRESS':
                   // Continue polling
                   if (attemptCount >= maxAttempts) {
                     console.error('Maximum polling attempts reached');
                     reject(new ApiError(
                       'Request taking too long. Please try again.',
                       undefined,
                       'POLLING_TIMEOUT'
                     ));
                     return;
                   }
                    
                   // Schedule next poll
                   pollingTimeoutRef.current = window.setTimeout(pollTask, pollingInterval);
                   return;
                    
                 default:
                   console.error('Unknown task status:', result.status);
                   reject(new ApiError(
                     `Unknown task status: ${result.status}`,
                     undefined,
                     'UNKNOWN_STATUS'
                   ));
                   return;
               }
              } catch (error) {
                console.error('Polling error:', error);
  
                // Clean up timeout
                if (pollingTimeoutRef.current) {
                  clearTimeout(pollingTimeoutRef.current);
                  pollingTimeoutRef.current = null;
                }
  
                // Handle network errors and other issues
                if (error instanceof ApiError) {
                  // Handle task not found error specifically
                  if (error.message.includes('Task ID') && error.message.includes('not found')) {
                    reject(new ApiError(
                      'Task not found. The report generation task may have expired or been cleaned up. Please try generating the report again.',
                      undefined,
                      'TASK_NOT_FOUND'
                    ));
                  } else {
                    reject(error);
                  }
                } else {
                  reject(new ApiError(
                    error instanceof Error ? error.message : 'Network error during polling',
                    undefined,
                    'NETWORK_ERROR'
                  ));
                }
              }
            };
            
            // Start polling
            pollTask();
            
            // Set overall timeout
            setTimeout(() => {
              if (pollingTimeoutRef.current) {
                clearTimeout(pollingTimeoutRef.current);
                pollingTimeoutRef.current = null;
              }
              console.error('Overall polling timeout reached');
              reject(new ApiError(
                'Request timed out after maximum duration',
                undefined,
                'POLLING_TIMEOUT'
              ));
            }, timeoutMs);
          });

      // Transform backend response to frontend format
      console.log('About to transform backend response:', backendResponse);
      const transformedReport = transformBackendReport(backendResponse, vin);
      console.log('Successfully transformed report:', transformedReport);
      setReport(transformedReport);

      // Complete state
      setState((prev: ReportState) => ({
        ...prev,
        status: 'completed',
        progress: 100,
        currentStep: 'Report completed successfully',
        error: undefined,
      }));

      onSuccess?.(transformedReport);

    } catch (error) {
      cleanup();

      const errorMessage = apiUtils.handleApiError(error);
      console.error('Report generation failed:', error);

      setState((prev: ReportState) => ({
        ...prev,
        status: 'error',
        error: errorMessage,
        progress: 0,
      }));

      onError?.(errorMessage);
    }
  }, [cleanup, timeoutMs, retryAttempts, onSuccess, onError]);

  const cancelReport = useCallback(() => {
    cleanup();
    setState((prev: ReportState) => ({
      ...prev,
      status: 'idle',
      progress: 0,
      currentStep: undefined,
      error: undefined,
    }));
  }, [cleanup]);

  const reset = useCallback(() => {
    cleanup();
    setReport(null);
    setState({
      status: 'idle',
      progress: 0,
      estimatedTime: undefined,
      currentStep: undefined,
      error: undefined,
    });
  }, [cleanup]);

  // Cleanup on unmount
  useEffect(() => {
    return cleanup;
  }, [cleanup]);

  // Computed values
  const isLoading = state.status === 'validating' || state.status === 'starting' || state.status === 'polling';
  const hasError = state.status === 'error';
  const error = state.error || null;

  return {
    report,
    state,
    generateReport,
    cancelReport,
    reset,
    isLoading,
    hasError,
    error,
  };
};


export default useReport;