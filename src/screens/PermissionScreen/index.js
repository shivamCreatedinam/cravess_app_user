import { Text, View, TouchableOpacity, Image, PermissionsAndroid, BackHandler, StatusBar, ImageBackground } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';
// import notifee from '@notifee/react-native'; // Commented out - notifee removed
import React, { Component } from 'react';

export default class PermissionScreenMain extends Component {

    constructor(props) {
        super(props);
        this.state = {
            cameraPermission: false,
            locationPermission: false,
            locationBackgroundPermission: false,
            filePermission: false,
            notificationPermission: false
        }
    }

    async componentDidMount() {
        BackHandler.addEventListener('hardwareBackPress', this.onBackClick);
        this.props.navigation.addListener('focus', () => {
            this.componentDidFocus()
        });
    }

    onBackClick() {
        console.log("You can use the camera");
    }

    componentDidFocus = async () => {
        try {
            const value = await AsyncStorage.getItem('@permissioncheck');
            console.log('componentDidFocusXX', JSON.stringify(value));
            if (value !== 'null' && value !== null) {
                this.props.navigation.navigate('SplashAppScreen');
            } else {
                this.props.navigation.navigate('PermissionScreenMain');
            }
        } catch (error) {
            console.log('componentDidFocusXx', JSON.stringify(error))
        }
    };


    requestLocationBackgroundPermission = async () => {
        try {
            const granted = await PermissionsAndroid.request(
                PermissionsAndroid.PERMISSIONS.ACCESS_BACKGROUND_LOCATION,
                {
                    title: 'Parihara App',
                    message: 'Parihara App needs to access your Location',
                    buttonNegative: 'Cancel',
                    buttonPositive: 'Okay',
                },
            );

            if (granted === PermissionsAndroid.RESULTS.GRANTED) {
                console.log('Location permission GRANTED');
                this.setState({ locationBackgroundPermission: true });
            } else {
                console.log('Location permission denied');
                this.setState({ locationBackgroundPermission: true });
            }
        } catch (error) {
            console.error('Error in location permission:', error);
        }
    };

    requestLocationPermission = async () => {
        try {
            const granted = await PermissionsAndroid.request(
                PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
                {
                    title: 'Parihara App',
                    message: 'Parihara App needs to access your Location',
                    buttonNegative: 'Cancel',
                    buttonPositive: 'Okay',
                },
            );

            if (granted === PermissionsAndroid.RESULTS.GRANTED) {
                console.log('Location permission GRANTED');
                this.setState({ locationPermission: true });
            } else {
                console.log('Location permission denied');
                this.setState({ locationPermission: false });
            }
        } catch (error) {
            console.error('Error in location permission:', error);
        }
    };

    async CameraPermission(params) {
        try {
            const granted = await PermissionsAndroid.request(
                PermissionsAndroid.PERMISSIONS.CAMERA,
                {
                    'title': 'Cool Photo App Camera Permission',
                    'message': 'Cool Photo App needs access to your camera ' +
                        'so you can take awesome pictures.'
                }
            )
            if (granted === PermissionsAndroid.RESULTS.GRANTED) {
                console.log("You can use the camera")
                this.setState({ cameraPermission: true });
            } else {
                console.log("Camera permission denied")
                this.setState({ cameraPermission: true });
            }
        } catch (err) {
            console.warn(err)
        }
    }

    async FilePermission(params) {
        try {
            const granted = await PermissionsAndroid.request(
                PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
                {
                    'title': 'Cool Photo App Camera Permission',
                    'message': 'Cool Photo App needs access to your camera ' +
                        'so you can take awesome pictures.'
                }
            )
            if (granted === PermissionsAndroid.RESULTS.GRANTED) {
                console.log("You can use the file")
                this.setState({ filePermission: true });
            } else {
                console.log("file permission denied")
                this.setState({ filePermission: false });
            }
        } catch (err) {
            console.warn(err)
        }
    }

    async PushNotification() {
        try {
            // await notifee.requestPermission(); // Commented out - notifee removed
            // Using Firebase Messaging for notifications instead
            console.log('Notification permissions - using Firebase Messaging');
            this.setState({ notificationPermission: true });
        } catch (error) {
            console.log('POST_NOTIFICATIONS permission denied', error);
            this.setState({ notificationPermission: false });
        }
    }

    async checkAllPermission() {
        // Notification permission check removed since notifee is removed
        // Using Firebase Messaging for notifications instead
        if (this.state.cameraPermission === true && this.state.locationBackgroundPermission === true && this.state.locationPermission === true) {
            AsyncStorage.setItem('@permissioncheck', 'true');
            this.props.navigation.replace('SplashScreen');
            console.warn('saved')
        } else {
            Toast.show({
                type: 'error',
                text1: 'Required Permissions!',
                text2: 'Please Accept All The Permission!',
            });
        }
    }

    render() {
        return (
            <ImageBackground source={require('../../assets/background_app.png')} style={{ padding: 30, flex: 1, }}>
                <StatusBar barStyle="light-content" backgroundColor="rgb(0, 0, 0)" />
                <View style={{ marginBottom: 0 }}>
                    <Image style={{ height: 250, width: 250, resizeMode: 'contain', alignSelf: 'center' }} source={require('../../assets/cravess_app_logo.png')} />
                </View>
                <Text style={{ color: '#050505', marginTop: 20, fontSize: 25 }}>App Permission</Text>
                <View style={{ flex: 1 }}>
                    <View style={{ marginBottom: 30 }}>
                        <Text style={{ color: '#050505', marginTop: 10, fontSize: 14 }}>Cravess provide you with the best Order booking experience, we need your location permission for <Text style={{ fontWeight: '600' }}>foreground and background</Text>. Granting location permission allows us to show you nearby restaurent and delivery partners, estimate accurate arrival times, and ensure smooth navigation during food delivery. Your safety is our top priority, and knowing your location helps us connect you with the delivery partners who are closest to you.</Text>
                    </View>
                    <TouchableOpacity onPress={() => this.requestLocationPermission()} style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 15 }}>
                        <Text style={{ fontSize: 14, color: '#050505', flex: 1 }}>Location Permission</Text>
                        <Image style={{ height: 20, width: 20, resizeMode: 'contain', alignSelf: 'center', tintColor: this.state.locationPermission === true ? null : 'red' }} source={require('../../assets/circle_green.png')} />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => this.requestLocationBackgroundPermission()} style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 15 }}>
                        <Text style={{ fontSize: 14, color: '#050505', flex: 1 }}>Location Background Permission</Text>
                        <Image style={{ height: 20, width: 20, resizeMode: 'contain', alignSelf: 'center', tintColor: this.state.locationBackgroundPermission === true ? null : 'red' }} source={require('../../assets/circle_green.png')} />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => this.CameraPermission()} style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 15 }}>
                        <Text style={{ fontSize: 14, color: '#050505', flex: 1 }}>Camera Permission {this.state.cameraPermission}</Text>
                        <Image style={{ height: 20, width: 20, resizeMode: 'contain', alignSelf: 'center', tintColor: this.state.cameraPermission === true ? null : 'red' }} source={require('../../assets/circle_green.png')} />
                    </TouchableOpacity>
                    {/* <TouchableOpacity onPress={() => this.FilePermission()} style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 15 }}>
                        <Text style={{ fontSize: 14, color: '#050505', flex: 1 }}>File Permission</Text>
                        <Image style={{ height: 20, width: 20, resizeMode: 'contain', alignSelf: 'center', tintColor: this.state.filePermission === true ? null : 'red' }} source={require('../../assets/circle_green.png')} />
                    </TouchableOpacity> */}
                    <TouchableOpacity onPress={() => this.PushNotification()} style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 15 }}>
                        <Text style={{ fontSize: 14, color: '#050505', flex: 1 }}>Notification Permission</Text>
                        <Image style={{ height: 20, width: 20, resizeMode: 'contain', alignSelf: 'center', tintColor: this.state.notificationPermission === true ? null : 'red' }} source={require('../../assets/circle_green.png')} />
                    </TouchableOpacity>
                </View>
                <View>
                    <TouchableOpacity onPress={() => this.checkAllPermission()} style={{ paddingHorizontal: 20, paddingVertical: 15, elevation: 5, borderRadius: 10, backgroundColor: '#fff' }}>
                        <Text style={{ color: '#000', textAlign: 'center', fontWeight: 'bold', textTransform: 'uppercase' }}>Continue </Text>
                    </TouchableOpacity>
                </View>
            </ImageBackground>
        )
    }
}