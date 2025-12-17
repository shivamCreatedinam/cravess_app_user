/**
 * Common Utility Functions
 * Global utility functions for the application
 */

import Toast from 'react-native-toast-message';

/**
 * Show a toast notification globally
 * Can be called from anywhere in the app (not just components)
 * 
 * @param message - The message to display
 * @param type - Type of toast: 'success' | 'error' | 'info'
 * @param title - Optional title for the toast
 * @param duration - Optional duration in milliseconds (default: 4000)
 * 
 * @example
 * showToast('Operation successful', 'success');
 * showToast('Error occurred', 'error', 'Error');
 * showToast('Information message', 'info', 'Info', 3000);
 */
export const showToast = (
    message: string,
    type: 'success' | 'error' | 'info' = 'info',
    title?: string,
    duration: number = 4000,
): void => {
    Toast.show({
        type: type,
        text1: title || getDefaultTitle(type),
        text2: message,
        visibilityTime: duration,
        position: 'top',
        autoHide: true,
    });
};

/**
 * Show success toast
 */
export const showSuccessToast = (message: string, title?: string, duration?: number): void => {
    showToast(message, 'success', title || 'Success', duration);
};

/**
 * Show error toast
 */
export const showErrorToast = (message: string, title?: string, duration?: number): void => {
    showToast(message, 'error', title || 'Error', duration);
};

/**
 * Show info toast
 */
export const showInfoToast = (message: string, title?: string, duration?: number): void => {
    showToast(message, 'info', title || 'Info', duration);
};

/**
 * Get default title based on type
 */
const getDefaultTitle = (type: 'success' | 'error' | 'info'): string => {
    switch (type) {
        case 'success':
            return 'Success';
        case 'error':
            return 'Error';
        case 'info':
        default:
            return 'Info';
    }
};

/**
 * Legacy function for backward compatibility
 * @deprecated Use showToast, showSuccessToast, showErrorToast, or showInfoToast instead
 */
export function commonToastMessage(message: string, types: string): void {
    const type = types === 'success' || types === 'error' || types === 'info' 
        ? types 
        : 'info';
    showToast(message, type);
}