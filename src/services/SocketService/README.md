# Socket Service - Global Implementation

This socket service provides a **global, app-wide WebSocket connection** that can be accessed from any screen in your React Native app.

## Features

✅ **Global Connection** - Single socket connection shared across the entire app  
✅ **Auto Reconnection** - Automatically reconnects on disconnect  
✅ **Redux Integration** - Socket state managed in Redux store  
✅ **Event Listeners** - Easy-to-use event listening from any component  
✅ **Toast Notifications** - Automatic toast notifications for socket events  
✅ **Error Handling** - Integrated with Firebase Crashlytics  
✅ **Room Support** - Join/leave rooms for scoped events  

## Quick Start

### 1. Socket is Already Initialized

The socket is automatically initialized when the app starts via `SocketProvider` in `App.tsx`. You don't need to do anything to start it.

### 2. Use Socket in Any Screen

```javascript
import React, { useEffect } from 'react';
import { View, Text } from 'react-native';
import useSocket from '../hooks/useSocket';

const MyScreen = () => {
  const { emit, on, off, isConnected } = useSocket();

  useEffect(() => {
    // Listen to an event
    const listenerId = on('orderUpdate', (data) => {
      console.log('Order updated:', data);
      // Update your UI here
    }, {
      title: 'Order Update',
      message: 'Your order has been updated',
      type: 'success',
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

## Available Events

The socket service automatically listens for these global events:

- `authenticated` - Socket authentication successful
- `authentication_error` - Socket authentication failed
- `notification` - General notifications
- `orderUpdate` - Order updates
- `latestOrderUpdate` - Latest order updates
- `orderStatusChanged` - Order status changes
- `newOrder` - New orders received
- `orderCancelled` - Order cancellations
- `driverAssigned` - Driver assigned to order
- `driverLocationUpdate` - Driver location updates (no notification)
- `paymentStatus` - Payment status updates
- `newMessage` - New messages

## API Reference

### useSocket Hook

```javascript
const {
  socket,        // Socket instance
  isConnected,   // Connection status (boolean)
  emit,          // Emit event function
  on,            // Listen to event function
  off,           // Remove listener function
  joinRoom,      // Join room function
  leaveRoom,     // Leave room function
  connect,       // Manually connect
  disconnect,    // Manually disconnect
} = useSocket();
```

### Methods

#### `emit(event, data, callback?)`
Emit an event to the server.

```javascript
emit('updateOrder', { orderId: 123, status: 'delivered' });
```

#### `on(event, callback, options?)`
Listen to a socket event. Returns a listener ID for cleanup.

```javascript
const listenerId = on('orderUpdate', (data) => {
  console.log('Order updated:', data);
}, {
  title: 'Order Update',
  message: 'Your order has been updated',
  type: 'success',
  showNotification: true,
});
```

#### `off(event, listenerId?)`
Remove an event listener.

```javascript
off('orderUpdate', listenerId); // Remove specific listener
off('orderUpdate'); // Remove all listeners for this event
```

#### `joinRoom(room, data?)`
Join a room/channel for scoped events.

```javascript
joinRoom('order_123', { orderId: 123 });
```

#### `leaveRoom(room)`
Leave a room/channel.

```javascript
leaveRoom('order_123');
```

## Examples

### Example 1: Order Status Screen

```javascript
import useSocket from '../hooks/useSocket';

const OrderScreen = ({ orderId }) => {
  const { on, off, joinRoom, leaveRoom, isConnected } = useSocket();
  const [orderStatus, setOrderStatus] = useState(null);

  useEffect(() => {
    if (!isConnected) return;

    // Join order-specific room
    joinRoom(`order_${orderId}`, { orderId });

    // Listen for order updates
    const updateListenerId = on('latestOrderUpdate', (data) => {
      if (data.orderId === orderId) {
        setOrderStatus(data);
      }
    });

    return () => {
      off('latestOrderUpdate', updateListenerId);
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
    joinRoom(`chat_${chatId}`);

    const messageListenerId = on('newMessage', (data) => {
      if (data.chatId === chatId) {
        setMessages(prev => [...prev, data]);
      }
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

### Example 3: Check Connection Status

```javascript
import { useSelector } from 'react-redux';

const StatusScreen = () => {
  const isConnected = useSelector((state) => state.socket.isConnected);
  const connectionError = useSelector((state) => state.socket.connectionError);

  return (
    <View>
      <Text>Status: {isConnected ? 'Connected' : 'Disconnected'}</Text>
      {connectionError && <Text>Error: {connectionError}</Text>}
    </View>
  );
};
```

## Configuration

### Socket URL

The socket URL is configured in `SocketProvider`. Default: `https://cravess.createdinam.com/`

To change it, modify `App.tsx`:

```javascript
<SocketProvider socketUrl="https://your-socket-server.com/">
  ...
</SocketProvider>
```

### Notification Settings

Configure notifications in `SocketService.js`:

```javascript
socketService.configureNotifications({
  enabled: true,
  showToast: true,
  showNotification: true,
});
```

## Best Practices

1. **Always cleanup listeners** in `useEffect` return function
2. **Check connection status** before emitting events
3. **Use rooms** for scoped events (order-specific, chat-specific)
4. **Disable notifications** for high-frequency events (location updates)
5. **Handle errors** gracefully
6. **Use TypeScript** for type safety (if available)

## Troubleshooting

### Socket not connecting
- Check if `SocketProvider` is in `App.tsx`
- Verify socket URL is correct
- Check network connectivity
- Check console for connection errors

### Events not received
- Check if listener is properly set up
- Verify event name matches server
- Check connection status
- Ensure listener cleanup is not removing it prematurely

### Notifications not showing
- Ensure `Toast` component is in `App.tsx` (already added)
- Check notification config is enabled
- Verify event options allow notifications

## Architecture

```
App.tsx
  └── SocketProvider (initializes socket globally)
      └── SocketService (singleton instance)
          └── Redux Store (socket state)
              └── Any Screen (use useSocket hook)
```

The socket connection is:
- **Initialized once** when the app starts
- **Shared globally** across all screens
- **Managed in Redux** for state tracking
- **Automatically reconnects** on disconnect
- **Cleaned up** on app unmount

