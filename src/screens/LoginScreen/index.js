import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Alert,
    ActivityIndicator,
    StatusBar,
    Image,
    ImageBackground
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { showToast, showSuccessToast, showErrorToast } from '../../utils/common';
import CountDown from 'react-native-countdown-fixed';
import { OtpInput } from "react-native-otp-entry";
// redux
import AxiosClient from '../../apis/clients';
import { useSelector, useDispatch } from 'react-redux';
import { setToken } from '../../features/userSlice';
// desing
import theme from '../../theme';
import { setUser } from '../../features/userInfoSlice';

const LoginScreen = () => {

    const route = useRoute();
    const navigation = useNavigation();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isloading, setIsLoading] = useState(false);
    const [otp_validate, setOTPValidate] = useState(route.params?.data);
    const [otp_validate_email, setOTPValidateEmail] = useState(route.params?.data?.email_otp);
    const [email_address, setEmailAddress] = useState(route.params?.email_address);
    const [otp_email, setOTPEmail] = useState('');
    const [otp_mobile, setOTPMobile] = useState('');
    const [resendEnable, setResendEnable] = useState(false);

    // ref

    // const token = useSelector(state => state.auth.token);
    const dispatch = useDispatch();

    console.log(JSON.stringify(route.params))

    const stopAutoRecording = async () => {
        setResendEnable(true);
    }

    const mobilevalidate = (text) => {
        const reg = /^\d{6}$/;
        if (reg.test(text) === false) {
            showErrorToast('Invalid OTP! Enter Correct 6 Digit OTP');
            return false;
        } else {
            return true;
        }
    }

    const verifyRegisterOTP = async () => {
        try {
            setIsLoading(true);
            const response = await AxiosClient.post('menu/validate-otp', {
                phone_number: route.params?.number,
                otp_code: otp_email,
            });
            if (response.data?.status === false) {
                console.log('Response false:', response.data);
                showErrorToast(`${response.data?.message} \n ${response.data?.errors}`);
                setIsLoading(false);
            } else {
                console.log('Response true:X', response.data);
                showSuccessToast(response.data?.message);
                setData(response.data?.user);
                dispatch(setUser(response.data?.user));
                navigation.replace('HomeScreen', { number: response.data?.user });
                setIsLoading(false);
            }
        } catch (error) {
            setIsLoading(false);
            console.error('Error fetching data:', error);
        }
    }

    const chooseSubmition = () => {
        // 
        if (otp_validate_email !== undefined) {
            verifyRegisterOTP();
        } else {
            validation();
        }
    }

    const validation = () => {
        console.log(otp_email);
        if (mobilevalidate(otp_email)) {
            if (otp_email === otp_validate) {
                verifyRegisterOTP();
            } else {
                showErrorToast('Invalid OTP! \nPlease enter valid OTP.');
            }
        }
    }

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

    const fetchDataPost = async () => {
        try {
            setIsLoading(true);
            const response = await AxiosClient.post('verify-login-otp', {
                mobile: route.params?.number,
                mobile_otp: otp_email,
            });
            if (response.data?.status === false) {
                console.log('Response false:', response.data);
                showErrorToast(`${response.data?.message} \n ${response.data?.errors}`);
                setIsLoading(false);
            } else {
                console.log('Response true:', response.data);
                showSuccessToast(response.data?.message);
                setData(response.data?.data);
                dispatch(setToken(response.data?.data));
                setIsLoading(false);
                navigation.replace('HomeScreen', { number: route.params?.number });
            }
        } catch (error) {
            setIsLoading(false);
            console.error('Error fetching data:', error);
        }
    };


    return (
        <ImageBackground source={require('../../assets/background_app.png')} style={{ padding: 30, flex: 1, }}>
            <StatusBar barStyle="light-content" backgroundColor="rgb(0, 0, 0)" />
            <View style={{ marginBottom: 0 }}>
                <Image style={{ height: 250, width: 250, resizeMode: 'contain', alignSelf: 'center' }} source={require('../../assets/cravess_app_logo.png')} />
            </View>
            <Text style={{ color: '#000000', marginBottom: 20 }}>{`We have send the varification code to \n ${route.params?.number} -- OTP [${otp_validate}]`}</Text>
            <OtpInput
                numberOfDigits={6}
                focusColor="rgb(205,135,42)"
                focusStickBlinkingDuration={500}
                onTextChange={(text) => setOTPEmail(text)}
                onFilled={(text) => setOTPEmail(text)}
                textInputProps={{
                    accessibilityLabel: "One-Time Password",
                }}
                theme={{
                    containerStyle: styles.container,
                    pinCodeContainerStyle: styles.pinCodeContainer,
                    pinCodeTextStyle: [styles.pinCodeText, {}],
                    focusStickStyle: styles.focusStick,
                    focusedPinCodeContainerStyle: styles.activePinCodeContainer,
                }}
            />
            {otp_validate_email !== undefined ? <View style={{ marginTop: 30 }}>
                <Text style={{ fontFamily: theme.fontFamily.poppinsRegular, color: '#000000', marginBottom: 20 }}>{`We have send the varification code to \n ${email_address} -- OTP[${otp_validate_email}]`}</Text>
                <OtpInput
                    numberOfDigits={6}
                    focusColor="rgb(205,135,42)"
                    focusStickBlinkingDuration={500}
                    onTextChange={(text) => setOTPMobile(text)}
                    onFilled={(text) => setOTPMobile(text)}
                    textInputProps={{
                        accessibilityLabel: "One-Time Password",
                    }}
                    theme={{
                        containerStyle: styles.container,
                        pinCodeContainerStyle: styles.pinCodeContainer,
                        pinCodeTextStyle: [styles.pinCodeText, { fontFamily: theme.fontFamily.poppinsRegular, }],
                        focusStickStyle: styles.focusStick,
                        focusedPinCodeContainerStyle: styles.activePinCodeContainer,
                    }}
                />
            </View> : null}
            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 20 }}>
                <CountDown
                    size={11}
                    until={60}
                    onFinish={() => stopAutoRecording()}
                    digitStyle={{ backgroundColor: '#cd4021', borderWidth: 2, borderColor: '#cd4021' }}
                    digitTxtStyle={{ color: '#FFFFFF' }}
                    timeLabelStyle={{ color: 'red', fontWeight: 'bold', fontFamily: theme.fontFamily.poppinsRegular, }}
                    separatorStyle={{ color: '#FFFFFF' }}
                    timeToShow={['M', 'S']}
                    timeLabels={{ m: null, s: null }}
                    showSeparator
                />
                {resendEnable === true ? <TouchableOpacity style={{ flex: 1, alignSelf: 'flex-end', alignContent: 'flex-end', alignItems: 'flex-end' }}><Text style={{ fontFamily: theme.fontFamily.poppinsRegular, color: '#FFF' }}>Resend OTP</Text></TouchableOpacity> : null}
            </View>
            <View>
                <TouchableOpacity onPress={() => chooseSubmition()} style={{ height: 55, alignItems: 'center', alignSelf: 'center', padding: 20, marginTop: 15, backgroundColor: '#000000', width: '100%', elevation: 5, borderRadius: 10 }}>
                    <Text style={{ textAlign: 'center', color: '#FFFFFF', fontFamily: theme.fontFamily.poppinsRegular, }}>Continue</Text>
                </TouchableOpacity>
            </View>
        </ImageBackground>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "rgb(50,71,72)",
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
    },
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
        color: '#ffffff',
        backgroundColor: 'transparent',
    }, codeContainer: {
        borderWidth: 1,
        borderRadius: 12,
        borderColor: "#DFDFDE",
        height: 60,
        width: 44,
        justifyContent: "center",
        alignItems: "center",
    },
    codeText: {
        fontSize: 28,
    },
    hiddenInput: {
        ...StyleSheet.absoluteFillObject,
        opacity: 0.01,
    },
    stick: {
        width: 2,
        height: 30,
        backgroundColor: "green",
    }, container: {

    }, pinCodeContainer: {

    }, pinCodeText: {
        color: '#000000',
        fontSize: 14,
    }, activePinCodeContainer: {

    }
});

export default LoginScreen;
