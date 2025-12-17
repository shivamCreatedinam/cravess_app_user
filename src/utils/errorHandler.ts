/**
 * Global Error Handler
 * Catches unhandled JavaScript errors and promise rejections
 * to prevent app crashes
 */

import crashlytics from '@react-native-firebase/crashlytics';

interface ErrorInfo {
  error: Error;
  isFatal: boolean;
}

// ErrorUtils is a global object in React Native, accessed via global scope
// We'll access it safely within the function

/**
 * Global error handler for unhandled errors
 */
export const setupGlobalErrorHandler = () => {
  // Access ErrorUtils from global scope (it's a React Native global)
  const ErrorUtils = (global as any).ErrorUtils;
  
  // Check if ErrorUtils is available
  if (!ErrorUtils || typeof ErrorUtils.getGlobalHandler !== 'function') {
    return;
  }

  // Store original error handler
  const originalHandler = ErrorUtils.getGlobalHandler();

  // Handle JavaScript errors
  const globalErrorHandler = (error: Error, isFatal: boolean = false) => {
    try {
      const crashlyticsInstance = crashlytics();
      
      // Log error details
      crashlyticsInstance.log(`Global Error Handler: ${error.message}`);
      crashlyticsInstance.setAttribute('error_is_fatal', String(isFatal));
      crashlyticsInstance.setAttribute('error_name', error.name || 'Unknown');
      
      // Record error (non-fatal to prevent crash)
      crashlyticsInstance.recordError(error);
      
      // Log to console
      console.error('Global Error Handler:', error, {isFatal});
      
      // Call original handler if needed (but we prevent crash)
      if (originalHandler && !isFatal) {
        // Only call original for non-fatal errors
        try {
          originalHandler(error, isFatal);
        } catch (e) {
          console.error('Error in original handler:', e);
        }
      }
    } catch (handlerError) {
      // Fallback if Crashlytics fails
      console.error('Error in global error handler:', handlerError);
      console.error('Original error:', error);
    }
  };

  // Set global error handler
  ErrorUtils.setGlobalHandler(globalErrorHandler);

  // Handle unhandled promise rejections
  if (typeof Promise !== 'undefined' && Promise.reject) {
    const originalReject = Promise.reject;
    Promise.reject = function (reason: any) {
      const crashlyticsInstance = crashlytics();
      
      // Log promise rejection
      const error =
        reason instanceof Error
          ? reason
          : new Error(String(reason || 'Unhandled Promise Rejection'));
      
      crashlyticsInstance.log('Unhandled Promise Rejection');
      crashlyticsInstance.recordError(error);
      
      console.error('Unhandled Promise Rejection:', reason);
      
      // Call original reject
      return originalReject.call(Promise, reason);
    };
  }

  console.log('Global error handler setup complete');
};

/**
 * Handle specific error types
 */
export const handleError = (error: Error, context?: string) => {
  const crashlyticsInstance = crashlytics();
  
  // Add context if provided
  if (context) {
    crashlyticsInstance.setAttribute('error_context', context);
    crashlyticsInstance.log(`Error in context: ${context}`);
  }
  
  // Record error
  crashlyticsInstance.recordError(error);
  
  // Log to console
  console.error('Handled error:', error, context ? `Context: ${context}` : '');
};

/**
 * Safe async wrapper to catch errors in async functions
 */
export const safeAsync = <T extends (...args: any[]) => Promise<any>>(
  fn: T,
  context?: string,
): T => {
  return ((...args: any[]) => {
    return fn(...args).catch((error: Error) => {
      handleError(error, context || fn.name);
      throw error; // Re-throw to allow caller to handle if needed
    });
  }) as T;
};

/**
 * Safe sync wrapper to catch errors in sync functions
 */
export const safeSync = <T extends (...args: any[]) => any>(
  fn: T,
  context?: string,
): T => {
  return ((...args: any[]) => {
    try {
      return fn(...args);
    } catch (error) {
      handleError(error as Error, context || fn.name);
      throw error; // Re-throw to allow caller to handle if needed
    }
  }) as T;
};

