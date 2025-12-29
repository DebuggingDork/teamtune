import { ApiError } from '@/api/types';
import { toast } from '@/hooks/use-toast';

/**
 * Centralized error handling utility
 */
export const handleError = (error: unknown, customMessage?: string): void => {
  let message = customMessage;

  if (!message) {
    // Check for nested error structure from API response
    if (error && typeof error === 'object') {
      const errorObj = error as any;
      
      // Priority 1: Check for nested error.error.message structure (API format: { error: { message: ... } })
      if (errorObj.error?.message) {
        message = errorObj.error.message;
      } 
      // Priority 2: Check for direct message property (ApiError interface)
      else if (errorObj.message && typeof errorObj.message === 'string') {
        message = errorObj.message;
      } 
      // Priority 3: Check axios error response data structure
      else if (errorObj.response?.data) {
        const responseData = errorObj.response.data;
        if (responseData.error?.message) {
          message = responseData.error.message;
        } else if (responseData.message) {
          message = responseData.message;
        }
      }
      
      // Fallback to default if still no message
      if (!message) {
        message = 'An unexpected error occurred';
      }
    } else if (error instanceof Error) {
      message = error.message;
    } else {
      message = 'An unexpected error occurred';
    }
  }

  // Show toast notification with clean UI
  toast({
    title: 'Error',
    description: message,
    variant: 'destructive',
    duration: 5000, // 5 seconds
  });

  // Log error for debugging
  console.error('API Error:', error);
};

/**
 * Extract error message from API error
 */
export const getErrorMessage = (error: unknown): string => {
  if (error && typeof error === 'object' && 'message' in error) {
    return (error as ApiError).message || 'An unexpected error occurred';
  }
  if (error instanceof Error) {
    return error.message;
  }
  return 'An unexpected error occurred';
};

/**
 * Check if error is a network error
 */
export const isNetworkError = (error: unknown): boolean => {
  if (error && typeof error === 'object' && 'status' in error) {
    const apiError = error as ApiError;
    return !apiError.status || apiError.status >= 500;
  }
  return false;
};

/**
 * Check if error is an authentication error
 */
export const isAuthError = (error: unknown): boolean => {
  if (error && typeof error === 'object' && 'status' in error) {
    const apiError = error as ApiError;
    return apiError.status === 401 || apiError.status === 403;
  }
  return false;
};

