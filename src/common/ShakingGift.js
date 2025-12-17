import React, { useEffect, useRef } from 'react';
import { Animated, Image, StyleSheet, TouchableOpacity, View, Alert } from 'react-native';

// Check if @react-navigation/native is available
let useNavigation;
try {
    const navigation = require('@react-navigation/native');
    useNavigation = navigation.useNavigation;
} catch (e) {
    // Fallback if navigation is not available
    useNavigation = () => ({
        navigate: (screen, params) => {
            Alert.alert('Navigation', `Would navigate to ${screen}`, [{ text: 'OK' }]);
        },
    });
}

export default function ShakingGift({
    imageSource,
    size = 80,
    position = { bottom: 30, right: 20 },
    onPress,
}) {
    const shakeAnim = useRef(new Animated.Value(0)).current;

    const navigation = useNavigation();

    useEffect(() => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(shakeAnim, {
                    toValue: 1,
                    duration: 50,
                    useNativeDriver: true,
                }),
                Animated.timing(shakeAnim, {
                    toValue: -1,
                    duration: 50,
                    useNativeDriver: true,
                }),
                Animated.timing(shakeAnim, {
                    toValue: 1,
                    duration: 50,
                    useNativeDriver: true,
                }),
                Animated.timing(shakeAnim, {
                    toValue: 0,
                    duration: 50,
                    useNativeDriver: true,
                }),
                Animated.delay(1000), // delay between shakes
            ])
        ).start();
    }, []);

    const animatedStyle = {
        transform: [
            {
                rotate: shakeAnim.interpolate({
                    inputRange: [-1, 1],
                    outputRange: ['-5deg', '5deg'],
                }),
            },
        ],
    };

    const handlePress = () => {
        if (onPress) {
            onPress();
        } else {
            navigation.navigate('OffersScreen');
        }
    };

    return (
        <Animated.View style={[styles.giftWrapper, position, animatedStyle]}>
            <TouchableOpacity onPress={handlePress}>
                <Image source={imageSource} style={{ width: size, height: size }} resizeMode="contain" />
            </TouchableOpacity>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    giftWrapper: {
        position: 'absolute',
        zIndex: 999,
    },
});
