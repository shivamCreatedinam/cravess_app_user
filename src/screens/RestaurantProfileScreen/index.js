import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Image,
  Switch,
  ActivityIndicator,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import AxiosClient from '../../apis/clients';
import theme from '../../theme';
import { useAppStrings } from '../../hooks/useAppStrings';
import logout from '../../utils/logout';

const RestaurantProfileScreen = () => {
  const navigation = useNavigation();
  const user = useSelector((state) => state?.userInfo?.user);
  const { getString } = useAppStrings();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [onlineStatus, setOnlineStatus] = useState(true);
  const [loading, setLoading] = useState(true);
  const [restaurantInfo, setRestaurantInfo] = useState({
    name: 'Cravess Restaurant',
    email: user?.email || '',
    phone: user?.mobile || '',
    address: '',
    cuisine: '',
    rating: 4.8,
    totalReviews: 234,
    image: 'https://images.pexels.com/photos/1267320/pexels-photo-1267320.jpeg',
    restaurant_name: '',
    description: '',
    logo_image: '',
    banner_image: '',
    is_open: true,
  });

  const [stats, setStats] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    averageRating: 4.8,
    responseTime: '5 min',
  });
  const [loggingOut, setLoggingOut] = useState(false);

  // Fetch restaurant profile
  const fetchRestaurantProfile = async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await AxiosClient.get(`menu/getProfileByRestaurantId/${user.id}`);
      const profileData = response.data?.data;
      
      if (profileData) {
        setRestaurantInfo({
          name: profileData.restaurant_name || 'Cravess Restaurant',
          email: user?.email || '',
          phone: user?.mobile || '',
          address: profileData.address || '',
          cuisine: profileData.description || '',
          rating: 4.8,
          totalReviews: 234,
          image: profileData.logo_image || profileData.banner_image || 'https://images.pexels.com/photos/1267320/pexels-photo-1267320.jpeg',
          ...profileData,
        });
        setOnlineStatus(profileData.is_open !== false);
      }
    } catch (error) {
      console.error('Error fetching restaurant profile:', error);
      // Don't show alert if profile doesn't exist yet
    } finally {
      setLoading(false);
    }
  };

  // Update online status
  const updateOnlineStatus = async (status) => {
    try {
      setOnlineStatus(status);
      // You can add API call here to update is_open status
      // await AxiosClient.put(`menu/update-restaurant-profile/${user.id}`, { is_open: status });
    } catch (error) {
      console.error('Error updating online status:', error);
      Alert.alert('Error', 'Failed to update online status');
      setOnlineStatus(!status); // Revert on error
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchRestaurantProfile();
    }, [user?.id])
  );

  // Handle logout with confirmation
  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout? All your data will be cleared.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              setLoggingOut(true);
              await logout(navigation, 'SplashScreen');
            } catch (error) {
              console.error('Logout error:', error);
              Alert.alert('Error', 'Failed to logout. Please try again.');
              setLoggingOut(false);
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  const menuItems = [
    {
      id: '1',
      title: getString('profile.editProfile'),
      icon: 'person-outline',
      onPress: () => navigation.navigate('RestaurantProfileFormScreen', {
        mode: restaurantInfo.restaurant_name ? 'edit' : 'create',
        profileId: user?.id,
        userId: user?.id,
      }),
      showArrow: true,
    },
    {
      id: '2',
      title: getString('profile.restaurantSettings'),
      icon: 'settings-outline',
      onPress: () => navigation.navigate('AppSettingsScreen'),
      showArrow: true,
    },
    {
      id: '3',
      title: getString('profile.paymentSettings'),
      icon: 'card-outline',
      onPress: () => navigation.navigate('RestaurantProfileDetailsScreen'),
      showArrow: true,
    },
    {
      id: '4',
      title: getString('profile.orderHistory'),
      icon: 'receipt-outline',
      onPress: () => navigation.navigate('RecentOrders'),
      showArrow: true,
    },
    {
      id: '5',
      title: getString('profile.notifications'),
      icon: 'notifications-outline',
      onPress: () => navigation.navigate('NotificationSettingsScreen'),
      showArrow: true,
    },
    {
      id: '5.5',
      title: 'Restaurant QR Code',
      icon: 'qr-code-outline',
      onPress: () => navigation.navigate('RestaurantBarcodeScreen'),
      showArrow: true,
    },
    {
      id: '6',
      title: getString('profile.helpSupport'),
      icon: 'help-circle-outline',
      onPress: () => {},
      showArrow: true,
    },
    {
      id: '7',
      title: getString('profile.about'),
      icon: 'information-circle-outline',
      onPress: () => {},
      showArrow: true,
    },
    {
      id: '8',
      title: getString('profile.logout'),
      icon: 'log-out-outline',
      onPress: handleLogout,
      showArrow: false,
      danger: true,
    },
  ];

  const renderMenuItem = (item) => (
    <TouchableOpacity
      key={item.id}
      style={styles.menuItem}
      onPress={item.onPress}
    >
      <View style={styles.menuItemLeft}>
        <View style={[styles.iconContainer, item.danger && styles.iconContainerDanger]}>
          <Icon
            name={item.icon}
            size={22}
            color={item.danger ? theme.color.system.error : theme.color.text.primary}
          />
        </View>
        <Text style={[styles.menuItemText, item.danger && styles.menuItemTextDanger]}>
          {item.title}
        </Text>
      </View>
      {item.showArrow && (
        <Icon name="chevron-forward" size={20} color={theme.color.text.tertiary} />
      )}
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.color.primary.main} />
          <Text style={styles.loadingText}>{getString('common.loading')}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.color.primary.white} />
      {loggingOut && (
        <View style={styles.logoutOverlay}>
          <ActivityIndicator size="large" color={theme.color.primary.main} />
          <Text style={styles.logoutText}>Logging out...</Text>
        </View>
      )}
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <Image
            source={{ uri: restaurantInfo.image }}
            style={styles.profileImage}
            resizeMode="cover"
          />
          <View style={styles.profileInfo}>
            <Text style={styles.restaurantName}>{restaurantInfo.name}</Text>
            <View style={styles.ratingContainer}>
              <Icon name="star" size={16} color={theme.color.system.warningBright} />
              <Text style={styles.ratingText}>
                {restaurantInfo.rating} ({restaurantInfo.totalReviews} reviews)
              </Text>
            </View>
            <Text style={styles.cuisineText}>{restaurantInfo.cuisine}</Text>
            <View style={styles.addressContainer}>
              <Icon name="location-outline" size={14} color={theme.color.text.tertiary} />
              <Text style={styles.addressText} numberOfLines={1}>
                {restaurantInfo.address}
              </Text>
            </View>
          </View>
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => navigation.navigate('RestaurantProfileFormScreen')}
          >
            <Icon name="create-outline" size={20} color={theme.color.primary.main} />
          </TouchableOpacity>
        </View>

        {/* Online Status Toggle */}
        <View style={styles.statusCard}>
          <View style={styles.statusInfo}>
            <View style={styles.statusIndicator}>
              <View style={[styles.statusDot, onlineStatus && styles.statusDotOnline]} />
              <Text style={styles.statusText}>
                {onlineStatus ? getString('home.onlineStatus') : getString('home.offlineStatus')}
              </Text>
            </View>
          </View>
          <Switch
            value={onlineStatus}
            onValueChange={updateOnlineStatus}
            trackColor={{ false: theme.color.other.border, true: theme.color.accent.main }}
            thumbColor={theme.color.primary.white}
          />
        </View>

        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Icon name="receipt-outline" size={24} color={theme.color.primary.main} />
            <Text style={styles.statValue}>{stats.totalOrders}</Text>
            <Text style={styles.statLabel}>{getString('profile.totalOrders')}</Text>
          </View>
          <View style={styles.statCard}>
            <Icon name="cash-outline" size={24} color={theme.color.accent.main} />
            <Text style={styles.statValue}>${(stats.totalRevenue / 1000).toFixed(1)}K</Text>
            <Text style={styles.statLabel}>{getString('profile.totalRevenue')}</Text>
          </View>
          <View style={styles.statCard}>
            <Icon name="star-outline" size={24} color={theme.color.system.warningBright} />
            <Text style={styles.statValue}>{stats.averageRating}</Text>
            <Text style={styles.statLabel}>{getString('profile.avgRating')}</Text>
          </View>
        </View>

        {/* Contact Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{getString('profile.contactInformation')}</Text>
          <View style={styles.contactItem}>
            <Icon name="mail-outline" size={20} color={theme.color.text.secondary} />
            <Text style={styles.contactText}>{restaurantInfo.email}</Text>
          </View>
          <View style={styles.contactItem}>
            <Icon name="call-outline" size={20} color={theme.color.text.secondary} />
            <Text style={styles.contactText}>{restaurantInfo.phone}</Text>
          </View>
        </View>

        {/* Menu Items */}
        <View style={styles.section}>
          {menuItems.map(renderMenuItem)}
        </View>

        {/* App Version */}
        <View style={styles.versionContainer}>
          <Text style={styles.versionText}>Version 1.0.0</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.color.secondary.light,
  },
  scrollView: {
    flex: 1,
  },
  profileHeader: {
    backgroundColor: theme.color.primary.white,
    padding: 20,
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: theme.color.other.border,
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: theme.color.secondary.light,
  },
  profileInfo: {
    flex: 1,
    marginLeft: 16,
    justifyContent: 'center',
  },
  restaurantName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.color.text.primary,
    marginBottom: 4,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    gap: 4,
  },
  ratingText: {
    fontSize: 14,
    color: theme.color.text.secondary,
  },
  cuisineText: {
    fontSize: 13,
    color: theme.color.text.tertiary,
    marginBottom: 4,
  },
  addressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  addressText: {
    fontSize: 12,
    color: theme.color.text.tertiary,
    flex: 1,
  },
  editButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: theme.color.secondary.light,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'flex-start',
  },
  statusCard: {
    backgroundColor: theme.color.primary.white,
    margin: 20,
    marginBottom: 12,
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.color.other.border,
  },
  statusInfo: {
    flex: 1,
  },
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: theme.color.system.error,
  },
  statusDotOnline: {
    backgroundColor: theme.color.system.success,
  },
  statusText: {
    fontSize: 14,
    color: theme.color.text.primary,
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 20,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: theme.color.primary.white,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.color.other.border,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.color.text.primary,
    marginTop: 8,
  },
  statLabel: {
    fontSize: 11,
    color: theme.color.text.secondary,
    marginTop: 4,
    textAlign: 'center',
  },
  section: {
    backgroundColor: theme.color.primary.white,
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: theme.color.other.border,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.color.text.primary,
    padding: 16,
    paddingBottom: 12,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: theme.color.other.divider + '30',
  },
  contactText: {
    fontSize: 14,
    color: theme.color.text.primary,
    flex: 1,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: theme.color.other.divider + '30',
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.color.secondary.light,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainerDanger: {
    backgroundColor: theme.color.system.errorLight,
  },
  menuItemText: {
    fontSize: 16,
    color: theme.color.text.primary,
  },
  menuItemTextDanger: {
    color: theme.color.system.error,
  },
  versionContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  versionText: {
    fontSize: 12,
    color: theme.color.text.tertiary,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: theme.color.text.secondary,
  },
  logoutOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
  },
  logoutText: {
    marginTop: 12,
    fontSize: 16,
    color: theme.color.primary.white,
    fontWeight: '500',
  },
});

export default RestaurantProfileScreen;

