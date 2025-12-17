import { io } from 'socket.io-client';
import { store } from '../../../store';
import { setSocket, clearSocket, setConnectionStatus, setConnectionError } from '../../features/socketSlice';
import Toast from 'react-native-toast-message';

// Import handleError with fallback
let handleError;
try {
  const errorHandler = require('../../utils/errorHandler');
  handleError = errorHandler?.handleError;
} catch (e) {
  // Error handler not available, will use fallback
}

// Safe wrapper for handleError
const safeHandleError = (error, context) => {
  try {
    if (handleError && typeof handleError === 'function') {
      handleError(error instanceof Error ? error : new Error(String(error)), context);
    } else {
      console.error('Error:', error, context ? `Context: ${context}` : '');
    }
  } catch (e) {
    console.error('Error in handleError wrapper:', e);
    console.error('Original error:', error, context ? `Context: ${context}` : '');
  }
};

// Optional notifee import (will be null if not installed)
// Commented out - notifee library removed
let notifee = null;
// try {
//   notifee = require('@notifee/react-native').default;
// } catch (e) {
//   // Notifee not installed, push notifications disabled
// }

class SocketService {
    constructor() {
        this.socket = null;
        this.isConnected = false;
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
        this.eventListeners = new Map(); // Track all event listeners
        this.notificationConfig = {
            enabled: true,
            showToast: true,
            showNotification: true,
        };
    }

    /**
     * Initialize socket connection
     * @param {string} url - Socket server URL
     * @param {object} options - Socket connection options
     */
    initialize(url = 'https://cravess.createdinam.com/', options = {}) {
        if (this.socket && this.socket.connected) {
            console.log('Socket already connected');
            return this.socket;
        }

        // Disconnect existing socket if any
        if (this.socket) {
            this.disconnect();
        }

        const defaultOptions = {
            transports: ['websocket'],
            autoConnect: true,
            reconnection: true,
            reconnectionDelay: 1000,
            reconnectionDelayMax: 5000,
            reconnectionAttempts: this.maxReconnectAttempts,
            timeout: 20000,
            ...options,
        };

        try {
            this.socket = io(url, defaultOptions);
            this.setupEventHandlers();
            
            // Store socket in Redux
            store.dispatch(setSocket(this.socket));
            
            console.log('Socket initialized:', url);
            return this.socket;
        } catch (error) {
            console.error('Error initializing socket:', error);
            safeHandleError(error, 'socket_initialize');
            throw error;
        }
    }

    /**
     * Setup default event handlers
     */
    setupEventHandlers() {
        if (!this.socket) return;

        // Connection events
        this.socket.on('connect', () => {
            console.log('✅ Socket connected:', this.socket.id);
            this.isConnected = true;
            this.reconnectAttempts = 0;
            store.dispatch(setConnectionStatus(true));
            store.dispatch(setConnectionError(null));
            // Don't show notification for initial connection (too noisy)
            // this.notifyUser('Connected', 'Socket connection established', 'success');
        });

        this.socket.on('disconnect', (reason) => {
            console.log('❌ Socket disconnected:', reason);
            this.isConnected = false;
            store.dispatch(setConnectionStatus(false));
            if (reason === 'io server disconnect') {
                // Server disconnected, reconnect manually
                this.socket.connect();
            }
        });

        this.socket.on('connect_error', (error) => {
            console.error('🔴 Socket connection error:', error.message);
            this.reconnectAttempts++;
            store.dispatch(setConnectionStatus(false));
            store.dispatch(setConnectionError(error.message));
            if (this.reconnectAttempts >= this.maxReconnectAttempts) {
                this.notifyUser('Connection Failed', 'Unable to connect to server', 'error');
            }
            safeHandleError(error, 'socket_connect_error');
        });

        this.socket.on('reconnect', (attemptNumber) => {
            console.log('🔄 Socket reconnected after', attemptNumber, 'attempts');
            this.isConnected = true;
            this.reconnectAttempts = 0;
            store.dispatch(setConnectionStatus(true));
            store.dispatch(setConnectionError(null));
            this.notifyUser('Reconnected', 'Connection restored', 'success');
        });

        this.socket.on('reconnect_attempt', (attemptNumber) => {
            console.log('🔄 Reconnection attempt:', attemptNumber);
        });

        this.socket.on('reconnect_failed', () => {
            console.error('❌ Reconnection failed');
            this.notifyUser('Connection Lost', 'Unable to reconnect to server', 'error');
        });

        // Error handling
        this.socket.on('error', (error) => {
            console.error('🔴 Socket error:', error);
            this.notifyUser('Error', error.message || 'Socket error occurred', 'error');
            safeHandleError(error, 'socket_error');
        });
    }

    /**
     * Connect to socket
     */
    connect() {
        if (this.socket && !this.socket.connected) {
            this.socket.connect();
        }
    }

    /**
     * Disconnect from socket
     */
    disconnect() {
        if (this.socket) {
            this.removeAllListeners();
            this.socket.disconnect();
            this.isConnected = false;
            store.dispatch(clearSocket());
            store.dispatch(setConnectionStatus(false));
        }
    }

    /**
     * Emit an event to the server
     * @param {string} event - Event name
     * @param {any} data - Data to send
     * @param {function} callback - Optional callback
     */
    emit(event, data, callback) {
        if (!this.socket || !this.isConnected) {
            return false;
        }

        try {
            if (callback) {
                this.socket.emit(event, data, callback);
            } else {
                this.socket.emit(event, data);
            }
            console.log('📤 Emitted:', event, data);
            return true;
        } catch (error) {
            console.error('❌ Error emitting event:', error);
            return false;
        }
    }

    /**
     * Listen to a socket event
     * @param {string} event - Event name
     * @param {function} callback - Callback function
     * @param {object} options - Options for notification
     */
    on(event, callback, options = {}) {
        if (!this.socket) {
            return;
        }

        const listenerId = `${event}_${Date.now()}_${Math.random()}`;
        
        // Wrap callback to include notification
        const wrappedCallback = (data) => {
            console.log('📥 Received:', event, data);
            
            // Show notification if enabled
            if (options.showNotification !== false && this.notificationConfig.showNotification) {
                this.handleNotification(event, data, options);
            }
            
            // Call original callback
            callback(data);
        };

        this.socket.on(event, wrappedCallback);
        
        // Store listener for cleanup
        if (!this.eventListeners.has(event)) {
            this.eventListeners.set(event, []);
        }
        this.eventListeners.get(event).push({ id: listenerId, callback: wrappedCallback });

        return listenerId;
    }

    /**
     * Remove a specific event listener
     * @param {string} event - Event name
     * @param {string} listenerId - Listener ID (optional)
     */
    off(event, listenerId = null) {
        if (!this.socket) return;

        if (listenerId) {
            // Remove specific listener
            const listeners = this.eventListeners.get(event);
            if (listeners) {
                const index = listeners.findIndex(l => l.id === listenerId);
                if (index !== -1) {
                    this.socket.off(event, listeners[index].callback);
                    listeners.splice(index, 1);
                }
            }
        } else {
            // Remove all listeners for this event
            this.socket.off(event);
            this.eventListeners.delete(event);
        }
    }

    /**
     * Remove all event listeners
     */
    removeAllListeners() {
        if (!this.socket) return;
        
        this.eventListeners.forEach((listeners, event) => {
            listeners.forEach(({ callback }) => {
                this.socket.off(event, callback);
            });
        });
        this.eventListeners.clear();
    }

    /**
     * Handle notifications for socket events
     * @param {string} event - Event name
     * @param {any} data - Event data
     * @param {object} options - Notification options
     */
    async handleNotification(event, data, options = {}) {
        const notificationConfig = {
            title: options.title || this.getEventTitle(event),
            message: options.message || this.getEventMessage(event, data),
            type: options.type || 'info',
            ...options,
        };

        // Show toast notification
        if (this.notificationConfig.showToast && notificationConfig.showToast !== false) {
            Toast.show({
                type: notificationConfig.type === 'error' ? 'error' : 
                      notificationConfig.type === 'success' ? 'success' : 'info',
                text1: notificationConfig.title,
                text2: notificationConfig.message,
                visibilityTime: notificationConfig.duration || 4000,
                position: 'top',
            });
        }

        // Show push notification (if app is in background)
        if (this.notificationConfig.showNotification && notificationConfig.showPushNotification !== false) {
            try {
                await this.showPushNotification(notificationConfig);
            } catch (error) {
                console.error('Error showing push notification:', error);
            }
        }
    }

    /**
     * Show push notification using Notifee
     * @param {object} config - Notification configuration
     * Commented out - notifee library removed, using Firebase Messaging instead
     */
    async showPushNotification(config) {
        try {
            if (!notifee) {
                // Notifee removed - notifications handled by Firebase Messaging
                return;
            }

            // Commented out - notifee removed
            // Request permission
            // await notifee.requestPermission();

            // Create channel (Android)
            // const channelId = await notifee.createChannel({
            //     id: 'socket-updates',
            //     name: 'Socket Updates',
            //     importance: 4, // High importance
            // });

            // Display notification
            // await notifee.displayNotification({
            //     title: config.title,
            //     body: config.message,
            //     android: {
            //         channelId,
            //         smallIcon: 'ic_launcher',
            //         pressAction: {
            //             id: 'default',
            //         },
            //     },
            // });
        } catch (error) {
            console.error('Error displaying notification:', error);
            safeHandleError(error, 'showPushNotification');
        }
    }

    /**
     * Get default title for event
     * @param {string} event - Event name
     */
    getEventTitle(event) {
        const titles = {
            'latestOrderUpdate': 'Order Update',
            'orderStatusChanged': 'Order Status Changed',
            'newOrder': 'New Order',
            'orderCancelled': 'Order Cancelled',
            'driverAssigned': 'Driver Assigned',
            'driverLocationUpdate': 'Driver Location Updated',
            'paymentStatus': 'Payment Update',
            'locationUpdated': 'Location Updated',
            'message': 'New Message',
            'notification': 'Notification',
        };
        return titles[event] || 'Update';
    }

    /**
     * Get default message for event
     * @param {string} event - Event name
     * @param {any} data - Event data
     */
    getEventMessage(event, data) {
        if (typeof data === 'string') {
            return data;
        }

        const messages = {
            'latestOrderUpdate': `Order #${data?.orderId || data?.id} status: ${data?.status || 'updated'}`,
            'orderStatusChanged': `Your order status changed to: ${data?.status}`,
            'newOrder': `New order received: #${data?.orderId || data?.id}`,
            'orderCancelled': `Order #${data?.orderId || data?.id} has been cancelled`,
            'driverAssigned': `Driver ${data?.driverName || 'assigned'} for your order`,
            'driverLocationUpdate': 'Driver location updated',
            'paymentStatus': `Payment ${data?.status || 'updated'}`,
            'locationUpdated': 'Location has been updated',
            'message': data?.message || 'You have a new message',
            'notification': data?.message || 'You have a new notification',
        };

        return messages[event] || JSON.stringify(data);
    }

    /**
     * Configure notification settings
     * @param {object} config - Configuration object
     */
    configureNotifications(config) {
        this.notificationConfig = {
            ...this.notificationConfig,
            ...config,
        };
    }

    /**
     * Get socket instance
     */
    getSocket() {
        return this.socket;
    }

    /**
     * Check if socket is connected
     */
    isSocketConnected() {
        return this.socket && this.socket.connected && this.isConnected;
    }

    /**
     * Join a room/channel
     * @param {string} room - Room name
     * @param {object} data - Additional data
     */
    joinRoom(room, data = {}) {
        return this.emit('joinRoom', { room, ...data });
    }

    /**
     * Leave a room/channel
     * @param {string} room - Room name
     */
    leaveRoom(room) {
        return this.emit('leaveRoom', { room });
    }
}

// Create singleton instance
const socketService = new SocketService();

export default socketService;

