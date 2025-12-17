import React from "react";
import { View, Text, ImageBackground, Image, Dimensions, TouchableOpacity } from "react-native";

const OffersScreen = () => {
    return (
        <ImageBackground source={require('../../assets/background_app.png')} style={{ flex: 1, }}>
            <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', padding: 10, zIndex: 9999 }}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={{ padding: 10, zIndex: 9999 }}>
                        <Image style={{ height: 25, width: 25, resizeMode: 'cover', marginRight: 10, tintColor: '#f35353' }} source={require('../../assets/left-chevron.png')} />
                    </TouchableOpacity>
                    <Text style={{ flex: 1, fontWeight: 'bold', fontSize: 18, alignItems: 'center', justifyContent: 'center', textAlign: 'center', alignContent: 'center', alignSelf: 'center', marginLeft: -60, fontFamily: 'Poppins-Medium', color: '#f35353' }}>My Offers</Text>
                </View>
                <Image
                    style={{ height: 280, width: 280, resizeMode: 'cover', alignSelf: 'center', marginTop: Dimensions.get('window').width / 1.5 }}
                    source={require('../../assets/no-data-concept.png')} />
            </View>
        </ImageBackground>
    )
}

export default OffersScreen