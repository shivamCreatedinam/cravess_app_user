import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, ActivityIndicator, StyleSheet, Alert } from 'react-native';
import Geolocation from '@react-native-community/geolocation';
import AsyncStorage from '@react-native-async-storage/async-storage';

const UpdateProfileScreen = () => {
  const [userData, setUserData] = useState({
    id: '',
    name: '',
    email: '',
    mobile: '',
    vehicle_no: '',
    address: '',
    latitude: '',
    longitude: '',
  });
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);

  // Fetch user profile data
  const fetchUserProfile = async () => {
    try {
      const DriverData = await AsyncStorage.getItem('userSession');
      const URLs = `https://theparihara.com/Parihara/public/api/driver-profile?driver_id=${JSON.parse(DriverData)?.id}`;
      console.log(URLs);
      const response = await fetch(URLs); // Replace with actual API endpoint
      const data = await response.json();
      console.log(JSON.stringify(data?.driver));
      setUserData({
        id: data.id,
        name: data?.driver?.name,
        email: data?.driver?.email,
        mobile: data?.driver?.mobile,
        vehicle_no: data?.driver?.vehicle_no,
        address: data?.driver?.address,
        latitude: data?.driver?.latitude,
        longitude: data?.driver?.longitude,
      });
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch current location
  const fetchCurrentLocation = () => {
    setLocationLoading(true);
    Geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setUserData((prevData) => ({
          ...prevData,
          latitude: latitude.toString(),
          longitude: longitude.toString(),
        }));
        setLocationLoading(false);
      },
      (error) => {
        console.error('Error fetching location:', error);
        setLocationLoading(false);
      },
      { enableHighAccuracy: false, timeout: 15000, maximumAge: 10000 }
    );
  };

  // Update user profile
  const updateProfile = async () => {
    setUpdating(true);
    try {
      const formdata = new FormData();
      formdata.append('driver_id', userData.id);
      formdata.append('name', userData.name);
      // formdata.append('email', userData.email);
      // formdata.append('mobile', userData.mobile);
      formdata.append('vehicle_no', userData.vehicle_no);
      formdata.append('address', userData.address);
      formdata.append('latitude', userData.latitude);
      formdata.append('longitude', userData.longitude);

      const requestOptions = {
        method: 'POST',
        body: formdata,
      };
      console.log(JSON.stringify(requestOptions));
      const response = await fetch(
        'https://theparihara.com/Parihara/public/api/update-driver-profile',
        requestOptions
      );
      const result = await response.json();
      console.error('Error updating profile:', JSON.stringify(result));
      if (response.ok) {
        Alert.alert('Success', 'Profile updated successfully');
      } else {
        Alert.alert('Error', result.message || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert('Error', 'Failed to update profile');
    } finally {
      setUpdating(false);
    }
  };

  // Fetch profile data and location on component mount
  useEffect(() => {
    fetchUserProfile();
    fetchCurrentLocation();
  }, []);

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Update Profile</Text>

      <TextInput
        style={styles.input}
        placeholder="Name"
        value={userData.name}
        onChangeText={(text) => setUserData({ ...userData, name: text })}
      />

      <TextInput
        style={styles.input}
        placeholder="Email"
        value={userData.email}
        onChangeText={(text) => setUserData({ ...userData, email: text })}
        keyboardType="email-address"
      />

      <TextInput
        style={styles.input}
        placeholder="Mobile"
        value={userData.mobile}
        onChangeText={(text) => setUserData({ ...userData, mobile: text })}
        keyboardType="phone-pad"
      />

      <TextInput
        style={styles.input}
        placeholder="Vehicle Number"
        value={userData.vehicle_no}
        onChangeText={(text) => setUserData({ ...userData, vehicle_no: text })}
      />

      <TextInput
        style={styles.input}
        placeholder="Address"
        value={userData.address}
        onChangeText={(text) => setUserData({ ...userData, address: text })}
        multiline
      />

      <View style={styles.locationContainer}>
        <Text style={styles.locationText}>
          Latitude: {userData.latitude || 'Fetching...'}
        </Text>
        <Text style={styles.locationText}>
          Longitude: {userData.longitude || 'Fetching...'}
        </Text>
        {locationLoading && <ActivityIndicator size="small" color="#0000ff" />}
      </View>

      <Button
        title={updating ? 'Updating...' : 'Update Profile'}
        onPress={updateProfile}
        disabled={updating || locationLoading}
      />
    </View>
  );
};

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
    textAlign: 'center',
  },
  input: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 15,
    paddingHorizontal: 10,
    backgroundColor: '#fff',
  },
  locationContainer: {
    marginBottom: 15,
  },
  locationText: {
    fontSize: 16,
    marginBottom: 5,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default UpdateProfileScreen;