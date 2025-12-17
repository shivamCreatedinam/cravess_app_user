/**
 * EXAMPLE: How to use Socket in OrderStatusScreen
 * 
 * This is an example showing how to integrate socket events
 * into the existing OrderStatusScreen for real-time updates
 */

import React, { useEffect } from 'react';
import useSocket from '../../hooks/useSocket';

// Add this to your OrderStatusScreen component
const useOrderStatusSocket = (restaurantId, onOrderUpdate) => {
    const { emit, on, off, isConnected, joinRoom, leaveRoom } = useSocket();

    useEffect(() => {
        if (!isConnected || !restaurantId) return;

        // Join restaurant room to receive all order updates for this restaurant
        joinRoom(`restaurant_${restaurantId}`, { restaurantId });

        // Listen for new orders
        const newOrderListenerId = on('newOrder', (data) => {
            console.log('🆕 New order received:', data);
            if (onOrderUpdate) {
                onOrderUpdate(data);
            }
        }, {
            title: 'New Order',
            message: `New order #${data.orderId || data.id} received`,
            type: 'success',
        });

        // Listen for order status changes
        const statusChangeListenerId = on('orderStatusChanged', (data) => {
            console.log('📦 Order status changed:', data);
            if (onOrderUpdate) {
                onOrderUpdate(data);
            }
        }, {
            title: 'Status Changed',
            message: `Order #${data.orderId} status: ${data.status}`,
            type: 'info',
        });

        // Listen for order cancellations
        const cancelListenerId = on('orderCancelled', (data) => {
            console.log('❌ Order cancelled:', data);
            if (onOrderUpdate) {
                onOrderUpdate(data);
            }
        }, {
            title: 'Order Cancelled',
            message: `Order #${data.orderId} has been cancelled`,
            type: 'error',
        });

        // Listen for driver assignments
        const driverListenerId = on('driverAssigned', (data) => {
            console.log('🚗 Driver assigned:', data);
            if (onOrderUpdate) {
                onOrderUpdate(data);
            }
        }, {
            title: 'Driver Assigned',
            message: `Driver assigned to order #${data.orderId}`,
            type: 'success',
        });

        return () => {
            // Cleanup all listeners
            off('newOrder', newOrderListenerId);
            off('orderStatusChanged', statusChangeListenerId);
            off('orderCancelled', cancelListenerId);
            off('driverAssigned', driverListenerId);
            leaveRoom(`restaurant_${restaurantId}`);
        };
    }, [restaurantId, isConnected, onOrderUpdate]);

    // Function to update order status via socket
    const updateOrderStatus = (orderId, newStatus) => {
        emit('updateOrderStatus', {
            orderId,
            status: newStatus,
            restaurantId,
        });
    };

    // Function to assign driver via socket
    const assignDriver = (orderId, driverId) => {
        emit('assignDriver', {
            orderId,
            driverId,
            restaurantId,
        });
    };

    return {
        updateOrderStatus,
        assignDriver,
        isConnected,
    };
};

// Usage in OrderStatusScreen:
/*
const OrderStatusScreen = ({ route }) => {
    const restaurantId = route?.params?.restaurantId;
    const [orders, setOrders] = useState([]);

    const handleOrderUpdate = (data) => {
        // Refresh orders or update specific order
        fetchOrders(true);
    };

    const { updateOrderStatus, assignDriver, isConnected } = useOrderStatusSocket(
        restaurantId,
        handleOrderUpdate
    );

    // ... rest of your component
};
*/

export default useOrderStatusSocket;

