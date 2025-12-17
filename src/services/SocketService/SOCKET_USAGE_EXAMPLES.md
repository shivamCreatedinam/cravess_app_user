# Socket Service Usage Guide

## Overview
The Socket Service provides a centralized way to handle WebSocket connections throughout the app. Any screen can easily listen to socket events and receive notifications.

## Features
- ✅ Centralized socket management
- ✅ Automatic reconnection
- ✅ Toast notifications for events
- ✅ Push notifications (background)
- ✅ Redux integration
- ✅ Easy-to-use hook
- ✅ Event listener cleanup
- ✅ Room/Channel support

---

## Quick Start

### 1. Using the Hook in Any Screen

```javascript
import React, { useEffect } from 'react';
import { View, Text } from 'react-native';
import useSocket from '../../hooks/useSocket';

const MyScreen = () => {
    const { emit, on, off, isConnected, joinRoom, leaveRoom } = useSocket();

    useEffect(() => {
        // Listen to an event
        const listenerId = on('orderUpdate', (data) => {
            console.log('Order updated:', data);
            // Handle the update
        }, {
            title: 'Order Update',
            message: 'Your order has been updated',
            type: 'success', // 'success', 'error', 'info'
            showNotification: true, // Show toast notification
        });

        // Cleanup on unmount
        return () => {
            off('orderUpdate', listenerId);
        };
    }, []);

    const handleAction = () => {
        // Emit an event
        emit('updateOrder', { orderId: 123, status: 'delivered' });
    };

    return (
        <View>
            <Text>Socket Status: {isConnected ? 'Connected' : 'Disconnected'}</Text>
        </View>
    );
};
```

---

## Examples

### Example 1: Order Status Updates

```javascript
import useSocket from '../../hooks/useSocket';

const OrderScreen = ({ orderId }) => {
    const { on, off, joinRoom, leaveRoom, isConnected } = useSocket();
    const [orderStatus, setOrderStatus] = useState(null);

    useEffect(() => {
        if (!isConnected) return;

        // Join order room
        joinRoom(`order_${orderId}`, { orderId });

        // Listen for order updates
        const updateListenerId = on('latestOrderUpdate', (data) => {
            setOrderStatus(data);
        }, {
            title: 'Order Update',
            message: `Order #${orderId} has been updated`,
            type: 'info',
        });

        // Listen for status changes
        const statusListenerId = on('orderStatusChanged', (data) => {
            setOrderStatus(prev => ({ ...prev, status: data.status }));
        }, {
            title: 'Status Changed',
            message: `Order status: ${data.status}`,
            type: 'success',
        });

        return () => {
            off('latestOrderUpdate', updateListenerId);
            off('orderStatusChanged', statusListenerId);
            leaveRoom(`order_${orderId}`);
        };
    }, [orderId, isConnected]);

    return <View>...</View>;
};
```

### Example 2: Real-time Chat

```javascript
const ChatScreen = ({ chatId }) => {
    const { emit, on, off, joinRoom, leaveRoom } = useSocket();
    const [messages, setMessages] = useState([]);

    useEffect(() => {
        // Join chat room
        joinRoom(`chat_${chatId}`);

        // Listen for new messages
        const messageListenerId = on('newMessage', (data) => {
            setMessages(prev => [...prev, data]);
        }, {
            title: 'New Message',
            message: data.message || 'You have a new message',
            type: 'info',
        });

        return () => {
            off('newMessage', messageListenerId);
            leaveRoom(`chat_${chatId}`);
        };
    }, [chatId]);

    const sendMessage = (text) => {
        emit('sendMessage', {
            chatId,
            message: text,
            timestamp: Date.now(),
        });
    };

    return <View>...</View>;
};
```

### Example 3: Driver Location Tracking

```javascript
const TrackDriverScreen = ({ orderId }) => {
    const { on, off, isConnected } = useSocket();
    const [driverLocation, setDriverLocation] = useState(null);

    useEffect(() => {
        if (!isConnected) return;

        // Listen for driver location updates
        const locationListenerId = on('driverLocationUpdate', (data) => {
            setDriverLocation({
                latitude: data.latitude,
                longitude: data.longitude,
            });
        }, {
            showNotification: false, // Don't notify for every location update
        });

        return () => {
            off('driverLocationUpdate', locationListenerId);
        };
    }, [isConnected]);

    return <View>...</View>;
};
```

### Example 4: Restaurant Order Notifications

```javascript
const RestaurantDashboard = () => {
    const { on, off, isConnected } = useSocket();
    const [newOrders, setNewOrders] = useState([]);

    useEffect(() => {
        if (!isConnected) return;

        // Listen for new orders
        const newOrderListenerId = on('newOrder', (data) => {
            setNewOrders(prev => [data, ...prev]);
        }, {
            title: 'New Order',
            message: `New order #${data.orderId} received`,
            type: 'success',
        });

        // Listen for order cancellations
        const cancelListenerId = on('orderCancelled', (data) => {
            setNewOrders(prev => prev.filter(o => o.id !== data.orderId));
        }, {
            title: 'Order Cancelled',
            message: `Order #${data.orderId} has been cancelled`,
            type: 'error',
        });

        return () => {
            off('newOrder', newOrderListenerId);
            off('orderCancelled', cancelListenerId);
        };
    }, [isConnected]);

    return <View>...</View>;
};
```

### Example 5: Payment Status Updates

```javascript
const PaymentScreen = ({ orderId }) => {
    const { on, off } = useSocket();
    const [paymentStatus, setPaymentStatus] = useState('pending');

    useEffect(() => {
        const paymentListenerId = on('paymentStatus', (data) => {
            setPaymentStatus(data.status);
        }, {
            title: 'Payment Update',
            message: `Payment status: ${data.status}`,
            type: data.status === 'success' ? 'success' : 'info',
        });

        return () => {
            off('paymentStatus', paymentListenerId);
        };
    }, []);

    return <View>...</View>;
};
```

---

## API Reference

### useSocket Hook

Returns an object with:

- `socket` - Socket instance
- `isConnected` - Boolean indicating connection status
- `emit(event, data, callback)` - Emit an event
- `on(event, callback, options)` - Listen to an event
- `off(event, listenerId)` - Remove event listener
- `joinRoom(room, data)` - Join a room/channel
- `leaveRoom(room)` - Leave a room/channel
- `connect()` - Manually connect
- `disconnect()` - Manually disconnect

### Event Options

When using `on()`, you can pass options:

```javascript
on('eventName', callback, {
    title: 'Custom Title',           // Notification title
    message: 'Custom Message',       // Notification message
    type: 'success',                 // 'success', 'error', 'info'
    showNotification: true,          // Show toast notification
    showPushNotification: true,      // Show push notification
    duration: 4000,                  // Toast duration (ms)
})
```

---

## Common Events

### Order Events
- `latestOrderUpdate` - Order status/data updated
- `orderStatusChanged` - Order status changed
- `newOrder` - New order received
- `orderCancelled` - Order cancelled

### Driver Events
- `driverAssigned` - Driver assigned to order
- `driverLocationUpdate` - Driver location updated
- `driverArrived` - Driver arrived at location

### Payment Events
- `paymentStatus` - Payment status update
- `paymentSuccess` - Payment successful
- `paymentFailed` - Payment failed

### General Events
- `notification` - General notification
- `message` - New message
- `locationUpdated` - Location updated

---

## Best Practices

1. **Always cleanup listeners** in useEffect return
2. **Check connection status** before emitting events
3. **Use rooms** for scoped events (order-specific, chat-specific)
4. **Disable notifications** for high-frequency events (location updates)
5. **Handle errors** gracefully
6. **Use TypeScript** for type safety (if available)

---

## Troubleshooting

### Socket not connecting
- Check if SocketProvider is in App.js
- Verify socket URL is correct
- Check network connectivity

### Notifications not showing
- Ensure Toast component is in App.js
- Check notification permissions
- Verify notification config is enabled

### Events not received
- Check if listener is properly set up
- Verify event name matches server
- Check connection status

---

## Advanced Usage

### Custom Notification Handler

```javascript
import socketService from '../../services/SocketService/SocketService';

// Configure notifications
socketService.configureNotifications({
    enabled: true,
    showToast: true,
    showNotification: true,
});

// Custom notification
socketService.handleNotification('customEvent', data, {
    title: 'Custom Title',
    message: 'Custom Message',
    type: 'success',
});
```

### Direct Socket Access

```javascript
import socketService from '../../services/SocketService/SocketService';

const socket = socketService.getSocket();
socket.emit('customEvent', data);
```

---

*For more information, see the SocketService source code.*

