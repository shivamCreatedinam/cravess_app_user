import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, Alert, ImageBackground, StyleSheet } from 'react-native';
import useSocket from '../../hooks/useSocket';

const TrackOrderScreen = ({ route }) => {
    const { orderId, userId } = route.params;
    const [orderStatus, setOrderStatus] = useState(null);
    const [loading, setLoading] = useState(true);
    const { emit, on, off, joinRoom, leaveRoom, isConnected } = useSocket();

    useEffect(() => {
        if (!isConnected) {
            console.warn('Socket not connected');
            return;
        }

        // Join order room
        console.log('Joining Order Room:', orderId, userId);
        joinRoom(`order_${orderId}`, { orderId, userId });
        emit('joinOrderRoom', { orderId, userId });

        // Listen for order updates with notification
        const updateListenerId = on('latestOrderUpdate', (data) => {
            console.log('🆕 Order Update:', data);
            setOrderStatus(data);
            setLoading(false);
        }, {
            title: 'Order Update',
            message: `Order #${orderId} status: ${data?.status || 'updated'}`,
            type: 'info',
            showNotification: true,
        });

        // Listen for order status changes
        const statusListenerId = on('orderStatusChanged', (data) => {
            console.log('📦 Order Status Changed:', data);
            setOrderStatus(prev => ({ ...prev, ...data }));
        }, {
            title: 'Status Changed',
            message: `Order status changed to: ${data?.status}`,
            type: 'success',
        });

        // Listen for driver location updates
        const locationListenerId = on('driverLocationUpdate', (data) => {
            console.log('🚗 Driver Location Update:', data);
            setOrderStatus(prev => ({
                ...prev,
                driver_latitude: data.latitude,
                driver_longitude: data.longitude,
            }));
        }, {
            showNotification: false, // Don't notify for every location update
        });

        return () => {
            // Cleanup listeners
            off('latestOrderUpdate', updateListenerId);
            off('orderStatusChanged', statusListenerId);
            off('driverLocationUpdate', locationListenerId);
            leaveRoom(`order_${orderId}`);
        };
    }, [orderId, userId, isConnected, emit, on, off, joinRoom, leaveRoom]);

    if (loading) {
        return (
            <ImageBackground source={require('../../assets/background_app.png')} style={styles.container}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#f35353" />
                    <Text style={styles.loadingText}>Loading order status...</Text>
                    {!isConnected && (
                        <Text style={styles.warningText}>⚠️ Not connected to server</Text>
                    )}
                </View>
            </ImageBackground>
        );
    }

    return (
        <ImageBackground source={require('../../assets/background_app.png')} style={styles.container}>
            <View style={styles.content}>
                <View style={styles.header}>
                    <Text style={styles.orderId}>Order #{orderId}</Text>
                    <View style={[styles.statusBadge, { backgroundColor: getStatusColor(orderStatus?.status) }]}>
                        <Text style={styles.statusText}>{orderStatus?.status || 'Unknown'}</Text>
                    </View>
                </View>
                
                {orderStatus?.eta_minutes && (
                    <View style={styles.infoCard}>
                        <Text style={styles.infoLabel}>Estimated Time</Text>
                        <Text style={styles.infoValue}>{orderStatus.eta_minutes} minutes</Text>
                    </View>
                )}

                {orderStatus?.driver_latitude && orderStatus?.driver_longitude && (
                    <View style={styles.infoCard}>
                        <Text style={styles.infoLabel}>Driver Location</Text>
                        <Text style={styles.infoValue}>
                            {orderStatus.driver_latitude.toFixed(4)}, {orderStatus.driver_longitude.toFixed(4)}
                        </Text>
                    </View>
                )}

                {orderStatus?.driver_name && (
                    <View style={styles.infoCard}>
                        <Text style={styles.infoLabel}>Driver</Text>
                        <Text style={styles.infoValue}>{orderStatus.driver_name}</Text>
                    </View>
                )}

                {!isConnected && (
                    <View style={styles.warningCard}>
                        <Text style={styles.warningText}>⚠️ Not connected to server. Updates may be delayed.</Text>
                    </View>
                )}
            </View>
        </ImageBackground>
    );
};

const getStatusColor = (status) => {
    const colors = {
        'placed': '#ffc107',
        'accepted': '#17a2b8',
        'preparing': '#007bff',
        'ready': '#28a745',
        'on_the_way': '#6f42c1',
        'delivered': '#28a745',
        'cancelled': '#dc3545',
    };
    return colors[status] || '#6c757d';
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 10,
        fontSize: 16,
        color: '#666',
    },
    content: {
        padding: 16,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    orderId: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
    },
    statusBadge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
    },
    statusText: {
        color: '#fff',
        fontWeight: 'bold',
        textTransform: 'uppercase',
    },
    infoCard: {
        backgroundColor: '#fff',
        padding: 15,
        borderRadius: 10,
        marginBottom: 10,
        elevation: 2,
    },
    infoLabel: {
        fontSize: 12,
        color: '#666',
        marginBottom: 5,
    },
    infoValue: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
    },
    warningCard: {
        backgroundColor: '#fff3cd',
        padding: 15,
        borderRadius: 10,
        marginTop: 10,
        borderWidth: 1,
        borderColor: '#ffc107',
    },
    warningText: {
        color: '#856404',
        fontSize: 14,
    },
});

export default TrackOrderScreen;
