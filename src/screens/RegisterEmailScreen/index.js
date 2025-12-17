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

const RegisterEmailScreen = () => {

    const navigation = useNavigation();
    const [data, setData] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isloading, setIsLoading] = useState(false);
    const token = useSelector((state) => state.user.token);
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

    React.useEffect(() => {
        if (token?.access_token !== null && token?.access_token !== undefined) {
            navigation.replace('HomeScreens');
        }
    }, []);

    const fetchData = async () => {
        try {
            const response = await AxiosClient.get('/objects');
            console.log(JSON.stringify(response.data));
            setData(response.data);
            setLoading(false);
        } catch (err) {
            console.log(JSON.stringify(err));
            setError(err.message);
            setLoading(false);
        }
    };

    const mobilevalidate = (text) => {
        const reg = /^[0]?[987]\d{9}$/;
        if (reg.test(text) === false) {
            showErrorToast('Invalid Mobile Number! Enter Correct Mobile Number');
            return false;
        } else {
            return true;
        }
    }

    const validationRegister = () => {

        const pattern = /^[a-zA-Z\s'-]+$/;
        const reg = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
        const pass = /^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*_)(?!.*\W)(?!.* ).{8,16}$/;
        console.log('validationRegister', UserName, UserEmail, UserMobile, UserPassword);
        if (!pattern.test(UserName)) {
            showErrorToast('Invalid User Name, Enter First & Last Name');
        } else if (!reg.test(UserEmail)) {
            showErrorToast('Invalid Email Address, Enter Valid Email Address!');
        } else if (!mobilevalidate(UserMobile)) {
            showErrorToast('Invalid Mobile Number! Enter Correct Mobile Number');
        } else if (UserPassword.length < 8 && UserPassword !== null) {
            showErrorToast('Invalid Password, Enter Valid Password');
        } else {
            RegisterDataPostForm();
        }
    }

    const RegisterDataPostForm = async () => {
        try {
            setIsLoading(true);
            const response = await AxiosClient.post('/register', {
                full_name: UserName,
                email: UserEmail,
                phone_number: UserMobile,
                password: UserPassword,
                confirm_password: UserPassword,
                role: "restaurant",
                address: ""

            });
            if (response.data?.status === false) {
                showErrorToast(`${response.data?.message} \n ${response.data?.errors}`);
                setIsLoading(false);
            } else {
                showSuccessToast(response.data?.message);
                setData(response.data?.data);
                setIsLoading(false);
                // go to login screen
                navigation.replace('RegisterMobileScreen');
            }
        } catch (error) {
            setIsLoading(false);
            console.error('Error fetching data:', error);
        }
    };

    const validatePassword = (input) => {
        let newSuggestions = [];
        if (input.length < 8) {
            newSuggestions.push('Password should be at least 8 characters long')
        }
        if (!/\d/.test(input)) {
            newSuggestions.push('Add at least one number')
        }

        if (!/[A-Z]/.test(input) || !/[a-z]/.test(input)) {
            newSuggestions.push('Include both upper and lower case letters')
        }

        if (!/[^A-Za-z0-9]/.test(input)) {
            newSuggestions.push('Include at least one special character')
        }

        setSuggestions(newSuggestions);

        // Determine password strength based on suggestions
        if (newSuggestions.length === 0) {
            setStrength('Very Strong');
        }
        else if (newSuggestions.length <= 1) {
            setStrength('Strong')
        }
        else if (newSuggestions.length <= 2) {
            setStrength('Moderate')
        }
        else if (newSuggestions.length <= 3) {
            setStrength('Weak')
        }
        else {
            setStrength('Too Weak')
        }
    }

    return (
        <ImageBackground source={require('../../assets/background_app.png')} style={{ padding: 20, flex: 1, }}>
            <StatusBar barStyle="light-content" backgroundColor="rgb(0, 0, 0)" />
            <Image style={{ width: Dimensions.get('screen').width / 2, alignSelf: 'center', height: 160, marginTop: 20 }} resizeMode={'contain'} source={require('../../assets/cravess_app_logo.png')} />
            <View style={{ flex: 1 }}>
                <Text style={{ fontFamily: theme.fontFamily.poppinsRegular, marginBottom: 15 }}>Sign Up Now to Get Restaurant 🎉</Text>
                <View style={{ width: '90%', margin: 10, alignSelf: 'center' }}>
                    <TextInput value={UserName} onChangeText={(text) => setUserName(text)} style={{ backgroundColor: '#ecf2fa', height: 50, borderRadius: 5, elevation: 5, color: '#000000', paddingHorizontal: 10, fontFamily: theme.fontFamily.poppinsRegular, marginBottom: 15, }} maxLength={40} keyboardType={'default'} placeholder={'User Name'} placeholderTextColor={'#000000'} />
                    <TextInput value={UserEmail} onChangeText={(text) => setUserEmail(text)} style={{ backgroundColor: '#ecf2fa', height: 50, borderRadius: 5, elevation: 5, color: '#000000', paddingHorizontal: 10, fontFamily: theme.fontFamily.poppinsRegular, marginBottom: 15 }} maxLength={50} keyboardType={'email-address'} placeholder={'Email Address'} placeholderTextColor={'#000000'} />
                    <TextInput value={UserMobile} onChangeText={(text) => setUserMobile(text)} style={{ backgroundColor: '#ecf2fa', height: 50, borderRadius: 5, elevation: 5, color: '#000000', paddingHorizontal: 10, fontFamily: theme.fontFamily.poppinsRegular, marginBottom: 15 }} maxLength={10} keyboardType={'numeric'} placeholder={'Mobile Number'} placeholderTextColor={'#000000'} />
                    <View>
                        <TextInput
                            secureTextEntry={isSecure}
                            value={UserPassword}
                            onChangeText={(text) => {
                                setUserPassword(text);
                                validatePassword(text);
                            }}
                            style={{
                                backgroundColor: '#ecf2fa',
                                height: 50,
                                borderRadius: 5,
                                elevation: 5,
                                color: '#000000',
                                paddingHorizontal: 10,
                                fontFamily: theme.fontFamily.poppinsRegular,
                                marginBottom: 15
                            }}
                            maxLength={30}
                            keyboardType={'default'}
                            placeholder={'Password | Final Password'}
                            placeholderTextColor={'#000000'}
                        />
                        <TouchableOpacity style={{ position: 'absolute', right: 15, top: 15 }} onPress={() => setIsSecure(!isSecure)}>
                            {isSecure === true ? <Image style={{ width: 20, height: 20, resizeMode: 'contain' }} source={require('../../assets/open-eye.png')} /> : <Image style={{ width: 20, height: 20, resizeMode: 'contain' }} source={require('../../assets/eye.png')} />}
                        </TouchableOpacity>
                    </View>
                    <View>
                        <Text style={styles.suggestionsText}>
                            {suggestions.map((suggestion, index) => (
                                <Text key={index}>
                                    {suggestion}{'\n'}
                                </Text>))}
                        </Text>
                        <View style={styles.strengthMeter}>
                            <View style={{
                                width: `${(strength === 'Very Strong' ? 100 :
                                    (strength === 'Strong' ? 75 :
                                        (strength === 'Moderate' ? 50 :
                                            (strength === 'Weak' ? 25 : 0))))}%`,
                                height: 20,
                                backgroundColor: strength === 'Too Weak' ? 'red' :
                                    (strength === 'Weak' ? 'orange' :
                                        (strength === 'Moderate' ? 'yellow' :
                                            (strength === 'Strong' ? 'green' : 'limegreen')))
                            }}>
                            </View>
                        </View>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'flex-start', alignSelf: 'flex-start', alignContent: 'flex-start' }}>
                        <Image style={{ marginRight: 5, width: 15, height: 15 }} source={require('../../assets/checked.png')} />
                        <Text numberOfLines={1} style={{ fontFamily: theme.fontFamily.poppinsMedium, fontSize: 10, marginRight: 15, color: '#000000' }}>By Sign up you agree to our Term & Conditions Or Privacy policy</Text>
                    </View>
                    <TouchableOpacity onPress={() => validationRegister()} style={{ height: 55, alignItems: 'center', alignSelf: 'center', padding: 16, marginTop: 15, backgroundColor: '#000000', width: '100%', elevation: 5, borderRadius: 10 }}>
                        {isloading === true ? <ActivityIndicator /> : <Text style={{ textAlign: 'center', color: '#FFFFFF', fontFamily: theme.fontFamily.poppinsRegular, }}>Sign Up Now</Text>}
                    </TouchableOpacity>
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

export default RegisterEmailScreen