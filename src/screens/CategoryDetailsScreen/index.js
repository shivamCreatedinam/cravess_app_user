import React from "react";
import { Text, View, useWindowDimensions, Image, SafeAreaView, StyleSheet, Dimensions, TouchableOpacity, FlatList, ImageBackground, ScrollView, Pressable } from 'react-native';
import { useRoute, useNavigation } from "@react-navigation/native";
import { TabView, SceneMap, TabBar } from 'react-native-tab-view';
import { increment, decrement } from '../../features/cartSlice';
import { FlatListSlider } from 'react-native-flatlist-slider';
import DeliveryTabScreen from "../../tabs/DeliveyTabScreen";
import ReviewTabScreen from '../../tabs/ReviewTabScreen';
import DiningTabScreen from "../../tabs/DiningTabScreen";
import { useSelector, useDispatch } from 'react-redux';
import theme from "../../theme";

const renderScene = SceneMap({
    Delivery: DeliveryTabScreen,
    Review: ReviewTabScreen,
    Dining: DiningTabScreen,
});

const CategoryDetailsScreen = () => {

    const route = useRoute();
    const navigation = useNavigation();
    const layout = useWindowDimensions();

    const dispatch = useDispatch();

    const [index, setIndex] = React.useState(0);

    const [routes] = React.useState([
        { key: 'Delivery', title: 'Delivery' },
        { key: 'Review', title: 'Review' },
        { key: 'Dining', title: 'Dining' },
    ]);

    const [DataFoodCarousel, setFoodCarousel] = React.useState([{
        name: 'Chicken Burger',
        restaurent_name: 'Burger Club Restaurent',
        restaurent_address: '2nd Floor, 1st Cross, 1st Main, Sector 1, HSR Layout, Bangalore',
        isCart: true,
        isFav: false,
        image: require('../../assets/beef_burger.png'),
        desc: 'pizza',
        rating: '4.1',
        reviews: '320 Reviews',
        cost: '129.00',
        offierPrice: '99.00',
        deliveryTime: '25min',
    }, {
        name: 'Veggie Burger',
        restaurent_name: 'Burger Club Restaurent',
        restaurent_address: '2nd Floor, 1st Cross, 1st Main, Sector 1, HSR Layout, Bangalore',
        isCart: true,
        isFav: false,
        image: require('../../assets/veggie_burger.png'),
        desc: 'pizza',
        rating: '2.3',
        reviews: '120 Reviews',
        cost: '129.00',
        offierPrice: '59.00',
        deliveryTime: '25min',
    }, {
        name: 'Veggie Combo',
        restaurent_name: 'Burger Club Restaurent',
        restaurent_address: '2nd Floor, 1st Cross, 1st Main, Sector 1, HSR Layout, Bangalore',
        isCart: true,
        isFav: false,
        image: require('../../assets/burger_combo.png'),
        desc: 'pizza',
        rating: '4.3',
        reviews: '120 Reviews',
        cost: '119.00',
        offierPrice: '269.00',
        deliveryTime: '25min',
    }]);

    const [DataCarousel, setDataCarousel] = React.useState([{
        image: 'https://images.pexels.com/photos/1639557/pexels-photo-1639557.jpeg',
        desc: 'Silent Waters in the mountains in midst of Himilayas',
    }, {
        image: 'https://images.pexels.com/photos/2702674/pexels-photo-2702674.jpeg',
        desc: 'Silent Waters in the mountains in midst of Himilayas',
    }, {
        image: 'https://images.pexels.com/photos/3616956/pexels-photo-3616956.jpeg',
        desc: 'Silent Waters in the mountains in midst of Himilayas',
    }]);

    const renderTabBar = props => (
        <TabBar
            {...props}
            getLabelText={({ route }) => route.title}
            indicatorStyle={{ backgroundColor: theme.color.themeColorBackground }}
            style={{ backgroundColor: theme.color.primary.black, }}
            renderLabel={({ route, focused, color }) => (
                <Text style={{ color: theme.color.primary.black, margin: 8 }}>
                    {route.title}
                </Text>
            )}
        />
    );

    const _renderFoodItem = ({ item, index }: any) => {
        return (
            <TouchableOpacity
                onPress={() => navigation.navigate('CategoryDetailsScreen', item)}
                style={[styles.FoodSlide]}>
                <Image
                    style={[styles.CategoryItems, { width: 180, height: 180, resizeMode: "contain" }]}
                    source={item.image} />
                <View style={{ paddingHorizontal: 10 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <View style={{ flex: 1 }}>
                            <Text style={[styles.title, { lineHeight: 15, fontFamily: theme.fontFamily.poppinsBold }]}>{item.name}</Text>
                            <Text style={[styles.title, { fontSize: 10, lineHeight: 15 }]}>{item.restaurent_name}</Text>
                        </View>
                        <Text style={[styles.title, { fontFamily: theme.fontFamily.poppinsMedium, fontSize: 18, marginLeft: 10 }]}>₹{item.offierPrice}</Text>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <View style={{ flexDirection: 'row', alignContent: 'center', justifyContent: 'center' }}>
                            <Image
                                style={{ width: 15, height: 15, resizeMode: "contain", marginLeft: 5 }}
                                source={require('../../assets/star.png')} />
                            <Text style={[styles.title, { color: '#ffcc32', fontFamily: theme.fontFamily.poppinsMedium, fontSize: 12 }]}> {item.rating} </Text>
                            <Text style={[styles.title, { fontSize: 10 }]}>{`(${item.reviews})`}</Text>
                        </View>
                        <View style={{ flex: 1, alignContent: 'center', flexDirection: 'row', alignSelf: 'center', alignItems: 'center', marginBottom: 10 }}>
                            <TouchableOpacity>
                                <Image
                                    source={require('../../assets/shopping-bag.png')}
                                    style={{ height: 20, width: 20, resizeMode: 'contain', marginHorizontal: 5, marginLeft: 5 }}
                                />
                            </TouchableOpacity>
                            <TouchableOpacity>
                                <Image
                                    source={require('../../assets/favorite.png')}
                                    style={{ height: 20, width: 20, resizeMode: 'contain', marginHorizontal: 5 }}
                                />
                            </TouchableOpacity>
                            <TouchableOpacity>
                                <Image
                                    source={require('../../assets/share.png')}
                                    style={{ height: 20, width: 20, resizeMode: 'contain', marginHorizontal: 5 }}
                                />
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </TouchableOpacity>
        );
    };

    const handleLogin = () => {
        // const authToken = 'sample-auth-token';
        // dispatch(setToken(authToken));
        console.log(`token saved`);
        dispatch(decrement(2));
    };

    // 9821907879
    return (
        <SafeAreaView style={{ padding: 0, flex: 1 }}>
            <ImageBackground source={require('../../assets/background_app.png')} style={{ flex: 1, }}>
                <ScrollView style={{ flex: 1 }}>
                    <View style={{ flex: 1 }}>
                        <View style={{ backgroundColor: theme.color.primary.black, flex: 1 }}>
                            <FlatListSlider
                                data={DataCarousel}
                                imageKey={'image'}
                                height={Dimensions.get('screen').width}
                                timer={6000}
                                onPress={item => handleLogin()}
                                contentContainerStyle={{ paddingHorizontal: 0, }}
                                indicatorContainerStyle={{ position: 'absolute', bottom: 5 }}
                                indicatorActiveColor={'#ba472d'}
                                indicatorInActiveColor={'#ffffff'}
                                indicatorActiveWidth={40}
                                animation={true}
                            />
                        </View>
                        <View style={{ padding: 10, backgroundColor: theme.color.primary.white, borderBottomLeftRadius: 50, borderBottomRightRadius: 50 }}>
                            <View style={{ paddingHorizontal: 0 }}>
                                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                    <Text adjustsFontSizeToFit={true} style={{ color: '#000000', fontFamily: theme.fontFamily.poppinsMedium, fontSize: 25,flex:1 }}>{route?.params?.name}</Text>
                                    <Pressable>
                                        <Text adjustsFontSizeToFit={true} style={{ color: '#f06262', fontFamily: theme.fontFamily.poppinsMedium, fontSize: 12, lineHeight: 20 }}>View All</Text>
                                    </Pressable>
                                </View>
                                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                    <Image
                                        style={{ width: 20, height: 20, resizeMode: "contain", marginRight: 6, marginTop: -8 }}
                                        source={require('../../assets/location.png')} />
                                    <Text adjustsFontSizeToFit={true} style={{ color: '#000000', fontFamily: theme.fontFamily.poppinsMedium, fontSize: 15, lineHeight: 20 }}>{route?.params?.restaurent_name}</Text>
                                </View>
                            </View>
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <Image
                                    style={{ width: 20, height: 20, resizeMode: "contain", marginLeft: 5, marginRight: 6, marginTop: -8 }}
                                    source={require('../../assets/star.png')} />
                                <Text adjustsFontSizeToFit={true} style={[styles.title, { color: '#ffcc32', fontFamily: theme.fontFamily.poppinsMedium, fontSize: 18 }]}>{route?.params?.rating}</Text>
                                <Text adjustsFontSizeToFit={true} style={{ color: '#6d6d6d', fontFamily: theme.fontFamily.poppinsMedium, fontSize: 18 }}>{`(${route?.params?.reviews})`}</Text>
                            </View>
                            <View style={{ marginTop: 10 }}>
                                <Text adjustsFontSizeToFit={true} style={[styles.title, { color: '#6d6d6d', fontFamily: theme.fontFamily.poppinsMedium, fontSize: 16 }]}>Discription</Text>
                                <Text style={{ textAlign: 'justify', paddingBottom: 20 }}>{route?.params?.desc}</Text>
                            </View>
                        </View>
                        <View style={{ backgroundColor: '#4AB425', position: 'absolute', right: 0, top: 20, padding: 5, alignItems: 'center', borderTopLeftRadius: 10, borderBottomLeftRadius: 10 }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <Text style={{ fontFamily: theme.fontFamily.poppinsRegular, fontSize: 14, color: theme.color.primary.white }}>{route?.params?.reviews}</Text>
                                <Image style={{ width: 15, height: 15, resizeMode: 'contain', marginLeft: 5, top: -2, tintColor: theme.color.primary.white }} source={require('../../assets/star_icon.png')} />
                            </View>
                            <Text style={{ fontFamily: theme.fontFamily.poppinsRegular, color: theme.color.primary.white, fontSize: 12, }}>DELIVERY</Text>
                        </View>
                        <View style={{ backgroundColor: '#4AB425', position: 'absolute', right: 0, top: 100, padding: 5, alignItems: 'center', borderTopLeftRadius: 10, borderBottomLeftRadius: 10 }}>
                            <Text style={{ fontFamily: theme.fontFamily.poppinsRegular, color: theme.color.primary.white, fontSize: 12, textAlign: 'left' }}>3</Text>
                            <Text style={{ fontFamily: theme.fontFamily.poppinsRegular, color: theme.color.primary.white, fontSize: 12, }}>PHOTOS</Text>
                        </View>
                    </View>
                    <View style={{ padding: 10, marginTop: 20 }}>
                        <Text adjustsFontSizeToFit={true} style={{ color: '#000000', fontFamily: theme.fontFamily.poppinsSemiBold, fontSize: 20 }}>{'Todays Best Deal'}</Text>
                        <FlatList
                            horizontal={true}
                            data={DataFoodCarousel}
                            renderItem={_renderFoodItem}
                            keyExtractor={(item, index) => index.toString()}
                            showsHorizontalScrollIndicator={false}
                        />
                    </View>
                </ScrollView>
            </ImageBackground>
        </SafeAreaView>
    )
}

var styles = StyleSheet.create({
    tabBar: {
        paddingHorizontal: '5%',
        paddingVertical: '2%',
        alignItems: 'center',
        flex: 1,
    },
    tabBarActive: {
        borderRadius: 25,
        backgroundColor: theme.color.primary.main,
        justifyContent: 'center',
        flex: 1
    },
    tabBarInActive: {
        backgroundColor: theme.color.primary.main,
        justifyContent: 'center',
    },
    activeTabText: {
        color: theme.color.primary.white,
        fontFamily: theme.fontFamily.poppinsRegular,
        fontSize: 14,
        flex: 1
    },
    inActiveTabText: {
        color: theme.color.primary.white,
        fontFamily: theme.fontFamily.poppinsRegular,
        fontSize: 14,
    },
    buttonAcceptCenter: {
        flex: 1,
        alignSelf: 'center',
        alignContent: 'center',
        alignItems: 'center',
        backgroundColor: 'green',
        paddingVertical: 16,
        margin: 10,
        borderRadius: 10
    }, buttonRejectCenter: {
        flex: 1,
        alignSelf: 'center',
        alignContent: 'center',
        alignItems: 'center',
        backgroundColor: 'black',
        paddingVertical: 16,
        margin: 10,
        borderRadius: 10
    },
    buttonText: {
        textAlign: 'center',
        fontWeight: '600'
    },
    container: {
        flex: 1,
        padding: 0,
        backgroundColor: '#f9f9f9',
    },
    header: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    bookingItem: {
        padding: 15,
        backgroundColor: '#fff',
        marginBottom: 10,
        borderRadius: 8,
        elevation: 2,
    },
    text: {
        fontSize: 16,
    },
    cardContainer: {
        margin: 16,
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 10,
        borderBottomLeftRadius: 0,
        borderBottomRightRadius: 0,
        padding: 16,
        elevation: 4,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 5,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    passengers: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#333',
        marginRight: 8,
    },
    passengerLabel: {
        fontSize: 14,
        color: '#777',
    },
    profileImage: {
        width: 40,
        height: 40,
        borderRadius: 20,
        marginLeft: 'auto',
        marginRight: 8,
    },
    name: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
    },
    locationContainer: {
        marginBottom: 16,
    },
    location: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    dotBlue: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#007bff',
        marginRight: 8,
    },
    dotRed: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#ff0000',
        marginRight: 8,
    },
    label: {
        fontSize: 12,
        color: '#777',
    },
    address: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#333',
    },
    price: {
        fontWeight: '800',
        fontSize: 18,
        color: '#333',
        marginLeft: 10,
        textAlign: 'center'
    },
    footer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    buttonContainer: {
        flexDirection: 'row',
        alignItems: 'center'
    },
    fill: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: '#007bff',
        borderRadius: 8,
    },
    button: {
        ...StyleSheet.absoluteFillObject,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 8,
    },
    buttonText: {
        color: '#fff',
        fontWeight: 'bold',
    },
    timer: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyText: {
        fontSize: 13,
        color: '#000',
        fontWeight: '200',
        marginTop: 10,
    },
    listContent: {
        flexGrow: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20, // Optional, for some space around
    },
    CategoryItems: {
        height: 60,
        width: 60,
        resizeMode: 'contain',
        alignSelf: 'center',
    },
    slide: {
        height: 110,
        width: 110,
        backgroundColor: '#fff',
        padding: 0,
        borderRadius: 28,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#636363',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
        margin: 10
    }, FoodSlide: {
        backgroundColor: '#fff',
        padding: 0,
        borderRadius: 28,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#636363',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
        margin: 10
    }, title: {
        fontFamily: theme.fontFamily.poppinsMedium,
        textTransform: 'capitalize'
    }
});

export default CategoryDetailsScreen;