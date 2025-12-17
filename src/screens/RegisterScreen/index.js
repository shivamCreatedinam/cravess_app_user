import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    TextInput,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Alert,
    ActivityIndicator,
    Platform,
} from 'react-native';
import Geolocation from '@react-native-community/geolocation';
import Geocoder from 'react-native-geocoding';
import axios from 'axios';
import * as ImagePicker from 'react-native-image-picker';
import { request, PERMISSIONS } from 'react-native-permissions';

// Initialize Geocoder with your Google API key
Geocoder.init('AIzaSyD9zoEIQ7IjlkSKF4XZ_RY2HXKeHgpDL0o');

const RegistrationScreen = () => {

    const [location, setLocation] = useState(null);
    const [formData, setFormData] = useState({
        mobile: '',
        email: '',
        name: '',
        vehicle_no: '',
        address: '',
        latitude: '',
        longitude: '',
        password: '',
    });

    const [files, setFiles] = useState({
        aadhar_front: null,
        aadhar_back: null,
        drv_licence: null,
        insurence_file: null,
    });

    const [loadingLocation, setLoadingLocation] = useState(false);

    const handleInputChange = (key, value) => {
        setFormData((prev) => ({ ...prev, [key]: value }));
    };

    const pickFile = async (fileType) => {
        const result = await ImagePicker.launchImageLibrary({
            mediaType: 'photo',
        });
        if (result.didCancel) {
            Alert.alert('Cancelled', 'File selection was cancelled.');
        } else if (result.assets && result.assets[0]) {
            setFiles((prev) => ({ ...prev, [fileType]: result.assets[0] }));
        }
    };

    const fetchCurrentLocation = () => {
        setLoadingLocation(true);
        Geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;
                setFormData((prev) => ({
                    ...prev,
                    latitude: latitude.toString(),
                    longitude: longitude.toString(),
                }));

                try {
                    const geoResponse = await Geocoder.from(latitude, longitude);
                    const address = geoResponse.results[0]?.formatted_address;
                    setFormData((prev) => ({ ...prev, address }));
                } catch (error) {
                    console.error('Error fetching address:', error);
                    Alert.alert('Error', 'Failed to fetch address.');
                }

                setLoadingLocation(false);
            },
            (error) => {
                console.error('Location Error:', error);
                Alert.alert('Error', 'Failed to fetch location. Please enable location services.');
                setLoadingLocation(false);
            },
            { enableHighAccuracy: false, timeout: 15000, maximumAge: 10000 }
        );
    };

    const requestLocationPermission = async () => {
        const result = await request(
            Platform.OS === 'ios'
                ? PERMISSIONS.IOS.LOCATION_WHEN_IN_USE
                : PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION
        );
        console.log(result); // Check permission result
    };

    useEffect(() => {
        requestLocationPermission();
        fetchCurrentLocation(); // Automatically fetch location on component mount
    }, []);

    const handleSubmit = async () => {
        const {
            mobile,
            email,
            name,
            vehicle_no,
            address,
            latitude,
            longitude,
            password,
        } = formData;

        // Validate input
        if (
            !mobile ||
            !email ||
            !name ||
            !vehicle_no ||
            !address ||
            !latitude ||
            !longitude ||
            !password
        ) {
            Alert.alert('Error', 'All fields are required!');
            return;
        }
        if (Object.values(files).some((file) => file === null)) {
            Alert.alert('Error', 'All documents must be uploaded!');
            return;
        }

        const form = new FormData();
        Object.keys(formData).forEach((key) => {
            form.append(key, formData[key]);
        });
        Object.keys(files).forEach((key) => {
            form.append(key, {
                uri: files[key].uri,
                name: files[key].fileName,
                type: files[key].type,
            });
        });

        try {
            const response = await axios.post(
                'https://theparihara.com/Parihara/public/api/driver-signup',
                form,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                }
            );
            console.log(`handleSubmit: ${response?.data}`);
            Alert.alert('Success', 'Driver registered successfully!');
        } catch (error) {
            console.error(error);
            Alert.alert('Error', 'Registration failed. Please try again.');
        }
    };

    return (
        <ScrollView style={styles.container}>
            <Text style={styles.heading}>Driver Registration</Text>

            {/* Input Fields */}
            {[
                { placeholder: 'Mobile', key: 'mobile', keyboardType: 'phone-pad' },
                { placeholder: 'Email', key: 'email', keyboardType: 'email-address' },
                { placeholder: 'Name', key: 'name' },
                { placeholder: 'Vehicle Number', key: 'vehicle_no' },
                { placeholder: 'Password', key: 'password', secureTextEntry: true },
            ].map((field) => (
                <TextInput
                    key={field.key}
                    style={styles.input}
                    placeholder={field.placeholder}
                    value={formData[field.key]}
                    onChangeText={(value) => handleInputChange(field.key, value)}
                    keyboardType={field.keyboardType || 'default'}
                    secureTextEntry={field.secureTextEntry || false}
                />
            ))}

            {/* Address Field */}
            {loadingLocation ? (
                <ActivityIndicator size="large" color="#007bff" />
            ) : (
                <TextInput
                    style={styles.input}
                    placeholder="Address"
                    value={formData.address}
                    onChangeText={(value) => handleInputChange('address', value)}
                />
            )}

            {/* File Uploads */}
            {[
                { label: 'Aadhar Front', key: 'aadhar_front' },
                { label: 'Aadhar Back', key: 'aadhar_back' },
                { label: 'Driving Licence', key: 'drv_licence' },
                { label: 'Insurance File', key: 'insurence_file' },
            ].map((file) => (
                <TouchableOpacity
                    key={file.key}
                    style={styles.fileButton}
                    onPress={() => pickFile(file.key)}
                >
                    <Text style={styles.fileButtonText}>
                        {files[file.key]?.fileName || `Upload ${file.label}`}
                    </Text>
                </TouchableOpacity>
            ))}

            {/* Submit Button */}
            <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
                <Text style={styles.submitButtonText}>Register</Text>
            </TouchableOpacity>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        backgroundColor: '#f5f5f5',
    },
    heading: {
        fontSize: 24,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 16,
    },
    input: {
        backgroundColor: '#fff',
        padding: 12,
        borderRadius: 8,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#ddd',
    },
    fileButton: {
        backgroundColor: '#007bff',
        padding: 12,
        borderRadius: 8,
        marginBottom: 12,
    },
    fileButtonText: {
        color: '#fff',
        fontSize: 14,
        textAlign: 'center',
    },
    submitButton: {
        backgroundColor: '#28a745',
        padding: 16,
        borderRadius: 8,
        marginTop: 16,
    },
    submitButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
        textAlign: 'center',
    },
});

export default RegistrationScreen;
