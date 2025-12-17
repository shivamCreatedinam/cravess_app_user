import { NativeModules, PermissionsAndroid, Platform } from 'react-native';

// Get FloatingWindow native module (if available)
const { FloatingWindow } = NativeModules || {};

// Request permission to show overlay
export const requestOverlayPermission = async () => {
    if (Platform.OS === 'android') {
        try {
            const granted = await PermissionsAndroid.request(
                PermissionsAndroid.PERMISSIONS.SYSTEM_ALERT_WINDOW
            );
            return granted === PermissionsAndroid.RESULTS.GRANTED;
        } catch (err) {
            // Error handled silently
            return false;
        }
    }
    return false;
};

// Show popup window
export const showPopup = async (message) => {
    if (!FloatingWindow || !FloatingWindow.showPopup) {
        // Native module not available, use Alert as fallback
        const { Alert } = require('react-native');
        Alert.alert('Notification', message);
        return;
    }

    const permissionGranted = await requestOverlayPermission();
    if (permissionGranted) {
        try {
            FloatingWindow.showPopup(message);
        } catch (error) {
            // Fallback to Alert if FloatingWindow fails
            const { Alert } = require('react-native');
            Alert.alert('Notification', message);
        }
    } else {
        // Permission denied, use Alert as fallback
        const { Alert } = require('react-native');
        Alert.alert('Notification', message);
    }
};