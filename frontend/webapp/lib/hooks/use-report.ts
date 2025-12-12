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
  });

  const abortControllerRef = useRef<AbortController | null>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);

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
  }, []);

  // Progress simulation function
  const simulateProgress = useCallback((startProgress: number = 0, endProgress: number = 90) => {
    let currentProgress = startProgress;
    const increment = (endProgress - startProgress) / 20; // 20 updates over the duration
    
    progressIntervalRef.current = setInterval(() => {
      currentProgress = Math.min(currentProgress + increment, endProgress);
      
      setState(prev => ({
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

    setState(prev => ({ ...prev, currentStep }));
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
    });

    // Clean up any previous requests
    cleanup();

    // Validate VIN
    const validation = apiUtils.validateVin(vin);
    if (!validation.isValid) {
      setState(prev => ({
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
      setState(prev => ({
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
      setState(prev => ({
        ...prev,
        status: 'polling',
        progress: 20,
        currentStep: 'Generating report (this may take a moment)',
        taskId: taskResponse.id,
      }));

      // Poll for task completion
      const backendResponse = await apiUtils.retry(
        () => apiUtils.withTimeout(
          apiClient.pollTaskResult(taskResponse.id, {
            interval: 2000,
            timeout: timeoutMs
          }),
          timeoutMs
        ),
        retryAttempts
      );

      // Transform backend response to frontend format
      const transformedReport = transformBackendReport(backendResponse, vin);
      setReport(transformedReport);

      // Complete state
      setState(prev => ({
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

      setState(prev => ({
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
    setState(prev => ({
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
  const isLoading = state.status === 'validating' || state.status === 'processing';
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