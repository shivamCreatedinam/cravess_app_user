import React, { useMemo } from "react";
import { View, Text, StyleSheet, ImageBackground, StatusBar, TouchableOpacity, Image, FlatList, Pressable } from "react-native";
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { generateFakeAddresses } from "../../common/fakeAddress";



const AddressCard = ({ item }) => (
    <View style={styles.card}>
        <Text style={styles.text}>{item.street}</Text>
        <Text style={styles.text}>
            {item.city}, {item.state} {item.zip}
        </Text>
        <Text style={styles.text}>{item.country}</Text>
        <View style={{ position: 'absolute', bottom: 10, right: 10, paddingHorizontal: 4, paddingVertical: 2, borderWidth: 1, borderColor: '#f35353', borderRadius: 6, justifyContent: 'center', alignItems: 'center' }}>
            <Text style={{ color: '#f35353', fontSize: 14, alignItems: 'center', justifyContent: 'center', textAlign: 'center', alignContent: 'center', alignSelf: 'center', fontFamily: 'Poppins-Medium', }}>edit</Text>
        </View>
    </View>
);

const AddressChangeScreen = () => {

    const navigation = useNavigation();
    const addressList = useMemo(() => generateFakeAddresses(3), []);


    return (
        <ImageBackground source={require('../../assets/background_app.png')} style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="rgb(0, 0, 0)" />
            <View style={{ flexDirection: 'row', alignItems: 'center', padding: 5, marginBottom: 10 }}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={{ padding: 5, zIndex: 99999 }}>
                    <Image style={{ height: 25, width: 25, resizeMode: 'cover', marginRight: 10, tintColor: '#f35353' }} source={require('../../assets/left-chevron.png')} />
                </TouchableOpacity>
                <Text style={{ flex: 1, fontSize: 18, alignItems: 'center', justifyContent: 'center', textAlign: 'center', alignContent: 'center', alignSelf: 'center', marginLeft: -10, fontFamily: 'Poppins-Medium', color: '#f35353' }}>Address</Text>
                <Pressable style={{ zIndex: 99999, backgroundColor: '#f35353', width: 30, height: 30, borderRadius: 50 }}>
                    <Image style={{ height: 25, width: 25, resizeMode: 'cover', tintColor: '#ffffff', textAlign: 'center', marginLeft: 2, marginTop: 2 }} source={require('../../assets/plus_icon.png')} />
                </Pressable>
            </View>
            <View>
                <FlatList
                    data={addressList}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => <AddressCard item={item} />}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                    initialNumToRender={10}
                />
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

export default AddressChangeScreen; 