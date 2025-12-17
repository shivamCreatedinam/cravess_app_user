import React from 'react';
import { View, ActivityIndicator, StyleSheet, Image } from 'react-native';

// Try to load loader asset, fallback to ActivityIndicator if not found
let loaderSource;
try {
  loaderSource = require('../../assets/loader_splash.gif');
} catch (e) {
  loaderSource = null;
}

const GlobalLoader = () => {
    return (
        <View style={styles.container}>
            {loaderSource ? (
                <Image source={loaderSource} style={styles.loaderImage} />
            ) : (
                <ActivityIndicator size="large" color="#000099" />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)', // Semi-transparent background
        zIndex: 9999, // Ensure it's on top of everything
    },
    loaderImage: {
        width: 100,
        height: 100,
    },
});

export default GlobalLoader;