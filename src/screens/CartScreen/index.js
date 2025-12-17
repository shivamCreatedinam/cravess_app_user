import { View, Text, TouchableOpacity, StatusBar, Image, FlatList, Dimensions, Alert, TextInput, ImageBackground, Pressable } from 'react-native';
import { useNavigation, useFocusEffect, useRoute } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import BottomSheet from "react-native-gesture-bottom-sheet";
import Toast from 'react-native-toast-message';
import AxiosClient from '../../apis/clients';
import React from 'react';
import { useSelector } from 'react-redux';

const CartScreenFood = () => {

    const [DataCart, setDataCart] = React.useState([]);
    const [AddressData, setAddressData] = React.useState([]);
    const [isLoading, setLoading] = React.useState(true);
    const [TotalPrice, setTotalPrice] = React.useState(0);
    const [CartCount, setCartCount] = React.useState(0);
    const [AddressId, setAddressId] = React.useState('');
    const [PaymentMode, setPaymentMode] = React.useState('');
    const [DeliveryAddress, setDeliveryAddress] = React.useState('');
    const [DeliveryCharge, setDeliveryCharge] = React.useState(0);
    const [order_id, setOrderId] = React.useState('');
    const [user_id, setUserId] = React.useState('');
    const bottomSheet = React.useRef();
    const bottomPaymnetTypeSheet = React.useRef();
    const navigation = useNavigation();
    const route = useRoute();
    const authData = useSelector((state) => state?.userInfo?.user);
    const userId = authData?.id || 1; // Fallback to 1 if user not found

    useFocusEffect(
        React.useCallback(() => {
            loadCartProducts();
            DisplayAddress();
            return () => {
                // Useful for cleanup functions
            };
        }, [userId])
    );

    const loadCartProducts = async () => {
        try {
            setLoading(true);
            const responseRestaurants = await AxiosClient.get(`menu/cart/${userId}`);
            console.log('loadCartProducts', JSON.stringify(responseRestaurants.data?.data));
            setDataCart(responseRestaurants.data?.data?.items || []);
            setTotalPrice(responseRestaurants.data?.data?.total_amount || 0);
        } catch (error) {
            console.error('Error loading cart:', error);
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: 'Failed to load cart items',
            });
        } finally {
            setLoading(false);
        }
    }

    const DisplayAddress = async () => {
        try {
            // Fetch addresses from API or Redux store
            const response = await AxiosClient.get(`menu/user-addresses/${userId}`);
            if (response.data?.data) {
                setAddressData(response.data.data);
            }
        } catch (error) {
            console.error('Error loading addresses:', error);
            // Fallback to empty array if API fails
            setAddressData([]);
        }
    }

    // Missing function implementations - moved before return
    const CheckAddressAvailable = () => {
        if (!AddressId || AddressId === '') {
            Alert.alert(
                'Address Required',
                'Please select a delivery address to continue',
                [
                    { text: 'OK', onPress: () => bottomSheet.current?.show() }
                ]
            );
            bottomSheet.current?.show();
            return;
        }
        if (!PaymentMode || PaymentMode === '') {
            Alert.alert(
                'Payment Method Required',
                'Please select a payment method to continue',
                [
                    { text: 'OK', onPress: () => bottomPaymnetTypeSheet.current?.show() }
                ]
            );
            bottomPaymnetTypeSheet.current?.show();
            return;
        }
        // Proceed with checkout
        proceedToCheckout();
    }

    const proceedToCheckout = async () => {
        try {
            const response = await AxiosClient.post('menu/orders/create', {
                user_id: userId,
                address_id: AddressId,
                payment_mode: PaymentMode,
                items: DataCart.map(item => ({
                    food_item_id: item.id,
                    quantity: item.quantity || 1,
                    price: item.price_per_unit || item.subtotal
                })),
                total_amount: TotalPrice + DeliveryCharge,
                delivery_charge: DeliveryCharge
            });

            if (response.data?.status || response.data?.success) {
                Toast.show({
                    type: 'success',
                    text1: 'Order Placed',
                    text2: 'Your order has been placed successfully',
                });
                // Navigate to order tracking
                navigation.navigate('TrackOrderScreen', { orderId: response.data?.data?.id || response.data?.order_id });
            } else {
                Toast.show({
                    type: 'error',
                    text1: 'Order Failed',
                    text2: response.data?.message || 'Failed to place order',
                });
            }
        } catch (error) {
            console.error('Checkout error:', error);
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: 'Something went wrong. Please try again.',
            });
        }
    }

    const GoToNewAddress = () => {
        bottomSheet.current?.hide();
        navigation.navigate('AddressChangeScreen');
    }

    const updatePaymentMode = (mode) => {
        setPaymentMode(mode);
        bottomPaymnetTypeSheet.current?.hide();
        Toast.show({
            type: 'success',
            text1: 'Payment Method',
            text2: `Selected: ${mode}`,
        });
    }

    const renderAddressCard = (item) => {
        return (
            <TouchableOpacity
                style={{
                    padding: 15,
                    backgroundColor: AddressId === item.id ? '#e3f2fd' : '#f5f5f5',
                    borderRadius: 10,
                    marginVertical: 5,
                    borderWidth: AddressId === item.id ? 2 : 1,
                    borderColor: AddressId === item.id ? '#2196f3' : '#ddd',
                }}
                onPress={() => {
                    setAddressId(item.id);
                    setDeliveryAddress(item.full_address || item.address || item.details || '');
                    bottomSheet.current?.hide();
                }}
            >
                <Text style={{ fontWeight: 'bold', fontSize: 16, marginBottom: 5 }}>
                    {item.label || item.type || 'Address'}
                </Text>
                <Text style={{ fontSize: 14, color: '#666' }}>
                    {item.full_address || item.address || item.details || ''}
                </Text>
                {item.city && (
                    <Text style={{ fontSize: 12, color: '#999', marginTop: 5 }}>
                        {item.city}{item.state ? `, ${item.state}` : ''} {item.postal_code || ''}
                    </Text>
                )}
            </TouchableOpacity>
        );
    }

    const renderItemsCard = (item) => {
        return (
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 5, elevation: 5, backgroundColor: '#fff', marginVertical: 5, marginHorizontal: 10, borderRadius: 10 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 10, }}>
                    <Image
                        style={{ width: 80, height: 80, resizeMode: "cover", borderRadius: 10 }}
                        source={item?.image ? { uri: item?.image } : require('../../assets/no-image-placeholder.jpg')} />
                    <View style={{ marginLeft: 10, flex: 1 }}>
                        <Text style={{ fontWeight: 'bold', fontSize: 16, fontFamily: 'Poppins-Medium', color: '#f35353' }}>{item?.name}</Text>
                        {/* <Text style={{ fontWeight: 'bold', fontSize: 16, fontFamily: 'Poppins-Medium', color: '#f35353' }}>1 x {item?.quantity} = {item?.price_per_unit}</Text> */}
                        <Text style={{ fontWeight: 'bold', fontSize: 16, fontFamily: 'Poppins-Medium', color: '#f35353' }}>₹ {item?.subtotal}</Text>
                    </View>
                    <Pressable style={{ backgroundColor: '#f35353', width: 30, height: 30, borderRadius: 50 }}>
                        <Image style={{ width: 30, height: 30, resizeMode: "cover", borderRadius: 50 }} source={require('../../assets/delete.png')} />
                    </Pressable>
                </View>
            </View>
        )
    }

    return (
        <ImageBackground source={require('../../assets/background_app.png')} style={{ padding: 0, flex: 1, }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', padding: 10, zIndex: 9999 }}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={{ padding: 10, zIndex: 9999 }}>
                    <Image style={{ height: 25, width: 25, resizeMode: 'cover', marginRight: 10, tintColor: '#f35353' }} source={require('../../assets/left-chevron.png')} />
                </TouchableOpacity>
                <Text style={{ flex: 1, fontWeight: 'bold', fontSize: 18, alignItems: 'center', justifyContent: 'center', textAlign: 'center', alignContent: 'center', alignSelf: 'center', marginLeft: -60, fontFamily: 'Poppins-Medium', color: '#f35353' }}>My Cart</Text>
            </View>
            {isLoading === true ? <Text>Loading...</Text> :
                <View
                    style={{ flex: 1, padding: 0, marginTop: 1, }} >
                    <View style={{ flexGrow: 1, marginTop: 2, }}>
                        <FlatList
                            style={{ marginTop: 2, }}
                            ListEmptyComponent={<View style={{ marginTop: Dimensions.get('screen').width / 3, alignItems: 'center' }}>
                                <Image style={{ width: 350, height: 350, resizeMode: 'contain' }} source={require('../../assets/pngwing.png')} />
                            </View>}
                            data={DataCart}
                            keyExtractor={(item, index) => item?.id?.toString() || index.toString()}
                            renderItem={({ item }) => renderItemsCard(item)}
                            ListFooterComponent={() => <>
                                <View style={{ display: DataCart.length === 0 ? 'none' : 'flex', padding: 15, backgroundColor: '#000000', zIndex: 9999, elevation: 5, marginTop: 10 }}>
                                    <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#ffffff', borderRadius: 50, marginBottom: 15 }}>
                                        <TextInput style={{ flex: 1, marginLeft: 20, fontSize: 16 }} placeholder='Enter Coupon' placeholderTextColor={'#b4b4b4'} />
                                        <TouchableOpacity style={{ padding: 5, backgroundColor: '#000000', borderRadius: 50, marginLeft: 10, marginRight: 10, }}>
                                            <Text style={{ paddingVertical: 5, paddingHorizontal: 25, color: '#ffffff', fontWeight: 'bold' }}>Apply</Text>
                                        </TouchableOpacity>
                                    </View>
                                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
                                        <Text style={{ fontWeight: 'bold', flex: 1, color: '#ffffff', fontFamily: 'Poppins-Medium' }}>Item's</Text>
                                        <Text style={{ color: '#ffffff', fontWeight: 'bold' }}>x{DataCart.length}</Text>
                                    </View>
                                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
                                        <Text style={{ fontWeight: 'bold', flex: 1, color: '#ffffff', fontFamily: 'Poppins-Medium' }}>Total Amount</Text>
                                        <Text style={{ color: '#ffffff', fontWeight: 'bold', fontFamily: 'Poppins-Medium' }}>₹ {TotalPrice}</Text>
                                    </View>
                                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                        <Text style={{ fontWeight: 'bold', flex: 1, color: '#ffffff', fontFamily: 'Poppins-Medium' }}>Delivey Charges</Text>
                                        <Text style={{ color: '#ffffff', fontWeight: 'bold', fontFamily: 'Poppins-Medium' }}>₹ {DeliveryCharge}</Text>
                                    </View>
                                    <View style={{ display: DeliveryAddress === '' ? 'none' : 'flex', marginTop: 5 }}>
                                        <Text style={{ fontSize: 10, color: '#fff', fontFamily: 'Poppins-Medium' }}>Delivey Address : {DeliveryAddress}</Text>
                                    </View>
                                    <View style={{ width: '100%', height: 1, backgroundColor: '#b4b4b4', marginVertical: 10 }} />
                                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 15 }}>
                                        <Text style={{ fontWeight: 'bold', flex: 1, color: '#ffffff', fontSize: 22, fontWeight: 'bold', fontFamily: 'Poppins-Medium' }}>Total Amount</Text>
                                        <Text style={{ color: '#ffffff', fontSize: 22, fontWeight: 'bold', fontFamily: 'Poppins-Medium' }}>₹ {TotalPrice + DeliveryCharge}</Text>
                                    </View>
                                    <TouchableOpacity onPress={() => CheckAddressAvailable()} hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }} style={{ paddingVertical: 18, backgroundColor: '#3b8132', borderRadius: 6, paddingHorizontal: 15, elevation: 5 }}>
                                        <Text style={{ color: '#ffffff', fontWeight: 'bold', textTransform: 'uppercase', textAlign: 'center', fontFamily: 'Poppins-Medium' }}>Proceed To Pay {PaymentMode ? '- ' + PaymentMode : ''}</Text>
                                    </TouchableOpacity>
                                </View>
                            </>}
                            showsVerticalScrollIndicator={false}
                        />
                    </View>
                </View>
            }
            <BottomSheet
                hasDraggableIcon
                radius={20}
                ref={bottomSheet}
                height={450} >
                <View style={{ padding: 15, alignSelf: 'center', alignItems: 'center', width: '100%' }}>
                    <TouchableOpacity style={{ paddingVertical: 16, paddingHorizontal: 15, backgroundColor: '#000000', borderRadius: 5, width: '100%' }} onPress={() => GoToNewAddress()} >
                        <Text style={{ color: '#ffffff', fontWeight: 'bold', textAlign: 'center', textTransform: 'uppercase' }}>Add New Address</Text>
                    </TouchableOpacity>
                    <View style={{ width: '100%', height: 1, backgroundColor: '#b4b4b4', marginVertical: 1 }} />
                    <View>
                        <FlatList
                            style={{ flex: 1, width: Dimensions.get('screen').width - 10, marginHorizontal: 10 }}
                            data={AddressData}
                            keyExtractor={(item, index) => item?.id?.toString() || index.toString()}
                            renderItem={({ item }) => renderAddressCard(item)}
                            showsVerticalScrollIndicator={false}
                            ListEmptyComponent={
                                <View style={{ padding: 20, alignItems: 'center' }}>
                                    <Text style={{ color: '#666', fontSize: 14 }}>No addresses found</Text>
                                </View>
                            }
                        />
                    </View>
                </View>
            </BottomSheet>
            <BottomSheet
                hasDraggableIcon
                radius={20}
                ref={bottomPaymnetTypeSheet}
                height={450} >
                <View style={{ padding: 15, alignSelf: 'center', alignItems: 'center', width: '90%' }}>
                    <Text>Payment Mode</Text>
                    <View style={{ width: '100%', height: 1, backgroundColor: '#b4b4b4', marginVertical: 1 }} />
                    <View style={{ flexDirection: 'row', alignItems: 'center', margin: 10 }}>
                        <TouchableOpacity onPress={() => updatePaymentMode('COD')} style={{ flex: 1, backgroundColor: '#000000', borderRadius: 5, width: '100%', marginRight: 10, padding: 10 }}>
                            <Text style={{ padding: 5, color: '#fff', fontWeight: 'bold', textAlign: 'center' }}>COD</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => updatePaymentMode('ONLINE')} style={{ flex: 1, backgroundColor: '#000000', borderRadius: 5, width: '100%', padding: 10 }}>
                            <Text style={{ padding: 5, color: '#fff', fontWeight: 'bold', textAlign: 'center' }}>ONLINE</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </BottomSheet>
        </ImageBackground>
    )
}

export default CartScreenFood