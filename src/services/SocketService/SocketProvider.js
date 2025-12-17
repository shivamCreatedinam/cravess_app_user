import React, { useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import socketService from './SocketService';
import { setSocket } from '../../features/socketSlice';

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

/**
 * Socket Provider Component
 * Initialize and manage socket connection globally
 * Add this to your App.js
 */
const SocketProvider = ({ children, socketUrl = 'https://cravess.createdinam.com/' }) => {
    const dispatch = useDispatch();
    const user = useSelector((state) => state?.userInfo?.user);
    const token = useSelector((state) => state?.user?.token);
    const listenersSetup = useRef(false);

    useEffect(() => {
        let isMounted = true;

        const initializeSocket = async () => {
            try {
                // Initialize socket connection
                const socket = socketService.initialize(socketUrl);

                if (!isMounted) return;

                // Store in Redux
                dispatch(setSocket(socket));

                // Authenticate socket if user is logged in
                if (user?.id && token?.access_token) {
                    socketService.emit('authenticate', {
                        userId: user.id,
                        token: token.access_token,
                    });
                }

                // Setup global event listeners only once
                if (!listenersSetup.current) {
                    setupGlobalListeners();
                    listenersSetup.current = true;
                }
            } catch (error) {
                console.error('Error initializing socket:', error);
                safeHandleError(error, 'SocketProvider');
            }
        };

        initializeSocket();

        // Cleanup on unmount
        return () => {
            isMounted = false;
            // Don't disconnect on user/token change, only on unmount
        };
    }, []); // Only run once on mount

    // Re-authenticate when user or token changes
    useEffect(() => {
        if (socketService.isSocketConnected() && user?.id && token?.access_token) {
            socketService.emit('authenticate', {
                userId: user.id,
                token: token.access_token,
            });
        }
    }, [user?.id, token?.access_token]);

    /**
     * Setup global socket event listeners
     * These listeners are set up once and persist throughout the app lifecycle
     */
    const setupGlobalListeners = () => {
        try {
            // Listen for authentication success
            socketService.on('authenticated', (data) => {
                console.log('✅ Socket authenticated:', data);
            }, {
                showNotification: false, // Don't show notification for auth
            });

            // Listen for authentication failure
            socketService.on('authentication_error', (error) => {
                console.error('❌ Socket authentication failed:', error);
                socketService.handleNotification('authentication_error', error, {
                    title: 'Authentication Failed',
                    message: 'Socket authentication failed. Please login again.',
                    type: 'error',
                });
            });

            // Listen for general notifications
            socketService.on('notification', (data) => {
                console.log('📢 Notification received:', data);
                socketService.handleNotification('notification', data, {
                    title: data.title || 'Notification',
                    message: data.message || data.body || 'You have a new notification',
                    type: data.type || 'info',
                });
            });

            // Listen for order updates (global)
            socketService.on('orderUpdate', (data) => {
                console.log('📦 Order update received:', data);
                socketService.handleNotification('orderUpdate', data, {
                    title: 'Order Update',
                    message: `Order #${data.orderId || data.id} has been updated`,
                    type: 'info',
                });
            });

            // Listen for latest order updates
            socketService.on('latestOrderUpdate', (data) => {
                console.log('📦 Latest order update received:', data);
                socketService.handleNotification('latestOrderUpdate', data, {
                    title: 'Order Update',
                    message: `Order #${data.orderId || data.id} status: ${data.status || 'updated'}`,
                    type: 'info',
                });
            });

            // Listen for order status changes
            socketService.on('orderStatusChanged', (data) => {
                console.log('📦 Order status changed:', data);
                socketService.handleNotification('orderStatusChanged', data, {
                    title: 'Order Status Changed',
                    message: `Order status: ${data.status}`,
                    type: 'success',
                });
            });

            // Listen for new orders
            socketService.on('newOrder', (data) => {
                console.log('📦 New order received:', data);
                socketService.handleNotification('newOrder', data, {
                    title: 'New Order',
                    message: `New order #${data.orderId || data.id} received`,
                    type: 'success',
                });
            });

            // Listen for order cancellations
            socketService.on('orderCancelled', (data) => {
                console.log('📦 Order cancelled:', data);
                socketService.handleNotification('orderCancelled', data, {
                    title: 'Order Cancelled',
                    message: `Order #${data.orderId || data.id} has been cancelled`,
                    type: 'error',
                });
            });

            // Listen for driver assignment
            socketService.on('driverAssigned', (data) => {
                console.log('🚗 Driver assigned:', data);
                socketService.handleNotification('driverAssigned', data, {
                    title: 'Driver Assigned',
                    message: `Driver ${data.driverName || 'assigned'} for your order`,
                    type: 'success',
                });
            });

            // Listen for driver location updates
            socketService.on('driverLocationUpdate', (data) => {
                console.log('📍 Driver location updated:', data);
                // Don't show notification for every location update (too frequent)
            }, {
                showNotification: false,
            });

            // Listen for payment status updates
            socketService.on('paymentStatus', (data) => {
                console.log('💳 Payment status update:', data);
                socketService.handleNotification('paymentStatus', data, {
                    title: 'Payment Update',
                    message: `Payment status: ${data.status}`,
                    type: data.status === 'success' ? 'success' : 'info',
                });
            });

            // Listen for new messages
            socketService.on('newMessage', (data) => {
                console.log('💬 New message received:', data);
                socketService.handleNotification('newMessage', data, {
                    title: 'New Message',
                    message: data.message || 'You have a new message',
                    type: 'info',
                });
            });

            console.log('✅ Global socket listeners setup complete');
        } catch (error) {
            console.error('Error setting up global socket listeners:', error);
            safeHandleError(error, 'setupGlobalListeners');
        }
    };

        return <>{children}</>;
    };

export default SocketProvider;

// Export cleanup function for app unmount
export const cleanupSocket = () => {
    socketService.removeAllListeners();
    socketService.disconnect();
};

