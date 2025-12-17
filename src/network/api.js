import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import Toast from 'react-native-toast-message';
import {store} from '../../store';
import {handleError} from '../utils/errorHandler';

export const API_BASE_URL = 'https://nodeadmin.createdinam.com';
export const API_DRIVER_BASE_URL = 'https://theparihara.com/Parihara/public/api';

// Helper function to get user data from Redux store or AsyncStorage (fallback)
const getUserData = async () => {
  try {
    // Try to get from Redux store first
    const userState = store.getState()?.userInfo?.user;
    if (userState) {
      return userState;
    }
    
    // Fallback to AsyncStorage
    const driverData = await AsyncStorage.getItem('userSession');
    if (driverData) {
      return JSON.parse(driverData);
    }
    return null;
  } catch (error) {
    console.error('Error getting user data:', error);
    return null;
  }
};

export const fetchUserProfile = async () => {
    try {
        const userData = await getUserData();
        if (!userData?.id) {
            throw new Error('User data not found');
        }

        const response = await axios.get(
            `${API_DRIVER_BASE_URL}/driver-profile?driver_id=${userData.id}`,
            {
                timeout: 10000,
                headers: {
                    'Content-Type': 'application/json',
                },
            }
        );

        if (response?.data?.driver) {
            console.log('User profile fetched:', JSON.stringify(response.data.driver));
            return response.data.driver;
        }
        throw new Error('No driver data in response');
    } catch (error) {
        console.error('Error fetching user profile:', error);
        handleError(error instanceof Error ? error : new Error(String(error)), 'fetchUserProfile');
        Toast.show({
            type: 'error',
            text1: 'Error',
            text2: error.response?.data?.message || error.message || 'Failed to fetch user profile',
        });
        throw error;
    }
};


export const AcceptBooking = async (request_trip_id, latitude = null, longitude = null) => {
    console.log('AcceptBooking started');

    try {
        const userData = await getUserData();
        if (!userData?.id) {
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: 'User data not found. Please login again.',
            });
            return false;
        }

        // Get location from Redux store or use provided coordinates
        const location = store.getState()?.location?.value;
        const driverLatitude = latitude || location?.latitude || '22.421991';
        const driverLongitude = longitude || location?.longitude || '21.4429928';

        const BookingURL = `${API_DRIVER_BASE_URL}/driver-nearest-user-accept-trip`;

        const formdata = new FormData();
        formdata.append('driver_id', userData.id);
        formdata.append('request_id', request_trip_id);
        formdata.append('driver_latitude', String(driverLatitude));
        formdata.append('driver_longitude', String(driverLongitude));

        const requestOptions = {
            method: 'POST',
            body: formdata,
            headers: {
                'Authorization': `Bearer ${userData.id}`,
            },
        };

        const response = await fetch(BookingURL, requestOptions);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        console.log('AcceptBooking result:', JSON.stringify(result));

        if (result.status || result.success || response.ok) {
            Toast.show({
                type: 'success',
                text1: 'Success',
                text2: result.message || 'Trip accepted successfully',
            });
            console.log('Trip accepted:', result.message);
            return true;
        } else {
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: result.message || 'Failed to accept trip',
            });
            console.log('API Error:', result.message);
            return false;
        }
    } catch (error) {
        console.error('Error in AcceptBooking:', error);
        handleError(error instanceof Error ? error : new Error(String(error)), 'AcceptBooking');
        Toast.show({
            type: 'error',
            text1: 'Error',
            text2: error.message || 'An unexpected error occurred. Please try again.',
        });
        return false;
    }
};


export const StartTripBooking = async (request_trip_id, trip_otp) => {
    console.log('Start Trip Booking!');

    try {
        const userData = await getUserData();
        if (!userData?.id) {
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: 'User data not found. Please login again.',
            });
            return false;
        }

        if (!trip_otp) {
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: 'OTP is required',
            });
            return false;
        }

        const BookingURL = `${API_DRIVER_BASE_URL}/driver-verify-trip-otp`;

        const formdata = new FormData();
        formdata.append('driver_id', userData.id);
        formdata.append('request_id', request_trip_id);
        formdata.append('otp', String(trip_otp));

        const requestOptions = {
            method: 'POST',
            body: formdata,
            headers: {
                'Authorization': `Bearer ${userData.id}`,
            },
        };

        const response = await fetch(BookingURL, requestOptions);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        console.log('StartTripBooking result:', JSON.stringify(result));

        if (result?.status === 'true' || result?.success === true || response.ok) {
            Toast.show({
                type: 'success',
                text1: 'Success',
                text2: result.message || 'Trip started successfully',
            });
            console.log('Trip started:', result.message);
            return true;
        } else {
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: result.message || 'Failed to start trip',
            });
            console.log('API Error:', result.message);
            return false;
        }
    } catch (error) {
        console.error('Error in StartTripBooking:', error);
        handleError(error instanceof Error ? error : new Error(String(error)), 'StartTripBooking');
        Toast.show({
            type: 'error',
            text1: 'Error',
            text2: error.message || 'An unexpected error occurred. Please try again.',
        });
        return false;
    }
};

export const AcceptDriverTrip = async (request_trip_id) => {
    console.log('AcceptDriverTrip');
    try {
        const userData = await getUserData();
        if (!userData?.id) {
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: 'User data not found. Please login again.',
            });
            return false;
        }

        if (!request_trip_id) {
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: 'Trip ID is required',
            });
            return false;
        }

        const BookingURL = `${API_BASE_URL}/update-trip-accept`;
        
        const requestBody = JSON.stringify({
            booking_id: request_trip_id,
        });

        const requestOptions = {
            method: 'POST',
            body: requestBody,
            headers: {
                'Authorization': `Bearer ${userData.id}`,
                'Content-Type': 'application/json',
            },
        };

        const response = await fetch(BookingURL, requestOptions);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        console.log('AcceptDriverTrip result:', JSON.stringify(result));
        
        if (result.success) {
            Toast.show({
                type: 'success',
                text1: 'Success',
                text2: result.message || 'Trip accepted successfully',
            });
            return true;
        } else {
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: result.message || 'Failed to accept trip',
            });
            console.log('AcceptDriverTrip error:', JSON.stringify(result));
            return false;
        }
    } catch (error) {
        console.error('Error in AcceptDriverTrip:', error);
        handleError(error instanceof Error ? error : new Error(String(error)), 'AcceptDriverTrip');
        Toast.show({
            type: 'error',
            text1: 'Error',
            text2: error.message || 'Something went wrong. Please try again.',
        });
        return false;
    }
};

export const SubmitDriverTripOtp = async (request_trip_id) => {
    console.log('SubmitDriverTripOtp');
    try {
        const userData = await getUserData();
        if (!userData?.id) {
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: 'User data not found. Please login again.',
            });
            return false;
        }

        if (!request_trip_id) {
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: 'Trip ID is required',
            });
            return false;
        }

        const BookingURL = `${API_BASE_URL}/update-otp-submit`;

        const requestBody = JSON.stringify({
            booking_id: request_trip_id,
        });

        const requestOptions = {
            method: 'POST',
            body: requestBody,
            headers: {
                'Authorization': `Bearer ${userData.id}`,
                'Content-Type': 'application/json',
            },
        };
        
        const response = await fetch(BookingURL, requestOptions);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        console.log('SubmitDriverTripOtp result:', JSON.stringify(result));
        
        if (result.success) {
            Toast.show({
                type: 'success',
                text1: 'Success',
                text2: result.message || 'OTP submitted successfully',
            });
            return true;
        } else {
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: result.message || 'Failed to submit OTP',
            });
            console.log('SubmitDriverTripOtp error:', JSON.stringify(result));
            return false;
        }
    } catch (error) {
        console.error('Error in SubmitDriverTripOtp:', error);
        handleError(error instanceof Error ? error : new Error(String(error)), 'SubmitDriverTripOtp');
        Toast.show({
            type: 'error',
            text1: 'Error',
            text2: error.message || 'Something went wrong. Please try again.',
        });
        return false;
    }
};


export const updateToken = async (id, token) => {
    try {
        const userData = await getUserData();
        const driverId = id || userData?.id;
        
        if (!driverId) {
            throw new Error('Driver ID not found');
        }

        if (!token) {
            throw new Error('FCM token is required');
        }

        const response = await axios.post(
            `${API_DRIVER_BASE_URL}/update-driver-fcm`,
            {
                driver_id: driverId,
                token: token,
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                },
                timeout: 10000,
            }
        );

        if (response?.data) {
            console.log('Token updated successfully:', JSON.stringify(response.data));
            return response.data;
        }
        throw new Error('No data in response');
    } catch (error) {
        console.error('Error updating token:', error.response?.data || error.message);
        handleError(error instanceof Error ? error : new Error(String(error)), 'updateToken');
        Toast.show({
            type: 'error',
            text1: 'Error',
            text2: error.response?.data?.message || error.message || 'Failed to update token',
        });
        throw error;
    }
};

