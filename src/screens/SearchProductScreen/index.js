import React, { useMemo } from "react";
import { View, Text, StyleSheet, ImageBackground, StatusBar, TouchableOpacity, Image, FlatList } from "react-native";
import { useNavigation, useFocusEffect } from '@react-navigation/native';


const SearchProductScreen = () => {

    const navigation = useNavigation();

    return (
        <ImageBackground source={require('../../assets/background_app.png')} style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="rgb(0, 0, 0)" />
            <View style={{ flexDirection: 'row', alignItems: 'center', padding: 5, marginBottom: 10 }}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={{ padding: 5, zIndex: 99999 }}>
                    <Image style={{ height: 25, width: 25, resizeMode: 'cover', marginRight: 10, tintColor: '#f35353' }} source={require('../../assets/left-chevron.png')} />
                </TouchableOpacity>
                <Text
                    style={{ flex: 1, fontSize: 18, alignItems: 'center', justifyContent: 'center', textAlign: 'center', alignContent: 'center', alignSelf: 'center', marginLeft: -40, fontFamily: 'Poppins-Medium', color: '#f35353' }}>Search</Text>
            </View>
            <View>

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
    header: {
        fontSize: 24,
        fontWeight: '700',
        marginBottom: 12,
        color: '#333',
    },
    listContent: {
        paddingBottom: 20,
    },
    card: {
        backgroundColor: '#FFFFFF',
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
        elevation: 3, // Android shadow
        shadowColor: '#000', // iOS shadow
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    name: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 4,
        color: '#2D3748',
    },
    text: {
        fontSize: 14,
        color: '#4A5568',
    },
});

export default SearchProductScreen; 