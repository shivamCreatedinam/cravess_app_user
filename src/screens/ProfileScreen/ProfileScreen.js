import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, FlatList, ScrollView, TouchableOpacity, Alert, ImageBackground, StatusBar, ActivityIndicator } from 'react-native';
import { fetchUserProfile } from '../../network/api'; // Import API utility
import Icon from 'react-native-vector-icons/Ionicons'; // For icons in bottom tabs
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { version } from '../../../package.json';
import AxiosClient from '../../apis/clients';
import { useDispatch, useSelector } from 'react-redux';
import UserCard from '../../components/UserCard';
import { clearUser } from '../../features/userInfoSlice';

const ProfileScreen = () => {

    const dispatch = useDispatch();
    const navigation = useNavigation();
    const authData = useSelector((state) => state?.userInfo?.user);
    const [isProfileUpdate, setProfileUpdate] = useState(false);
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    const menuItems = [
        { label: 'My Account', icon: 'person-circle-outline', screen: 'RestaurantProfileFormScreen', status: false },
        { label: 'My Category', icon: 'book-outline', screen: 'AddCategoryScreen', status: false },
        { label: 'My Food Item`s', icon: 'location-outline', screen: 'AddFoodItemScreen', status: false },
        { label: 'Review History', icon: 'infinite-outline', screen: 'ReviewHistoryScreen', status: false },
        { label: 'App Permission', icon: 'hammer-outline', screen: 'PermissionScreenMain', status: true },
        { label: 'Refer & Earn Program', icon: 'star-outline', screen: 'PaymentSettingsScreen', status: true },
        // { label: 'My Vouchers', icon: 'card-outline', screen: 'PaymentSettingsScreen', status: false },
        { label: 'Notification Settings', icon: 'notifications-outline', screen: 'NotificationSettingsScreen', status: false },
        // { label: 'Cravess money and gift cards', icon: 'gift-outline', screen: 'AppSettingsScreen', status: true },
        { label: 'App Settings', icon: 'settings-outline', screen: 'AppSettingsScreen', status: false },
        { label: 'Logout', icon: 'enter', screen: 'logout', status: false },
    ];

    useFocusEffect(
        React.useCallback(() => {
            // Do something when the screen is focused
            setLoading(true);
            const loadProfile = async () => {
                try {
                    const res = await AxiosClient.get(`menu/userProfile/${authData?.id}`);
                    setProfile(res.data?.data);
                    setLoading(false);
                } catch (error) {
                    console.error(error);
                    setLoading(false);
                } finally {
                    setLoading(false);
                }
            };

            loadProfile();
            return () => {
                // Do something when the screen is unfocused
                // Useful for cleanup functions
            };
        }, [])
    );

    const AskForLogoutFirst = () => {
        Alert.alert(
            'Log Out Confirmation',  // Message text
            'Are you sure you want to log out? Please confirm your action.', // Optional second argument (if you want a description, or just leave it empty)
            [
                {
                    text: 'OK',
                    onPress: () => {
                        // Your OK button logic here
                        logoutandReset();
                    },
                },
                {
                    text: 'Cancel',
                    onPress: () => {
                        // Your Cancel button logic here
                    },
                },
            ]
        );
    }

    const logoutandReset = async () => {
        try {
            // Clear all data from AsyncStorage
            await AsyncStorage.clear();
            dispatch(clearUser());
            // Optionally, reset application state or navigate to login screen
            // For example, using React Navigation:
            navigation.replace('SplashScreen'); // Adjust according to your navigation setup
            console.log('User  logged out and AsyncStorage cleared.');
        } catch (error) {
            console.error('Error clearing AsyncStorage: ', error);
        }
    }

    const checkCreateProfileOrEdit = () => {
        if (isProfileUpdate) {
            navigation.navigate('RestaurantProfileFormScreen', {
                mode: 'create',
                userId: authData?.id
            });
        } else {
            navigation.navigate('RestaurantProfileFormScreen', {
                mode: 'edit',
                profileId: authData?.id,
                userId: authData?.id
            });
        }
    }

    const handlePress = (item) => {
        if (item.screen === 'logout') {
            AskForLogoutFirst();
        } else if (item.screen === 'RestaurantProfileFormScreen') {
            checkCreateProfileOrEdit();
        } else {
            navigation.navigate(item.screen);
        }
    };

    const renderItem = ({ item }) => (
        <TouchableOpacity style={styles.card} onPress={() => handlePress(item)}>
            <Icon name={item.icon} size={30} color="#324748" />
            <Text style={styles.label}>{item.label}</Text>
            <View style={{ display: item.status ? 'flex' : 'none', position: 'absolute', top: 10, right: 10, paddingHorizontal: 4, paddingVertical: 2, backgroundColor: '#f35353', borderRadius: 6, justifyContent: 'center', alignItems: 'center' }}>
                <Text style={{ color: 'white', fontFamily: 'Poppins-semiBold', fontSize: 12, textTransform: 'uppercase' }}>new</Text>
            </View>
        </TouchableOpacity>
    );

    return (
        <ScrollView
            nestedScrollEnabled={true}
            contentContainerStyle={styles.container}>
            <ImageBackground source={require('../../assets/background_app.png')} style={{ padding: 30, flex: 1, }}>
                <StatusBar barStyle="light-content" backgroundColor="rgb(0, 0, 0)" />
                <View style={{ display: loading ? 'flex' : 'none', position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.5)', zIndex: 999 }}>
                    <ActivityIndicator size="large" color="#f35353" animating={loading} />
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <TouchableOpacity onPress={() => navigation.goBack()}>
                        <Image style={{ height: 30, width: 30, resizeMode: 'contain', tintColor: '#f06262' }} source={require('../../assets/left-chevron.png')} />
                    </TouchableOpacity>
                    <View style={{ flex: 1 }} />
                    <TouchableOpacity style={{ borderColor: '#f35353', borderWidth: 1, padding: 6, borderRadius: 6, display: 'none' }}>
                        <Text style={{ color: '#f35353', fontFamily: 'Poppins-semiBold', fontSize: 12, textTransform: 'uppercase' }}>help</Text>
                    </TouchableOpacity>
                </View>
                <UserCard user={profile} />
                <View style={styles.containerX}>
                    <FlatList
                        data={menuItems}
                        renderItem={renderItem}
                        keyExtractor={(item, index) => index.toString()}
                        numColumns={2}
                        contentContainerStyle={styles.containerX}
                        showsVerticalScrollIndicator={false}
                    />
                    <Text style={{ textAlign: 'center', color: '#f35353', fontFamily: 'Poppins-semiBold', fontWeight: 'bold' }}>version : {version}</Text>
                </View>
            </ImageBackground>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1
    },
    containerX: {
        padding: 16,
        justifyContent: 'center',
        marginBottom: 200
    },
    card: {
        flex: 1,
        margin: 8,
        backgroundColor: '#F5F5F5',
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
        elevation: 3, // Android shadow
        shadowColor: '#000', // iOS shadow
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
    },
    label: {
        marginTop: 10,
        fontSize: 14,
        color: '#324748',
        textAlign: 'center',
    },
    loaderContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    errorText: {
        fontSize: 16,
        color: 'red',
    },
    header: {
        alignItems: 'center',
        marginBottom: 20,
    },
    profileImage: {
        width: 120,
        height: 120,
        borderRadius: 60,
        marginBottom: 10,
    },
    username: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
    },
    email: {
        fontSize: 16,
        color: '#666',
    },
    value: {
        fontSize: 16,
        color: '#333',
        marginBottom: 10,
    },
    menuItem: {
        paddingVertical: 12,
        paddingHorizontal: 20,
        backgroundColor: '#ffffff',
        borderRadius: 10,
        marginBottom: 10,
        elevation: 10,
    },
    icon: {
        marginRight: 15,
    },
});
export default ProfileScreen;
