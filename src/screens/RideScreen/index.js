import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Dimensions,
    TouchableOpacity,
    Alert,
} from 'react-native';
// Check if react-native-maps is available
let MapView, Marker, MapViewDirections;
try {
    const maps = require('react-native-maps');
    MapView = maps.default;
    Marker = maps.Marker;
    MapViewDirections = require('react-native-maps-directions').default;
} catch (e) {
    // Fallback components if react-native-maps is not installed
    MapView = ({ children, style, ...props }) => (
        <View style={[style, { backgroundColor: '#e0e0e0', justifyContent: 'center', alignItems: 'center' }]} {...props}>
            <Text style={{ color: '#666' }}>Map not available</Text>
            {children}
        </View>
    );
    Marker = ({ children, ...props }) => <View>{children}</View>;
    MapViewDirections = () => null;
}
// import Geolocation from 'react-native-geolocation-service';
import Icon from 'react-native-vector-icons/Ionicons';

const { width, height } = Dimensions.get('window');

const RideScreen = ({ route, navigation }) => {
    const { bookingDetails } = route.params; // Booking details passed from previous screen
    const [currentLocation, setCurrentLocation] = useState({
        latitude: 28.7041,
        longitude: 77.1025,
    }); // Default location as numbers
    const [eta, setEta] = useState(null);
    const [rideStarted, setRideStarted] = useState(false);

    // useEffect(() => {
    //     // Fetch real-time location
    //     const fetchLocation = () => {
    //         Geolocation.watchPosition(
    //             (position) => {
    //                 console.log('Error fetching location:', JSON.stringify(position))
    //                 const { latitude, longitude } = position.coords;
    //                 setCurrentLocation({
    //                     latitude: Number(latitude), // Ensure latitude is a number
    //                     longitude: Number(longitude), // Ensure longitude is a number
    //                 });
    //             },
    //             (error) => console.error('Error fetching location:', error),
    //             { enableHighAccuracy: true, distanceFilter: 10 },
    //         );
    //     };

    //     // fetchLocation();

    //     return () => {
    //         Geolocation.stopObserving();
    //     };
    // }, []);

    const handleStartRide = () => {
        setRideStarted(true);
        Alert.alert('Ride Started', 'Tracking has begun.');
    };

    const handleEndRide = () => {
        setRideStarted(false);
        Alert.alert('Ride Completed', 'Thank you for completing the ride!');
        navigation.goBack();
    };

    if (!currentLocation) {
        return (
            <View style={styles.loaderContainer}>
                <Text style={styles.loaderText}>Fetching location...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* Map View */}
            <MapView
                style={styles.map}
                initialRegion={{
                    latitude: currentLocation.latitude,
                    longitude: currentLocation.longitude,
                    latitudeDelta: 0.05,
                    longitudeDelta: 0.05,
                }}
                showsUserLocation={true}
                followsUserLocation={true}
            >
                {/* Pickup Marker */}
                <Marker
                    coordinate={{
                        latitude: bookingDetails?.pickup_latitude,
                        longitude: bookingDetails?.pickup_longitude,
                    }}
                    title="Pickup Location"
                    description={bookingDetails?.pickup_location_name}
                    pinColor="green"
                />

                {/* Drop Marker */}
                <Marker
                    coordinate={{
                        latitude: bookingDetails?.drop_latitude,
                        longitude: bookingDetails?.drop_longitude,
                    }}
                    title="Drop Location"
                    description={bookingDetails?.drop_location_name}
                    pinColor="red"
                />

                {/* Route Directions */}
                <MapViewDirections
                    origin={currentLocation} // Current location (numbers)
                    destination={{
                        latitude: Number(bookingDetails?.drop_latitude), // Drop location latitude
                        longitude: Number(bookingDetails?.drop_longitude), // Drop location longitude
                    }}
                    apikey={GOOGLE_MAPS_API_KEY}
                    strokeWidth={4}
                    strokeColor="blue"
                    onReady={(result) => {
                        setEta(Math.ceil(result.duration)); // Set ETA in minutes
                    }}
                />
            </MapView>

            {/* Ride Details Section */}
            <View style={styles.detailsContainer}>
                <Text style={styles.detailText}>
                    Destination: {bookingDetails?.drop_location_name}
                </Text>
                <Text style={styles.detailText}>
                    Estimated Time: {eta ? `${eta} mins` : 'Calculating...'}
                </Text>

                <View style={styles.buttonContainer}>
                    {!rideStarted ? (
                        <TouchableOpacity style={styles.startButton} onPress={handleStartRide}>
                            <Icon name="play-circle" size={24} color="white" />
                            <Text style={styles.buttonText}>Start Ride</Text>
                        </TouchableOpacity>
                    ) : (
                        <TouchableOpacity style={styles.endButton} onPress={handleEndRide}>
                            <Icon name="stop-circle" size={24} color="white" />
                            <Text style={styles.buttonText}>End Ride</Text>
                        </TouchableOpacity>
                    )}
                </View>
            </View>
        </View>
    );
};

export default RideScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    map: {
        width: width,
        height: height * 0.7,
    },
    detailsContainer: {
        padding: 16,
        backgroundColor: '#fff',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        elevation: 5,
    },
    detailText: {
        fontSize: 16,
        marginVertical: 8,
        color: '#333',
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 20,
    },
    startButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'green',
        padding: 15,
        borderRadius: 10,
        justifyContent: 'center',
        width: '45%',
    },
    endButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'red',
        padding: 15,
        borderRadius: 10,
        justifyContent: 'center',
        width: '45%',
    },
    buttonText: {
        fontSize: 16,
        color: 'white',
        marginLeft: 10,
    },
    loaderContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loaderText: {
        fontSize: 16,
        color: '#555',
    },
});
