import React, { useEffect, useCallback } from 'react';
import { View, StyleSheet, StatusBar, Dimensions, ImageBackground, Image, Text } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useDispatch, useSelector } from 'react-redux';
import fetchLocation from '../../services/LocationProvider/LocationProvider';
import { getCurrentAddress } from '../../apis/apis';
import * as Animatable from 'react-native-animatable';
import { setAddress } from '../../features/addressSlice';
import { setUser } from '../../features/userInfoSlice';

const { width, height } = Dimensions.get('window');

const SplashScreen = () => {

    const dispatch = useDispatch();
    const navigation = useNavigation();
    const user = useSelector((state) => state?.userInfo?.user);
    const [loading, setLoading] = React.useState(true);
    const [FullAddress, setFullAddress] = React.useState(null);

    useEffect(() => {
        let isMounted = true;
        const initialize = async () => {
            try {
                const locationData = await fetchLocation();
                const location = await getCurrentAddress(locationData.latitude, locationData.longitude);

                const addressObj = {
                    formatted_address: location.fullAddress,
                    postalCode: location.postalCode,
                    city: location.city,
                    state: location.state,
                };

                if (isMounted) {
                    setFullAddress(addressObj);
                    dispatch(setAddress(location?.fullAddress));
                    setLoading(false);
                }
            } catch (err) {
                console.error('❌ Location fetch error:', err);
                setLoading(false);
            }

            // Wait splash delay (can be removed if location is fast)
            await new Promise(resolve => setTimeout(resolve, 2500));

            if (isMounted) {
                if (user && user.id) {
                    navigation.replace('HomeScreen');
                } else {
                    navigation.replace('RegisterMobileScreen');
                }
            }
        };
        initialize();
        return () => {
            isMounted = false;
        };
    }, [user, dispatch, navigation]);

    return (
        <ImageBackground source={require('../../assets/background_app.png')} style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="rgb(0, 0, 0)" />
            <View style={styles.logoContainer}>
                <Image
                    source={require('../../assets/cravess_app_logo.png')}
                    style={styles.logo}
                />
                <View style={{ alignItems: 'center' }}>
                    {FullAddress?.formatted_address ? <Animatable.View animation={'bounceInDown'} duration={1500} style={{ alignItems: 'center' }}>
                        <Image style={{ tintColor: '#f35353', width: 30, height: 30, resizeMode: 'contain', marginBottom: 10, alignItems: 'center', alignSelf: 'center' }} source={require('../../assets/location_icon.png')} />
                        <Text style={{ color: '#f35353', fontSize: 14, fontWeight: 'bold', textAlign: 'center', width: width - 130 }}>{FullAddress?.formatted_address}</Text>
                    </Animatable.View> : null}
                </View>
            </View>
        </ImageBackground>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
    },
    logoContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    logo: {
        height: 250,
        width: 250,
        resizeMode: 'contain',
    },
});

export default SplashScreen;
