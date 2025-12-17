import { useNavigation, useRoute } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { View, Text, ImageBackground, StyleSheet, StatusBar, TouchableOpacity, Image } from 'react-native';


export default function BookingHistoryScreen() {

  const route = useRoute();
  const navigation = useNavigation();
  const { orderId } = route.params;

  useEffect(() => {
    console.log('Order ID:', orderId);
    // Fetch order details using orderId
  }, [orderId]);


  return (
    <ImageBackground source={require('../../assets/background_app.png')} style={{ flex: 1, }}>
      <StatusBar barStyle="light-content" backgroundColor="rgb(0, 0, 0)" />
      <View style={{ flexDirection: 'row', alignItems: 'center', padding: 10, zIndex: 9999 }}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ padding: 10, zIndex: 9999 }}>
          <Image style={{ height: 25, width: 25, resizeMode: 'cover', marginRight: 10, tintColor: '#f35353' }} source={require('../../assets/left-chevron.png')} />
        </TouchableOpacity>
        <Text style={{ flex: 1, fontWeight: 'bold', fontSize: 18, alignItems: 'center', justifyContent: 'center', textAlign: 'center', alignContent: 'center', alignSelf: 'center', marginLeft: -60, fontFamily: 'Poppins-Medium', color: '#f35353' }}>Order Details</Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text>Order Details for Order ID: {orderId}</Text>
      </View>
    </ImageBackground>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
  },
});