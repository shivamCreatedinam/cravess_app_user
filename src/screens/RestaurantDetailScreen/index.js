import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    ImageBackground,
    Dimensions,
    Image,
    Alert
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import Toast from 'react-native-toast-message';
import AxiosClient from '../../apis/clients';
import { Card, Button, ActivityIndicator } from 'react-native-paper';
import { useSelector } from 'react-redux';

const { width } = Dimensions.get('window');

export default function RestaurantDetailScreen() {

    const route = useRoute();
    const navigation = useNavigation();
    const restaurant = route.params?.item;
    const authData = useSelector((state) => state?.userInfo?.user);
    const userId = authData?.id || 1; // Fallback to 1 if user not found
    const [loadingItems, setLoadingItems] = useState({});
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const res = await AxiosClient.get(`menu/categories/${restaurant.id}`);
                const categoryList = res.data.data;
                setCategories(categoryList);
                setSelectedCategory(categoryList[0]); // Select first category
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchCategories();
    }, [restaurant.id]);

    const renderCategoryItem = ({ item }) => (
        <TouchableOpacity
            style={[
                styles.categoryItem,
                selectedCategory?.id === item.id && styles.categoryItemActive,
            ]}
            onPress={() => setSelectedCategory(item)}
        >
            <Image
                source={
                    restaurant.logo_image?.trim()
                        ? { uri: restaurant.logo_image }
                        : require('../../assets/bibimbap.png')
                }
                style={styles.categoryImage}
            />
            <Text style={styles.categoryText}>{item.name}</Text>
        </TouchableOpacity>
    );


    const addToCart = async (item) => {
        try {
            setLoadingItems(prev => ({ ...prev, [item.id]: true }));

            const response = await AxiosClient.post('menu/cart/add', {
                user_id: userId,
                food_item_id: item.id,
                quantity: item.quantity || 1,
            });

            const { status, message, data } = response.data;

            if (status) {
                Toast.show({
                    type: 'success',
                    text1: 'Item Added',
                    text2: message || 'Successfully added to cart',
                });
            } else {
                Toast.show({
                    type: 'error',
                    text1: 'Failed',
                    text2: message || 'Unable to update cart',
                });
            }
        } catch (error) {
            console.error('Add to cart error:', error);
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: 'Something went wrong.',
            });
        } finally {
            setLoadingItems(prev => ({ ...prev, [item.id]: false }));
        }
    };

    const renderFoodItem = ({ item }) => {

        const itemLoading = loadingItems[item.id] || false;

        return (<Card style={styles.foodCard} onPress={() => console.log('Item:', item.name)}>
            <Card.Cover source={{ uri: item.image }} />
            <Card.Title titleStyle={styles.cardTitle} title={item.name} subtitle={`₹${item.price}`} />
            <Card.Content>
                <Text numberOfLines={2}>{item.description}</Text>
            </Card.Content>
            <Card.Actions>
                <TouchableOpacity
                    style={[styles.button, itemLoading && styles.buttonDisabled]}
                    onPress={addToCart.bind(this, item)}
                    disabled={itemLoading}
                >
                    {itemLoading ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Image source={require('../../assets/add-to-basket.png')} style={styles.buttonImage} />
                    )}
                </TouchableOpacity>
            </Card.Actions>
        </Card>)
    };

    return (
        <ImageBackground
            source={require('../../assets/background_app.png')}
            style={styles.container}
        >
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Text style={styles.backText}>◀</Text>
                </TouchableOpacity>
                <Text style={styles.title}>{restaurant.restaurant_name}</Text>
            </View>

            {/* Restaurant Address */}
            <View style={styles.restaurantCard}>
                <Image
                    source={{
                        uri: restaurant.logo_image?.trim()
                            ? restaurant.logo_image
                            : 'https://dummyimage.com/100x100/cccccc/ffffff.png&text=Logo',
                    }}
                    style={styles.logo}
                />
                <View style={styles.infoSection}>
                    <Text style={styles.infoText}>{restaurant.address}</Text>
                    <Text style={styles.ratingText}>⭐ {restaurant.average_rating} ({restaurant.ratings_count} ratings)</Text>
                    <Text style={styles.timeText}>Open: {restaurant.open_time} - {restaurant.close_time}</Text>
                </View>
            </View>

            {/* Content Layout */}
            <View style={styles.body}>
                {/* Left Side - Categories */}
                <View style={styles.leftPanel}>
                    <FlatList
                        data={categories}
                        keyExtractor={(item) => item.id.toString()}
                        renderItem={renderCategoryItem}
                        showsVerticalScrollIndicator={false}
                    />
                </View>

                {/* Right Side - Food Items */}
                <View style={styles.rightPanel}>
                    <FlatList
                        data={selectedCategory?.food_items || []}
                        keyExtractor={(item) => item.id.toString()}
                        renderItem={renderFoodItem}
                        numColumns={2}
                        showsVerticalScrollIndicator={false}
                        ListEmptyComponent={<Text style={styles.emptyText}>No food items found</Text>}
                    />
                </View>
            </View>
        </ImageBackground>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: {
        flexDirection: 'row',
        padding: 15,
        alignItems: 'center',
    },
    backText: {
        fontSize: 20,
        color: '#f06262',
    },
    title: {
        fontSize: 20,
        marginLeft: 10,
        fontWeight: 'bold',
        color: '#000',
    },
    addressContainer: {
        paddingHorizontal: 15,
        paddingVertical: 5,
        backgroundColor: '#fff',
    },
    addressText: {
        color: '#444',
        fontSize: 14,
    },
    body: {
        flexDirection: 'row',
        flex: 1,
    },
    leftPanel: {
        width: 100,
        backgroundColor: '#ffffff2d',
        borderRightWidth: 1,
        borderColor: '#eee',
        paddingVertical: 10,
        marginLeft: 10,
    },
    rightPanel: {
        flex: 1,
        padding: 10,
    },
    categoryItem: {
        paddingVertical: 12,
        paddingHorizontal: 8,
        borderRadius: 8,
        marginVertical: 5,
        backgroundColor: '#f2f2f2',
        alignItems: 'center',
        borderColor: '#f0626261',
        borderWidth: 2,
        borderRadius: 8,
    },
    categoryItemActive: {
        backgroundColor: '#ffffffff',
        borderColor: '#f06262',
        borderWidth: 2,
        borderRadius: 8,
        elevation: 5,
    },
    categoryImage: {
        height: 40,
        width: 40,
        resizeMode: 'contain',
    },
    categoryText: {
        color: '#000',
        fontSize: 14,
        textAlign: 'center',
        fontFamily: 'Poppins-Medium',
    },
    foodCard: {
        flex: 1,
        margin: 5,
        borderRadius: 12,
        backgroundColor: '#fff',
        elevation: 2,
        width: (width - 130) / 2, // account for left panel + padding
    },
    emptyText: {
        padding: 20,
        textAlign: 'center',
        color: '#999',
    },
    restaurantCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        backgroundColor: '#ffffffff',
        borderBottomWidth: 1,
        borderColor: '#eee',
        margin: 10,
        borderRadius: 10
    },
    logo: {
        width: 60,
        height: 60,
        borderRadius: 8,
        marginRight: 12,
    },
    infoSection: {
        flex: 1,
    },
    infoText: {
        fontSize: 14,
        color: '#333',
    },
    ratingText: {
        marginTop: 4,
        fontSize: 14,
        color: '#777',
    },
    timeText: {
        marginTop: 2,
        fontSize: 12,
        color: '#999',
    },
    button: {
        backgroundColor: '#f06262',
        paddingVertical: 6,
        paddingHorizontal: 10,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 3,
        marginVertical: 5,
        width: '100%',
        alignSelf: 'center',
    },
    buttonDisabled: {
        backgroundColor: '#ccc',
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    buttonImage: {
        width: 20,
        height: 20,
        resizeMode: 'contain'
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#000',
        fontFamily: 'Poppins-Medium'
    }
});
