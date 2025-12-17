import React, { useRef } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/Ionicons'; // For icons in bottom tabs
import theme from '../theme';
import { useAppStrings } from '../hooks/useAppStrings';

// import database from '@react-native-firebase/database';
import HomeScreen from '../screens/HomeScreen';
import DetailsScreen from '../screens/DetailsScreen';
import LoginScreen from '../screens/LoginScreen';
import RegistrationScreen from '../screens/RegisterScreen';
import ProfileScreen from '../screens/ProfileScreen/ProfileScreen';

// inner pages
import UpdateProfileScreen from '../screens/UpdateProfileScreen';
import BookingHistoryScreen from '../screens/BookingHistoryScreen';
import NotificationSettingsScreen from '../screens/NotificationSettingsScreen';
import AppSettingsScreen from '../screens/AppSettingsScreen';
import BookingAcceptScreen from '../screens/BookingScreen';
import RideScreen from '../screens/RideScreen';
import SplashScreen from '../screens/SplashScreen/SplashScreen';
import PermissionScreenMain from '../screens/PermissionScreen';
import RegisterMobileScreen from '../screens/RegisterMobileScreen';
import DeliveryTabScreen from '../tabs/DeliveyTabScreen';
import DiningTabScreen from '../tabs/DiningTabScreen';
import ReviewTabScreen from '../tabs/ReviewTabScreen';
import CategoryDetailsScreen from '../screens/CategoryDetailsScreen';
import RegisterEmailScreen from '../screens/RegisterEmailScreen';
import CartScreenFood from '../screens/CartScreen';
import { createDrawerNavigator } from '@react-navigation/drawer';
import AddressChangeScreen from '../screens/AddressChangeScreen';
import SearchProductScreen from '../screens/SearchProductScreen';
import OffersScreen from '../screens/OffersScreen';
import RestaurantDetailScreen from '../screens/RestaurantDetailScreen';
import RestaurantProfileDetailsScreen from '../screens/PaymentSettingsScreen';
import TrackOrderScreen from '../screens/TrackOrderScreen/TrackOrderScreen';
import OrderStatusScreen from '../screens/OrderStatusScreen';
import AddCategoryScreen from '../screens/AddCategoryScreen';
import AddFoodItemScreen from '../screens/AddFoodItemScreen';
import RestaurantProfileFormScreen from '../screens/RestaurantProfileFormScreen';
import TrackDriverScreen from '../screens/TrackDriverScreen/TrackDriverScreen';
// Restaurant screens
import RestaurantHomeScreen from '../screens/RestaurantHomeScreen';
import RecentOrdersScreen from '../screens/RecentOrdersScreen';
import MyMenuScreen from '../screens/MyMenuScreen';
import RestaurantProfileScreen from '../screens/RestaurantProfileScreen';
import NotificationsScreen from '../screens/NotificationsScreen';

// Create a stack navigator
const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();
const Drawer = createDrawerNavigator();

const Navigation = () => {
    // Use a navigation ref
    const navigationRef = useRef(null);
    const { getString } = useAppStrings();

    const linking = {
        prefixes: ['https://cravess.createdinam.com', 'cravess://'],
        config: {
            screens: {
                Home: 'home',
                BookingHistoryScreen: 'order/:orderId',
                ProfileScreen: 'user/:id',
                RestaurantProfileDetailsScreen: 'restaurant/:id',
            },
        },
    };

    // Log screen views to Firebase Database
    // const logScreenToDatabase = (screenName) => {}
    // const timestamp = new Date().toISOString();

    //     database()
    //         .ref('/screen-analytics')
    //         .push({
    //             screen: screenName,
    //             timestamp,
    //         })
    //         .then(() => console.log('Screen view saved to Firebase Database!'))
    //         .catch((error) => console.error('Error saving screen view:', error));
    // };

    // Define the bottom tab navigator

    const BottomTabNavigator = () => (
        <Tab.Navigator
            initialRouteName="RestaurantHome"
            screenOptions={({ route }) => ({
                tabBarIcon: ({ color, size, focused }) => {
                    let iconName;
                    if (route.name === 'RestaurantHome') {
                        iconName = focused ? 'home' : 'home-outline';
                    } else if (route.name === 'RecentOrders') {
                        iconName = focused ? 'receipt' : 'receipt-outline';
                    } else if (route.name === 'MyMenu') {
                        iconName = focused ? 'restaurant' : 'restaurant-outline';
                    } else if (route.name === 'RestaurantProfile') {
                        iconName = focused ? 'person' : 'person-outline';
                    }
                    return <Icon name={iconName} size={size} color={color} />;
                },
                tabBarActiveTintColor: theme.color.primary.main,
                tabBarInactiveTintColor: theme.color.text.tertiary,
                headerShown: false,
                tabBarStyle: {
                    backgroundColor: theme.color.primary.white,
                    borderTopWidth: 1,
                    borderTopColor: theme.color.other.border,
                    paddingBottom: 5,
                    paddingTop: 5,
                    height: 60,
                },
                tabBarLabelStyle: {
                    fontSize: 12,
                    fontWeight: '500',
                },
            })}
        >
            <Tab.Screen 
                name="RestaurantHome" 
                component={NotificationSettingsScreen} 
                options={{ title: getString('navigation.home') }} 
            />
            <Tab.Screen 
                name="RecentOrders" 
                component={RecentOrdersScreen} 
                options={{ title: getString('navigation.orders') }} 
            />
            <Tab.Screen 
                name="MyMenu" 
                component={MyMenuScreen} 
                options={{ title: getString('navigation.menu') }} 
            />
            <Tab.Screen 
                name="RestaurantProfile" 
                component={RestaurantProfileScreen} 
                options={{ title: getString('navigation.profile') }} 
            />
        </Tab.Navigator>
    );

    function MyDrawer() {
        return (
            <Drawer.Navigator>
                <Drawer.Screen name="Home" component={RestaurantDetailScreen} />
                <Drawer.Screen name="Profile" component={ProfileScreen} />
            </Drawer.Navigator>
        );
    }

    return (
        <NavigationContainer
            linking={linking}
            ref={navigationRef} // Pass the navigationRef here
            onReady={() => {
                const currentRoute = navigationRef.current?.getCurrentRoute()?.name;
                if (currentRoute) {
                    // logScreenToDatabase(currentRoute);
                }
            }}
            onStateChange={() => {
                const currentRoute = navigationRef.current?.getCurrentRoute()?.name;
                if (currentRoute) {
                    // logScreenToDatabase(currentRoute);
                }
            }}
        >
            <Stack.Navigator
                initialRouteName="SplashScreen"
                screenOptions={{ headerShown: false, }} >
                <Stack.Screen name="SplashScreen" component={SplashScreen} options={{ headerShown: false }} />
                {/* Login and Registration Screens */}
                <Stack.Screen name="OTPScrenes" component={LoginScreen} />
                <Stack.Screen name="RegisterEmailScreen" component={RegisterEmailScreen} />
                <Stack.Screen name="RegisterMobileScreen" component={RegisterMobileScreen} />
                <Stack.Screen name="RegistrationScreen" component={RegistrationScreen} />
                {/* Bottom Tabs */}
                {/* <Stack.Screen name="HomeScreens" component={BottomTabNavigator} /> */}
                {/* Details Screen */}
                <Stack.Screen name="UpdateProfileScreen" component={UpdateProfileScreen} />
                <Stack.Screen name="DetailsScreen" component={DetailsScreen} />
                <Stack.Screen name="BookingHistoryScreen" component={BookingHistoryScreen} />
                <Stack.Screen name="RestaurantDetailScreen" component={RestaurantDetailScreen} />
                <Stack.Screen name="RestaurantProfileDetailsScreen" component={RestaurantProfileDetailsScreen} />
                <Stack.Screen name="HomeScreen" component={BottomTabNavigator} />
                <Stack.Screen name="ProfileScreen" component={ProfileScreen} />
                <Stack.Screen name="AppSettingsScreen" component={AppSettingsScreen} />
                <Stack.Screen name="BookingAcceptScreen" component={BookingAcceptScreen} />
                <Stack.Screen name="RideScreen" component={RideScreen} />
                <Stack.Screen name='PermissionScreenMain' component={PermissionScreenMain} />
                <Stack.Screen name="CategoryDetailsScreen" component={CategoryDetailsScreen} />
                <Stack.Screen name="DeliveryTabScreen" component={DeliveryTabScreen} />
                <Stack.Screen name="DiningTabScreen" component={DiningTabScreen} />
                <Stack.Screen name="CartScreenFood" component={CartScreenFood} />
                <Stack.Screen name="ReviewTabScreen" component={ReviewTabScreen} />
                <Stack.Screen name="SearchProductScreen" component={SearchProductScreen} />
                <Stack.Screen name="AddressChangeScreen" component={AddressChangeScreen} />
                <Stack.Screen name="TrackOrderScreen" component={TrackOrderScreen} />
                <Stack.Screen name="OffersScreen" component={OffersScreen} />
                <Stack.Screen name="OrderStatusScreen" component={OrderStatusScreen} />
                <Stack.Screen name="AddCategoryScreen" component={AddCategoryScreen} />
                <Stack.Screen name="AddFoodItemScreen" component={AddFoodItemScreen} />
                <Stack.Screen name="RestaurantProfileFormScreen" component={RestaurantProfileFormScreen} />
                <Stack.Screen name="TrackDriverScreen" component={TrackDriverScreen} />
                {/* Restaurant Tab Screens - accessible from stack */}
                <Stack.Screen name="RestaurantHomeScreen" component={RestaurantHomeScreen} />
                <Stack.Screen name="RecentOrdersScreen" component={RecentOrdersScreen} />
                <Stack.Screen name="MyMenuScreen" component={MyMenuScreen} />
                <Stack.Screen name="RestaurantProfileScreen" component={RestaurantProfileScreen} />
                <Stack.Screen name="NotificationsScreen" component={NotificationsScreen} />
            </Stack.Navigator>
        </NavigationContainer>
    );
};
// 
export default Navigation;
