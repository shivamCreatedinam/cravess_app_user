import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ActivityIndicator,
    ImageBackground,
    TouchableOpacity,
    Dimensions,
    ScrollView,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import useSocket from '../../hooks/useSocket';

// Check if react-native-maps is available
let MapView, Marker;
try {
    const maps = require('react-native-maps');
    MapView = maps.default;
    Marker = maps.Marker;
} catch (e) {
    // Fallback component if react-native-maps is not installed
    MapView = ({ children, style, ...props }) => (
        <View style={[style, { backgroundColor: '#e0e0e0', justifyContent: 'center', alignItems: 'center' }]} {...props}>
            <Text style={{ color: '#666' }}>Map not available</Text>
            {children}
        </View>
    );
    Marker = ({ children, ...props }) => <View>{children}</View>;
}

const { width, height } = Dimensions.get('window');

const TrackDriverScreen = () => {
    const route = useRoute();
    const navigation = useNavigation();
    const { orderId, driverId, driverName, customerName, deliveryAddress } = route.params || {};
    
    const { emit, on, off, isConnected, joinRoom, leaveRoom } = useSocket();
    const [driverLocation, setDriverLocation] = useState(null);
    const [orderStatus, setOrderStatus] = useState(null);
    const [loading, setLoading] = useState(true);
    const [lastUpdate, setLastUpdate] = useState(null);

    useEffect(() => {
        if (!isConnected || !driverId || !orderId) {
            setLoading(false);
            return;
        }

        // Join driver tracking room
        joinRoom(`driver_${driverId}`, { driverId, orderId });
        joinRoom(`order_${orderId}`, { orderId, driverId });

        // Request current driver location
        emit('getDriverLocation', { driverId, orderId });

        // Listen for driver location updates
        const locationListenerId = on('driverLocationUpdate', (data) => {
            console.log('🚗 Driver location received:', data);
            if (data.driverId === driverId || data.orderId === orderId) {
                setDriverLocation({
                    latitude: data.latitude || data.lat,
                    longitude: data.longitude || data.lng,
                    heading: data.heading,
                });
                setLastUpdate(new Date());
                setLoading(false);
            }
        }, {
            showNotification: false, // Don't show notification for every location update
        });

        // Listen for order status updates
        const statusListenerId = on('orderStatusChanged', (data) => {
            console.log('📦 Order status update:', data);
            if (data.orderId === orderId) {
                setOrderStatus(data.status);
            }
        }, {
            title: 'Order Status',
            message: `Order status: ${data.status}`,
            type: 'info',
        });

        // Listen for driver arrival
        const arrivalListenerId = on('driverArrived', (data) => {
            console.log('📍 Driver arrived:', data);
            if (data.orderId === orderId) {
                setOrderStatus('arrived');
            }
        }, {
            title: 'Driver Arrived',
            message: 'Driver has arrived at the delivery location',
            type: 'success',
        });

        // Periodic location request (every 5 seconds)
        const locationInterval = setInterval(() => {
            if (isConnected) {
                emit('getDriverLocation', { driverId, orderId });
            }
        }, 5000);

        return () => {
            off('driverLocationUpdate', locationListenerId);
            off('orderStatusChanged', statusListenerId);
            off('driverArrived', arrivalListenerId);
            clearInterval(locationInterval);
            leaveRoom(`driver_${driverId}`);
            leaveRoom(`order_${orderId}`);
        };
    }, [isConnected, driverId, orderId, emit, on, off, joinRoom, leaveRoom]);

    const getStatusColor = (status) => {
        const colors = {
            'placed': '#ffc107',
            'accepted': '#17a2b8',
            'preparing': '#007bff',
            'ready': '#28a745',
            'on_the_way': '#6f42c1',
            'arrived': '#ff9800',
            'delivered': '#28a745',
            'cancelled': '#dc3545',
        };
        return colors[status] || '#6c757d';
    };

    const getStatusText = (status) => {
        return status ? status.replace(/_/g, ' ').toUpperCase() : 'TRACKING';
    };

    return (
        <ImageBackground 
            source={require('../../assets/background_app.png')} 
            style={styles.container}
        >
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Icon name="arrow-back" size={24} color="#f35353" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Track Delivery</Text>
            </View>

            {loading && !driverLocation ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#f35353" />
                    <Text style={styles.loadingText}>Loading driver location...</Text>
                    {!isConnected && (
                        <Text style={styles.warningText}>⚠️ Not connected to server</Text>
                    )}
                </View>
            ) : (
                <ScrollView style={styles.content}>
                    {/* Order Info Card */}
                    <View style={styles.infoCard}>
                        <View style={styles.infoRow}>
                            <Icon name="receipt" size={20} color="#f35353" />
                            <View style={styles.infoContent}>
                                <Text style={styles.infoLabel}>Order ID</Text>
                                <Text style={styles.infoValue}>#{orderId}</Text>
                            </View>
                        </View>
                        <View style={styles.infoRow}>
                            <Icon name="person" size={20} color="#007bff" />
                            <View style={styles.infoContent}>
                                <Text style={styles.infoLabel}>Customer</Text>
                                <Text style={styles.infoValue}>{customerName || 'N/A'}</Text>
                            </View>
                        </View>
                        <View style={styles.infoRow}>
                            <Icon name="delivery-dining" size={20} color="#28a745" />
                            <View style={styles.infoContent}>
                                <Text style={styles.infoLabel}>Driver</Text>
                                <Text style={styles.infoValue}>{driverName || `Driver #${driverId}`}</Text>
                            </View>
                        </View>
                        {orderStatus && (
                            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(orderStatus) }]}>
                                <Text style={styles.statusText}>{getStatusText(orderStatus)}</Text>
                            </View>
                        )}
                    </View>

                    {/* Map View */}
                    {driverLocation ? (
                        <View style={styles.mapContainer}>
                            <MapView
                                style={styles.map}
                                initialRegion={{
                                    latitude: driverLocation.latitude,
                                    longitude: driverLocation.longitude,
                                    latitudeDelta: 0.01,
                                    longitudeDelta: 0.01,
                                }}
                                region={{
                                    latitude: driverLocation.latitude,
                                    longitude: driverLocation.longitude,
                                    latitudeDelta: 0.01,
                                    longitudeDelta: 0.01,
                                }}
                                showsUserLocation={false}
                                showsMyLocationButton={false}
                            >
                                <Marker
                                    coordinate={{
                                        latitude: driverLocation.latitude,
                                        longitude: driverLocation.longitude,
                                    }}
                                    title={driverName || 'Driver'}
                                    description="Delivery Driver Location"
                                    pinColor="#28a745"
                                >
                                    <View style={styles.customMarker}>
                                        <Icon name="delivery-dining" size={30} color="#fff" />
                                    </View>
                                </Marker>
                            </MapView>
                            {lastUpdate && (
                                <View style={styles.updateIndicator}>
                                    <Icon name="refresh" size={14} color="#666" />
                                    <Text style={styles.updateText}>
                                        Updated: {lastUpdate.toLocaleTimeString()}
                                    </Text>
                                </View>
                            )}
                        </View>
                    ) : (
                        <View style={styles.noLocationContainer}>
                            <Icon name="location-off" size={48} color="#999" />
                            <Text style={styles.noLocationText}>Waiting for driver location...</Text>
                        </View>
                    )}

                    {/* Delivery Address */}
                    {deliveryAddress && (
                        <View style={styles.addressCard}>
                            <Icon name="place" size={20} color="#f35353" />
                            <View style={styles.addressContent}>
                                <Text style={styles.addressLabel}>Delivery Address</Text>
                                <Text style={styles.addressText}>{deliveryAddress}</Text>
                            </View>
                        </View>
                    )}

                    {/* Connection Status */}
                    {!isConnected && (
                        <View style={styles.warningCard}>
                            <Icon name="warning" size={20} color="#ff9800" />
                            <Text style={styles.warningText}>
                                Not connected to server. Location updates may be delayed.
                            </Text>
                        </View>
                    )}
                </ScrollView>
            )}
        </ImageBackground>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 15,
        backgroundColor: '#fff',
        elevation: 2,
    },
    backButton: {
        marginRight: 15,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
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
        flex: 1,
    },
    infoCard: {
        backgroundColor: '#fff',
        margin: 15,
        padding: 15,
        borderRadius: 10,
        elevation: 2,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 15,
    },
    infoContent: {
        marginLeft: 12,
        flex: 1,
    },
    infoLabel: {
        fontSize: 12,
        color: '#666',
        marginBottom: 2,
    },
    infoValue: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
    },
    statusBadge: {
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 20,
        alignSelf: 'flex-start',
        marginTop: 5,
    },
    statusText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 12,
    },
    mapContainer: {
        height: height * 0.4,
        margin: 15,
        borderRadius: 10,
        overflow: 'hidden',
        elevation: 2,
    },
    map: {
        flex: 1,
    },
    customMarker: {
        backgroundColor: '#28a745',
        width: 50,
        height: 50,
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 3,
        borderColor: '#fff',
    },
    updateIndicator: {
        position: 'absolute',
        bottom: 10,
        right: 10,
        backgroundColor: '#fff',
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 15,
        flexDirection: 'row',
        alignItems: 'center',
        elevation: 3,
    },
    updateText: {
        fontSize: 10,
        color: '#666',
        marginLeft: 5,
    },
    noLocationContainer: {
        height: height * 0.4,
        margin: 15,
        borderRadius: 10,
        backgroundColor: '#f5f5f5',
        justifyContent: 'center',
        alignItems: 'center',
    },
    noLocationText: {
        marginTop: 10,
        fontSize: 14,
        color: '#999',
    },
    addressCard: {
        backgroundColor: '#fff',
        margin: 15,
        marginTop: 0,
        padding: 15,
        borderRadius: 10,
        flexDirection: 'row',
        elevation: 2,
    },
    addressContent: {
        marginLeft: 12,
        flex: 1,
    },
    addressLabel: {
        fontSize: 12,
        color: '#666',
        marginBottom: 4,
    },
    addressText: {
        fontSize: 14,
        color: '#333',
        lineHeight: 20,
    },
    warningCard: {
        backgroundColor: '#fff3cd',
        margin: 15,
        padding: 15,
        borderRadius: 10,
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#ffc107',
    },
    warningText: {
        marginLeft: 10,
        fontSize: 14,
        color: '#856404',
        flex: 1,
    },
});

export default TrackDriverScreen;

