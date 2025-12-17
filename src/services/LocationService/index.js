import React, { useEffect } from 'react';
import { AppState, Alert } from 'react-native';
import Geolocation from '@react-native-community/geolocation';
// import BackgroundFetch from 'react-native-background-fetch';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSelector } from 'react-redux';
import socketService from '../SocketService/SocketService';

const LocationService = () => {
    const updateInterval = 10000; // Update every 10 seconds
    let watchId = null;
    const user = useSelector((state) => state?.userInfo?.user);
    const userId = user?.id;

    // Function to send location to the server
    const sendLocationToServer = async (latitude, longitude, locationName = '', headerDirection) => {
        try {
            const DriverData = await AsyncStorage.getItem('userSession');
            const driverDataParsed = DriverData ? JSON.parse(DriverData) : null;
            const driverId = driverDataParsed?.id || userId;
            
            if (!driverId) {
                return;
            }

            // Update via API
            const response = await fetch('https://nodeadmin.createdinam.com/update-location', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    user_id: driverId,
                    latitude,
                    longitude,
                    header: headerDirection,
                    location_name: locationName,
                }),
            });
            
            if (!response.ok) {
                const errorText = await response.text();
                console.error('Failed to update location:', response.status, errorText);
            } else {
                const result = await response.json();
                console.log('Location updated successfully!', result);
            }

            // Also emit via socket for real-time tracking
            if (socketService.isSocketConnected()) {
                socketService.emit('driverLocationUpdate', {
                    driverId: driverId,
                    latitude: latitude,
                    longitude: longitude,
                    heading: headerDirection,
                    timestamp: Date.now(),
                });
                console.log('📍 Location sent via socket:', { driverId, latitude, longitude });
            }
        } catch (error) {
            console.error('Error sending location to server:', error);
        }
    };

    // Start watching location in the foreground
    const startForegroundTracking = () => {
        watchId = Geolocation.watchPosition(
            (position) => {
                const { latitude, longitude, heading } = position.coords;
                sendLocationToServer(latitude, longitude, 'Current Location', heading);
            },
            (error) => console.error('Error watching location:', error),
            { enableHighAccuracy: true, distanceFilter: 10 }
        );
    };

    // Start background tracking
    const startBackgroundTracking = async () => {
        try {
            // const status = await BackgroundFetch.configure(
            //     {
            //         minimumFetchInterval: 15, // 15 minutes
            //         stopOnTerminate: false,
            //         startOnBoot: true,
            //         enableHeadless: true,
            //     },
            //     async (taskId) => {
            //         Geolocation.getCurrentPosition(
            //             (position) => {
            //                 const { latitude, longitude, heading } = position.coords;
            //                 sendLocationToServer(latitude, longitude, 'Background Location', heading);
            //             },
            //             (error) => console.error('Error fetching background location:', error),
            //             { enableHighAccuracy: true }
            //         );

            //         BackgroundFetch.finish(taskId);
            //     },
            //     (error) => {
            //         console.error('Background Fetch failed:', error);
            //     }
            // );
        } catch (error) {
            console.error('Failed to configure background fetch:', error);
        }
    };

    useEffect(() => {
        // Start tracking on component mount
        startForegroundTracking();
        // startBackgroundTracking();

        // Cleanup on unmount
        return () => {
            if (watchId !== null) {
                Geolocation.clearWatch(watchId);
            }
            // BackgroundFetch.stop();
        };
    }, []);

    return null;
};

export default LocationService;
