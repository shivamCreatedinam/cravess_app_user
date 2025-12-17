import { useEffect, useCallback, useState } from 'react';
import { useSelector } from 'react-redux';
import socketService from '../services/SocketService/SocketService';

/**
 * Custom hook to use socket in any component
 * Provides easy access to socket methods and connection status
 * 
 * @example
 * const { emit, on, off, isConnected, joinRoom, leaveRoom } = useSocket();
 * 
 * useEffect(() => {
 *   const listenerId = on('orderUpdate', (data) => {
 *     console.log('Order updated:', data);
 *   });
 *   
 *   return () => {
 *     off('orderUpdate', listenerId);
 *   };
 * }, []);
 */
const useSocket = () => {
  const [isConnected, setIsConnected] = useState(false);
  const socket = useSelector((state) => state?.socket?.socket);

  // Update connection status
  useEffect(() => {
    const checkConnection = () => {
      setIsConnected(socketService.isSocketConnected());
    };

    checkConnection();
    
    // Check connection status periodically
    const interval = setInterval(checkConnection, 1000);

    return () => clearInterval(interval);
  }, [socket]);

  /**
   * Emit an event to the server
   * @param {string} event - Event name
   * @param {any} data - Data to send
   * @param {function} callback - Optional callback
   */
  const emit = useCallback((event, data, callback) => {
    return socketService.emit(event, data, callback);
  }, []);

  /**
   * Listen to a socket event
   * @param {string} event - Event name
   * @param {function} callback - Callback function
   * @param {object} options - Options for notification
   * @returns {string} Listener ID for cleanup
   */
  const on = useCallback((event, callback, options = {}) => {
    return socketService.on(event, callback, options);
  }, []);

  /**
   * Remove an event listener
   * @param {string} event - Event name
   * @param {string} listenerId - Listener ID (optional)
   */
  const off = useCallback((event, listenerId = null) => {
    socketService.off(event, listenerId);
  }, []);

  /**
   * Join a room/channel
   * @param {string} room - Room name
   * @param {object} data - Additional data
   */
  const joinRoom = useCallback((room, data = {}) => {
    return socketService.joinRoom(room, data);
  }, []);

  /**
   * Leave a room/channel
   * @param {string} room - Room name
   */
  const leaveRoom = useCallback((room) => {
    return socketService.leaveRoom(room);
  }, []);

  /**
   * Manually connect socket
   */
  const connect = useCallback(() => {
    socketService.connect();
  }, []);

  /**
   * Manually disconnect socket
   */
  const disconnect = useCallback(() => {
    socketService.disconnect();
  }, []);

  return {
    socket,
    isConnected,
    emit,
    on,
    off,
    joinRoom,
    leaveRoom,
    connect,
    disconnect,
  };
};

export default useSocket;

