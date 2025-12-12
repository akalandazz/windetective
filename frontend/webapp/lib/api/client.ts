import type {
  BackendReportResponse,
  CeleryTask,
  ReportTaskResult,
  PollingOptions
} from '@/lib/types/api';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

class ApiError extends Error {
  constructor(
    message: string,
    public status?: number,
    public code?: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

class ApiClient {
  private baseURL: string;
  private defaultHeaders: Record<string, string>;

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL;
    this.defaultHeaders = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    
    // Merge headers properly
    const headers = new Headers(this.defaultHeaders);
    if (options.headers) {
      const optionHeaders = new Headers(options.headers);
      optionHeaders.forEach((value, key) => {
        headers.set(key, value);
      });
    }
    
    const config: RequestInit = {
      ...options,
      headers: headers,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new ApiError(
          errorData.detail || `HTTP ${response.status}: ${response.statusText}`,
          response.status,
          errorData.code
        );
      }

      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        return await response.json();
      }
      
      return response.text() as unknown as T;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      
      // Network or other errors
      throw new ApiError(
        error instanceof Error ? error.message : 'Network error occurred',
        undefined,
        'NETWORK_ERROR'
      );
    }
  }

  async get<T>(endpoint: string, headers?: Record<string, string>): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'GET',
      headers,
    });
  }

  async post<T>(
    endpoint: string,
    data?: unknown,
    headers?: Record<string, string>
  ): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      headers,
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  // Celery Task endpoints for asynchronous report generation
  async startReportTask(vin: string): Promise<CeleryTask> {
    return this.post<CeleryTask>('/api/v1/reports/generate', { vin });
  }

  async getTaskResult(taskId: string): Promise<ReportTaskResult> {
    return this.get<ReportTaskResult>(`/api/v1/reports/result/${taskId}`);
  }

  async pollTaskResult(
    taskId: string,
    options: PollingOptions = { interval: 2000, timeout: 60000 }
  ): Promise<BackendReportResponse> {
    const { interval = 2000, timeout = 60000 } = options;
    const startTime = Date.now();
   
    while (Date.now() - startTime < timeout) {
      const result = await this.getTaskResult(taskId);
     
      if (result.status === 'SUCCESS' && result.result) {
        return result.result;
      }
     
      if (result.status === 'FAILURE' || result.status === 'REVOKED') {
        throw new ApiError(
          result.message || 'Task failed',
          undefined,
          'TASK_FAILED'
        );
      }
     
      // Wait before polling again
      await new Promise(resolve => setTimeout(resolve, interval));
    }
   
    throw new ApiError(
      'Task polling timed out',
      undefined,
      'POLLING_TIMEOUT'
    );
  }
}

// Create singleton instance
export const apiClient = new ApiClient();

// Export error class for error handling
export { ApiError };


// Utility functions for common API operations
export const apiUtils = {
  /**
   * Handles API errors and converts them to user-friendly messages
   */
  handleApiError: (error: unknown): string => {
    if (error instanceof ApiError) {
      switch (error.code) {
        case 'NETWORK_ERROR':
          return 'Unable to connect to the server. Please check your internet connection.';
        case 'VALIDATION_ERROR':
          return 'Invalid VIN format. Please check and try again.';
        case 'TASK_FAILED':
          return 'Report generation failed. Please try again.';
        case 'POLLING_TIMEOUT':
          return 'Report generation is taking longer than expected. Please try again later.';
        case 'TIMEOUT':
          return 'Request timed out. Please try again.';
        default:
          // Ensure message is a string
          const message = error.message;
          if (typeof message === 'string') {
            return message;
          } else if (message && typeof message === 'object') {
            return JSON.stringify(message);
          }
          return 'An unexpected error occurred.';
      }
    }

    if (error instanceof Error) {
      return error.message;
    }

    return 'An unexpected error occurred. Please try again.';
  },

  /**
   * Validates VIN format before sending to API
   */
  validateVin: (vin: string): { isValid: boolean; error?: string } => {
    if (!vin || typeof vin !== 'string') {
      return { isValid: false, error: 'VIN is required' };
    }
    
    const cleanVin = vin.trim().toUpperCase();
    
    if (cleanVin.length !== 17) {
      return { isValid: false, error: 'VIN must be exactly 17 characters' };
    }
    
    // Check for invalid characters (I, O, Q are not allowed in VINs)
    if (!/^[A-HJ-NPR-Z0-9]{17}$/.test(cleanVin)) {
      return { isValid: false, error: 'VIN contains invalid characters (I, O, Q not allowed)' };
    }
    
    return { isValid: true };
  },

  /**
   * Creates a request timeout wrapper
   */
  withTimeout: <T>(
    promise: Promise<T>,
    timeoutMs: number = 30000
  ): Promise<T> => {
    return new Promise((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        reject(new ApiError('Request timed out', undefined, 'TIMEOUT'));
      }, timeoutMs);

      promise
        .then(resolve)
        .catch(reject)
        .finally(() => clearTimeout(timeoutId));
    });
  },

  /**
   * Retry mechanism for failed requests
   */
  retry: async <T>(
    fn: () => Promise<T>,
    maxRetries: number = 3,
    delayMs: number = 1000
  ): Promise<T> => {
    let lastError: unknown;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error;
        
        // Don't retry on client errors (4xx)
        if (error instanceof ApiError && error.status && error.status >= 400 && error.status < 500) {
          throw error;
        }
        
        // Last attempt
        if (attempt === maxRetries) {
          throw error;
        }
        
        // Wait before retry with exponential backoff
        await new Promise(resolve => 
          setTimeout(resolve, delayMs * Math.pow(2, attempt))
        );
      }
    }

    throw lastError;
  },
};

// Default export
export default apiClient;