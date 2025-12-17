import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Geolocation from '@react-native-community/geolocation';
import { useSelector } from 'react-redux';
import useSocket from '../../hooks/useSocket';

export default function AppSettingsScreen() {
    const [location, setLocation] = useState(null);
    const authData = useSelector((state) => state?.userInfo?.user);
    const userId = authData?.id;
    const { emit, on, off, isConnected } = useSocket();

    useEffect(() => {
        if (!userId || !isConnected) {
            return;
        }

        // Register user with the server
        emit('registerUser', userId);
        console.log('Registered user:', userId);

        // Listen for location updates from the server
        const locationListenerId = on('locationUpdated', (data) => {
            console.log('Received location update:', data);
            if (data.latitude && data.longitude) {
                setLocation({ latitude: data.latitude, longitude: data.longitude });
            }
        }, {
            title: 'Location Updated',
            message: 'Your location has been updated on the server',
            type: 'info',
            showNotification: false, // Don't notify for every location update
        });

        return () => {
            off('locationUpdated', locationListenerId);
        };
    }, [userId, isConnected, emit, on, off]);

    useEffect(() => {
        if (!userId) {
            return;
        }

        // Periodically send location updates to the server
        const watchId = Geolocation.watchPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                setLocation({ latitude, longitude });
                console.log('ReceivedGeolocation:', JSON.stringify(position.coords));
                
                // Emit location update to the server via socket
                if (isConnected) {
                    emit('updateLocation', {
                        userId: userId,
                        latitude,
                        longitude,
                    });
                }
            },
            (error) => {
                console.error('Error fetching location:', error);
            },
            {
                enableHighAccuracy: true,
                distanceFilter: 10, // Trigger update only when moving 10m
            }
        );

        // Clean up on unmount
        return () => {
            Geolocation.clearWatch(watchId);
        };
    }, [userId, isConnected, emit]);

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Location Settings</Text>
            <View style={styles.statusContainer}>
                <Text style={styles.statusLabel}>Socket Status:</Text>
                <Text style={[styles.statusValue, { color: isConnected ? '#28a745' : '#dc3545' }]}>
                    {isConnected ? 'Connected' : 'Disconnected'}
                </Text>
            </View>
            <View style={styles.locationContainer}>
                <Text style={styles.locationLabel}>Current Location:</Text>
                {location ? (
                    <View style={styles.locationInfo}>
                        <Text style={styles.locationText}>
                            Latitude: {location.latitude.toFixed(6)}
                        </Text>
                        <Text style={styles.locationText}>
                            Longitude: {location.longitude.toFixed(6)}
                        </Text>
                    </View>
                ) : (
                    <Text style={styles.loadingText}>Fetching location...</Text>
                )}
            </View>
            {!userId && (
                <View style={styles.warningContainer}>
                    <Text style={styles.warningText}>⚠️ User not logged in</Text>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#f5f5f5',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        color: '#333',
    },
    statusContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#fff',
        padding: 15,
        borderRadius: 10,
        marginBottom: 15,
        elevation: 2,
    },
    statusLabel: {
        fontSize: 16,
        color: '#666',
    },
    statusValue: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    locationContainer: {
        backgroundColor: '#fff',
        padding: 15,
        borderRadius: 10,
        elevation: 2,
    },
    locationLabel: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 10,
        color: '#333',
    },
    locationInfo: {
        marginTop: 10,
    },
    locationText: {
        fontSize: 14,
        color: '#666',
        marginBottom: 5,
    },
    loadingText: {
        fontSize: 14,
        color: '#999',
        fontStyle: 'italic',
    },
    warningContainer: {
        backgroundColor: '#fff3cd',
        padding: 15,
        borderRadius: 10,
        marginTop: 15,
        borderWidth: 1,
        borderColor: '#ffc107',
    },
    warningText: {
        color: '#856404',
        fontSize: 14,
    },
});