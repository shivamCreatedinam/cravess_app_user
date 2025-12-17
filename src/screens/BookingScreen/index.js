import React, { useEffect, useState, useRef, useContext } from 'react';
import { View, Text, StyleSheet, Dimensions, Image, TouchableOpacity, PermissionsAndroid, Pressable, Alert, TextInput } from 'react-native';

// Check if react-native-maps is available
let MapView, Marker, AnimatedRegion, PROVIDER_GOOGLE, Polyline, MapViewDirections;
try {
    const maps = require('react-native-maps');
    MapView = maps.default;
    Marker = maps.Marker;
    AnimatedRegion = maps.AnimatedRegion;
    PROVIDER_GOOGLE = maps.PROVIDER_GOOGLE;
    Polyline = maps.Polyline;
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
    AnimatedRegion = class {};
    PROVIDER_GOOGLE = 'google';
    Polyline = () => null;
    MapViewDirections = () => null;
}

import { useRoute, useNavigation } from '@react-navigation/native';
import { LoadingContext } from '../../components/Loader/LoadingContext';
import { StartTripBooking, SubmitDriverTripOtp } from '../../network/api';

const { width, height } = Dimensions.get('window');

const BookingAcceptScreen = () => {

  const route = useRoute();
  const navigation = useNavigation();
  // Regular expression to match exactly 4 digits
  const otpPattern = /^[0-9]{4}$/;
  const { loading, showLoader, hideLoader } = useContext(LoadingContext);
  const [currentLocation, setCurrentLocation] = useState(null); // For user's current location
  const [bookingDetails, setBookingDetails] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [price, setPrice] = useState(0);
  const [EnterOTP, setEnterOTP] = useState('');
  const [routeCoordinates, setRouteCoordinates] = useState([]);
  const [cabPosition, setCabPosition] = useState(
    new AnimatedRegion({
      latitude: 41.645,
      longitude: 41.630,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    })
  );

  const [fullRoute, setFullRoute] = useState([]); // Full polyline
  const [animatedRoute, setAnimatedRoute] = useState([]); // Animated part

  const mapRef = useRef(null);

  // Request location permissions
  // const requestLocationPermission = async () => {
  //   if (Platform.OS === 'android') {
  //     const granted = await PermissionsAndroid.request(
  //       PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
  //     );
  //     return granted === PermissionsAndroid.RESULTS.GRANTED;
  //   } else {
  //     return true;
  //   }
  // };

  useEffect(() => {
    // get all data 
    console.log('BookingAcceptScreen______', JSON.stringify(route.params));
    // Simulated booking details
    const fetchedBooking = {
      id: route.params?.booking_id,
      pickup_latitude: route.params?.pickup_latitude,
      pickup_longitude: route.params?.pickup_longitude,
      pickup_location_name: route.params?.pickup_location_name,
      drop_latitude: route.params?.drop_latitude,
      drop_longitude: route.params?.drop_longitude,
      drop_location_name: route.params?.drop_location_name,
      distance: route.params?.distance, // in km
      price: route.params?.price, // in km
      driver: {
        name: route.params?.booking_user,
        rating: route.params?.trip_type,
        profileImage: 'https://cdn-icons-png.flaticon.com/512/149/149071.png', // Replace with the profile picture URL
      },
    };

    setBookingDetails(fetchedBooking);
    setPrice(Number(route.params?.price).toFixed(2)); // Simulated pricing
  }, []);

  // Get Current Location
  const getCurrentLocation = () => {
    // Geolocation.getCurrentPosition(
    //   (position) => {
    //     const { latitude, longitude } = position.coords;
    //     console.log('Current Location:', latitude, longitude);
    //     setCurrentLocation({ latitude, longitude });
    //   },
    //   (error) => {
    //     console.error('Geolocation error:', error);
    //   },
    //   {
    //     enableHighAccuracy: true,
    //     timeout: 15000,
    //     maximumAge: 10000,
    //   }
    // );
  };

  // OTP validation function
  const validateOTP = (otpInput) => {
    // Regular expression to match exactly 4 digits
    const otpPattern = /^[0-9]{4}$/;
    if (!otpPattern.test(otpInput)) {
      setErrorMessage('OTP must be 4 digits!');
      return false;
    }
    setErrorMessage('');
    return true;
  };


  // useEffect(() => {
  //   const checkPermissionsAndFetchLocation = async () => {
  //     const hasPermission = await requestLocationPermission();
  //     if (hasPermission) {
  //       // getCurrentLocation();
  //     }
  //   };
  //   checkPermissionsAndFetchLocation();
  // }, []);

  // const moveCab = (coordinates) => {
  //   let index = 0;
  //   const interval = setInterval(() => {
  //     if (index < coordinates.length) {
  //       const nextCoord = coordinates[index];
  //       cabPosition.timing({
  //         latitude: nextCoord.latitude,
  //         longitude: nextCoord.longitude,
  //         header: nextCoord.header,
  //         duration: 1000, // Adjust the duration for smooth movement
  //         useNativeDriver: false,
  //       }).start();
  //       index++;
  //     } else {
  //       clearInterval(interval); // Stop animation once the cab reaches the pickup point
  //     }
  //   }, 1000); // Adjust the interval time for the cab's speed
  // };

  // useEffect(() => {
  //   if (routeCoordinates.length > 0) {
  //     moveCab(routeCoordinates);
  //   }
  // }, [routeCoordinates]);

  if (!bookingDetails) {
    return (
      <View style={styles.loaderContainer}>
        <Text style={styles.loaderText}>Loading Booking Details...</Text>
      </View>
    );
  }

  // useEffect(() => {
  //   if (fullRoute.length > 0) {
  //     animatePolyline();
  //   }
  // }, [fullRoute]);

  const checkAndGoBack = (val) => {
    return Alert.alert(
      "Cancel Trip",
      "Once You Click BACK, Your trip is canclled!",
      [
        {
          text: "BACK", onPress: () => navigation.replace('BottomTabs')
        },
        { text: "Cancel" }
      ]
    );
  };

  const handleStartTrip = () => {
    // navigation.navigate('TripStartScreen', { bookingDetails, price });
    if (validateOTP(EnterOTP)) {
      // Proceed with OTP submission (e.g., call API)
      showLoader(); // Show loader
      console.log('OTP is valid:', EnterOTP);
      StartTripBooking(route.params?.booking_id, EnterOTP).then((res) => {
        console.log('Booking Accepted :', res); // Should be true or false
        SubmitDriverTripOtp(route.params?.booking_id).then((res) => {
          hideLoader(); // Hide loader
          console.log('Booking Accepted :', res); // Should be true or false
        }).catch(error => {
          hideLoader(); // Hide loader
          console.error('Booking acceptance failed:', error);
        });
      }).catch(error => {
        hideLoader(); // Hide loader
        console.error('Booking acceptance failed:', error);
      });
      // Continue with the next steps after validation...
    }
  }

  // const animatePolyline = async () => {
  //   for (let i = 0; i < fullRoute.length; i++) {
  //     setAnimatedRoute(fullRoute.slice(0, i + 1)); // Gradually reveal polyline
  //     await new Promise((resolve) => setTimeout(resolve, 50)); // Adjust speed
  //   }
  // };

  return (
    <View style={styles.container}>
      <Pressable style={{
        position: 'absolute', top: 20, left: 10, zIndex: 999
      }} onPress={() => checkAndGoBack()}>
        <Image style={{ width: 40, height: 40, resizeMode: 'contain' }} source={require('../../assets/back.png')} />
      </Pressable>
      {/* <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={{
          latitude: bookingDetails.pickup_latitude,
          longitude: bookingDetails.pickup_longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }}
        showsMyLocationButton={true}
        showsUserLocation={true}
      >
        <Marker
          coordinate={{
            latitude: bookingDetails.pickup_latitude,
            longitude: bookingDetails.pickup_longitude,
          }}
          pinColor="green"
        />
        <Marker
          coordinate={{
            latitude: bookingDetails.drop_latitude,
            longitude: bookingDetails.drop_longitude,
          }}
          pinColor="red"
        />
        <Marker.Animated coordinate={cabPosition}>
          <Image
            source={require('../../assets/car_icon.png')}
            style={{ width: 40, height: 40 }}
            resizeMode="contain"
          />
        </Marker.Animated>
        <MapViewDirections
          origin={{
            latitude: bookingDetails.pickup_latitude,
            longitude: bookingDetails.pickup_latitude,
          }}
          destination={{
            latitude: bookingDetails.drop_latitude,
            longitude: bookingDetails.drop_longitude,
          }}
          apikey={GOOGLE_MAPS_APIKEY}
          strokeWidth={3}
          strokeColor="transparent" // Hide default polyline
          onReady={(result) => {
            setRouteCoordinates(result.coordinates);
            mapRef.current.fitToCoordinates(result.coordinates, {
              edgePadding: {
                top: 50,
                bottom: 50,
                left: 50,
                right: 50,
              },
              animated: true,
            });
          }}
          onError={(errorMessage) => {
            console.error('MapViewDirections error:', errorMessage);
          }}
        />
        <Polyline
          coordinates={animatedRoute}
          strokeWidth={5}
          strokeColor="blue"
        />
      </MapView> */}
      <View style={styles.card}>
        <Text style={styles.orderText}>#PAR{route.params.id}{route.params.booking_id}</Text>
        <Text style={styles.priceText}>₹{price}</Text>
        <View style={styles.addressContainer}>
          <Text style={styles.label}>Pickup</Text>
          <Text style={styles.value}>{bookingDetails.pickup_location_name}</Text>
          <Text style={styles.label}>Drop</Text>
          <Text style={styles.value}>{bookingDetails.drop_location_name}</Text>
        </View>
        <View style={styles.driverInfo}>
          <Image
            source={{ uri: bookingDetails.driver.profileImage }}
            style={styles.driverAvatar}
          />
          <View style={styles.driverDetails}>
            <Text style={styles.driverName}>{bookingDetails.driver.name}</Text>
            <Text style={styles.driverRating}>🛺 {bookingDetails.driver.rating}</Text>
          </View>
        </View>
        <Text style={{ fontSize: 10, color: 'red', marginBottom: 10, textAlign: 'center', fontWeight: '600', textTransform: 'capitalize' }}>{errorMessage}</Text>
        <View style={styles.actions}>
          <TouchableOpacity style={styles.actionButton}>
            <TextInput
              adjustsFontSizeToFit={true}
              numberOfLines={1}
              maxLength={4}
              style={styles.actionInputText}
              placeholder="xxxx"
              placeholderTextColor={'#000'}
              keyboardType='number-pad'
              onChangeText={(text) => setEnterOTP(text)} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => handleStartTrip()} style={styles.actionStartButton}>
            <Text style={styles.actionStartText}>Start</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  map: {
    width: width,
    height: height * 0.55,
  },
  card: {
    flex: 1,
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    marginTop: -50,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 5,
  },
  orderText: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 5,
    color: '#b6b6b6',
  },
  priceText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#28a745',
    marginBottom: 20,
  },
  addressContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6c757d',
    marginBottom: 5,
  },
  value: {
    fontSize: 16,
    color: '#000',
    marginBottom: 10,
  },
  driverInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  driverAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 15,
  },
  driverDetails: {
    flex: 1,
  },
  driverName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  driverRating: {
    fontSize: 14,
    color: '#6c757d',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    alignSelf: 'center',
    backgroundColor: '#f8f9fa',
    paddingVertical: 3,
    paddingHorizontal: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e9ecef',
    flex: 1,
    alignItems: 'center',
    alignContent: 'center'
  }, actionStartButton: {
    backgroundColor: 'green',
    paddingVertical: 12,
    paddingHorizontal: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e9ecef',
    flex: 1,
    marginLeft: 10,
    alignItems: 'center',
    elevation: 5
  },
  actionStartText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    textTransform: 'uppercase',
  }, actionInputText: {
    paddingVertical: 5,
    paddingHorizontal: 10,
    textAlign: 'center',
    width: '100%',
    fontSize: 16,
    letterSpacing: 12,
    fontWeight: '600',
    color: '#000000',
    textTransform: 'uppercase',
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loaderText: {
    fontSize: 16,
    color: '#6c757d',
  },
});

export default BookingAcceptScreen;
