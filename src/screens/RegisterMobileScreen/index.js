// @ts-nocheck
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, Dimensions, TextInput, Platform, ActivityIndicator, ImageBackground, StatusBar } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { showToast, showSuccessToast, showErrorToast } from '../../utils/common';
import { useRoute } from '@react-navigation/native';
import AxiosClient from '../../apis/clients';
import theme from '../../theme';
import { color } from '../../theme/color';
import { useSelector, useDispatch } from 'react-redux';
import {
    BottomSheetModal,
    BottomSheetView,
    BottomSheetModalProvider,
} from '@gorhom/bottom-sheet';

const RegisterMobileScreen = () => {

    const navigation = useNavigation();
    const [data, setData] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isloading, setIsLoading] = useState(false);
    const token = useSelector((state) => state.user.token);
    const [mobileNumber, setMobileNumber] = React.useState('');
    const dispatch = useDispatch();
    // const token = useSelector(state => state.auth.token);

    // [name,email,mobile,password]
    const [UserName, setUserName] = useState('');
    const [UserEmail, setUserEmail] = useState('');
    const [UserMobile, setUserMobile] = useState('');
    const [isSecure, setIsSecure] = useState(true);
    const [UserPassword, setUserPassword] = useState('');

    // []
    const [suggestions, setSuggestions] = useState([]);
    const [strength, setStrength] = useState('');

    const mobilevalidate = (text) => {
        const reg = /^[0]?[987]\d{9}$/;
        if (reg.test(text) === false) {
            showErrorToast('Invalid Mobile Number! Enter Correct Mobile Number');
            return false;
        } else {
            return true;
        }
    }


    const fetchDataPost = async () => {
        try {
            setIsLoading(true);
            const response = await AxiosClient.post('menu/send-otp', {
                phone_number: mobileNumber,
            });
            if (response.data?.status === false) {
                console.log('Response false:', response.data);
                showErrorToast(`${response.data?.message} \n ${response.data?.errors}`);
                setIsLoading(false);
            } else {
                console.log('Response true:', response.data);
                showSuccessToast(response.data?.message);
                setData(response.data?.mobile_otp);
                setIsLoading(false);
                navigation.replace('OTPScrenes', { number: mobileNumber, data: response.data?.mobile_otp });
            }
        } catch (error) {
            setIsLoading(false);
            console.error('Error fetching data:', error);
        }
    };

    const validation = () => {
        if (mobilevalidate(mobileNumber)) {
            fetchDataPost();
            // navigation.replace('OTPScrenes', { number: mobileNumber, data: '123456' });
        }
    }

    const handlePresentModalPress = () => {
        navigation.navigate('RegisterEmailScreen');
    };

    return (
        <ImageBackground source={require('../../assets/background_app.png')} style={{ padding: 30, flex: 1, }}>
            <StatusBar barStyle="light-content" backgroundColor="rgb(0, 0, 0)" />
            <View style={{ flex: 1 }}>
                <Image style={{ width: Dimensions.get('screen').width / 2, alignSelf: 'center', height: 160, marginTop: 100 }} resizeMode={'contain'} source={require('../../assets/cravess_app_logo.png')} />
                <View style={{ marginTop: 150 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', height: 55, borderRadius: 5, elevation: 5, }}>
                        <Image style={{ height: 30, width: 30, resizeMode: 'center' }} source={require('../../assets/smartphone-call.png')} />
                        <TextInput value={mobileNumber} onChangeText={(text) => setMobileNumber(text)} style={{ color: '#000000', paddingHorizontal: 10, fontFamily: theme.fontFamily.poppinsMedium, flex: 1, height: 55, fontSize: 16 }} maxLength={10} keyboardType={'numeric'} placeholder={'Mobile'} placeholderTextColor={'#0000000'} />
                    </View>
                    <TouchableOpacity onPress={() => validation()} style={{ height: 55, alignItems: 'center', alignSelf: 'center', padding: 20, marginTop: 15, backgroundColor: '#000000', width: '100%', elevation: 5, borderRadius: 10 }}>
                        <Text style={{ textAlign: 'center', color: '#FFFFFF', fontFamily: theme.fontFamily.poppinsRegular, }}>Continue</Text>
                    </TouchableOpacity>
                    <View style={{ marginTop: 30 }}>
                        <View style={{ width: '100%', height: 1, backgroundColor: '#ffffff' }} />
                        <Text style={{ color: '#FFFFFF', alignSelf: 'center', marginTop: -10, paddingLeft: 20, paddingRight: 20, fontFamily: theme.fontFamily.bauhausStdMedium, }}>OR</Text>
                    </View>
                    <View style={{ marginTop: 20 }}>
                        <TouchableOpacity onPress={() => handlePresentModalPress()} style={{ backgroundColor: '#FFFFFF', padding: 15, borderRadius: 5, flexDirection: 'row', alignItems: 'center' }}>
                            <Image style={{ height: 25, width: 25, resizeMode: 'contain' }} source={require('../../assets/mail.png')} />
                            <Text style={{ color: '#000', textAlign: 'center', flex: 1, fontFamily: theme.fontFamily.poppinsRegular, }}>Continue with Email | Mobile</Text>
                        </TouchableOpacity>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 20 }}>
                        <TouchableOpacity onPress={() => fetchData()} style={{ flex: 1, backgroundColor: '#FFFFFF', padding: 15, borderRadius: 5, flexDirection: 'row', alignItems: 'center' }}>
                            <Image style={{ height: 25, width: 25, resizeMode: 'contain' }} source={require('../../assets/facebook.png')} />
                            <Text style={{ color: '#000', textAlign: 'center', flex: 1, fontFamily: theme.fontFamily.poppinsRegular, }}>Facebook</Text>
                        </TouchableOpacity>
                        <View style={{ width: 20 }} />
                        <TouchableOpacity style={{ flex: 1, backgroundColor: '#FFFFFF', padding: 15, borderRadius: 5, flexDirection: 'row', alignItems: 'center' }}>
                            <Image style={{ height: 25, width: 25, resizeMode: 'contain' }} source={require('../../assets/search.png')} />
                            <Text style={{ color: '#000', textAlign: 'center', flex: 1, fontFamily: theme.fontFamily.poppinsRegular, }}>Google</Text>
                        </TouchableOpacity>
                    </View>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', alignSelf: 'center', marginTop: 20, flex: 1 }}>
                    <Text style={{ textAlign: 'center', color: '#000000', fontFamily: theme.fontFamily.poppinsRegular, }}>Made In India</Text>
                    <Image style={{ width: 20, height: 20, alignItems: 'center', marginLeft: 10 }} source={require('../../assets/india.png')} />
                </View>
            </View>
        </ImageBackground>
    )

}


// Later on in your styles..
var styles = StyleSheet.create({
    linearGradient: {
        flex: 1,
        paddingLeft: 15,
        paddingRight: 15,
    },
    buttonText: {
        fontSize: 18,
        fontFamily: 'Gill Sans',
        textAlign: 'center',
        margin: 10,
        color: '#ffffff'
    }, container: {
        flex: 1,
        padding: 24,
        justifyContent: 'center'
    },
    contentContainer: {
        flex: 1,
        alignItems: 'center',
        width: '100%',
        backgroundColor: 'white'
    }, strengthText: {
        fontWeight: 'bold',
        fontSize: 18,
        color: '#007700',
    },
    suggestionsText: {
        color: 'red',
    },
    strengthMeter: {
        width: '100%',
        height: 10,
        backgroundColor: '#ccc',
        marginTop: 0,
        borderRadius: 10,
        overflow: 'hidden',
        marginBottom: 20
    },
});

export default RegisterMobileScreen