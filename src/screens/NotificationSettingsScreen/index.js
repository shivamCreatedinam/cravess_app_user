import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  Dimensions,
  StyleSheet,
  Image,
  Switch,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import Icon from 'react-native-vector-icons/Ionicons';
import AxiosClient from '../../apis/clients';
import theme from '../../theme';
import { useAppStrings } from '../../hooks/useAppStrings';
import useSocket from '../../hooks/useSocket';
import NewOrderPopup from '../../components/NewOrderPopup';

const screenWidth = Dimensions.get('screen').width;

export default function NotificationSettingsScreen() {
  const navigation = useNavigation();
  const authData = useSelector((state) => state?.userInfo?.user);
  const { getString } = useAppStrings();
  const [orderStats, setOrderStats] = useState([
    { title: getString('orders.totalOrders'), count: 0, color: theme.color.primary.main, icon: 'receipt-outline' },
    { title: getString('orders.confirmed'), count: 0, color: theme.color.system.success, icon: 'checkmark-circle-outline' },
    { title: getString('orders.cancelled'), count: 0, color: theme.color.system.error, icon: 'close-circle-outline' },
    { title: getString('orders.pending'), count: 0, color: theme.color.system.warning, icon: 'time-outline' },
    { title: getString('orders.delivered'), count: 0, color: theme.color.system.information, icon: 'checkmark-done-outline' },
    { title: getString('orders.totalIncome'), count: '₹0', color: theme.color.accent.main, icon: 'cash-outline' },
    { title: getString('orders.onlineIncome'), count: '₹0', color: theme.color.secondary.bright, icon: 'card-outline' },
    { title: getString('orders.codIncome'), count: '₹0', color: theme.color.system.warningBright, icon: 'wallet-outline' },
  ]);
  const [totalIncome, setTotalIncome] = useState(0);
  const [isOnline, setIsOnline] = useState(true);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [recentOrders, setRecentOrders] = useState([]);
  const [activeItems, setActiveItems] = useState(0);
  const [outOfStock, setOutOfStock] = useState(0);
  const [newOrderPopupVisible, setNewOrderPopupVisible] = useState(false);
  const [newOrderData, setNewOrderData] = useState(null);
  const { on, off } = useSocket();

  const formatCurrency = (amount) => `₹${Number(amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;

  const fetchDashboardData = async () => {
    if (!authData?.id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      // Get dashboard data
      const responseDashboard = await AxiosClient.get(`menu/restaurant_order-summary/${authData?.id}`);
      const stats = responseDashboard.data?.data;
      
      if (stats) {
        setTotalIncome(stats.total_income || 0);
        setOrderStats([
          { title: getString('orders.totalOrders'), count: stats.total || 0, color: theme.color.primary.main, icon: 'receipt-outline' },
          { title: getString('orders.confirmed'), count: stats.confirmed || 0, color: theme.color.system.success, icon: 'checkmark-circle-outline' },
          { title: getString('orders.cancelled'), count: stats.cancelled || 0, color: theme.color.system.error, icon: 'close-circle-outline' },
          { title: getString('orders.pending'), count: stats.pending || 0, color: theme.color.system.warning, icon: 'time-outline' },
          { title: getString('orders.delivered'), count: stats.delivered || 0, color: theme.color.system.information, icon: 'checkmark-done-outline' },
          { title: getString('orders.totalIncome'), count: formatCurrency(stats.total_income || 0), color: theme.color.accent.main, icon: 'cash-outline' },
          { title: getString('orders.onlineIncome'), count: formatCurrency(stats.income_by_mode?.ONLINE || 0), color: theme.color.secondary.bright, icon: 'card-outline' },
          { title: getString('orders.codIncome'), count: formatCurrency(stats.income_by_mode?.COD || 0), color: theme.color.system.warningBright, icon: 'wallet-outline' },
        ]);
      }

      // Fetch recent orders
      try {
        const ordersResponse = await AxiosClient.get(`menu/latest_restaurant_order/${authData.id}/new-orders`, {
          params: { order_status: 'placed', limit: 5 }
        });
        const orders = ordersResponse.data?.data || [];
        setRecentOrders(orders.slice(0, 5).map(order => ({
          id: order.id,
          customer: order.customer?.full_name || 'Customer',
          item: order.order_items?.[0]?.food_item?.name || 'Order',
          status: order.order_status,
          time: order.created_at ? new Date(order.created_at).toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit' 
          }) : 'Just now',
        })));
      } catch (error) {
        console.error('Error fetching recent orders:', error);
      }

      // Fetch menu items count
      try {
        const categoriesResponse = await AxiosClient.get(`menu/categories-by-restaurant/${authData.id}`);
        const categories = categoriesResponse.data?.data || [];
        let totalItems = 0;
        for (const category of categories) {
          try {
            const itemsResponse = await AxiosClient.get(`menu/categories/${authData.id}`);
            const items = itemsResponse.data?.data || [];
            const categoryData = items.find(cat => cat.id === category.id);
            if (categoryData?.food_items) {
              totalItems += categoryData.food_items.length;
            }
          } catch (error) {
            console.error(`Error fetching items for category ${category.id}:`, error);
          }
        }
        setActiveItems(totalItems);
      } catch (error) {
        console.error('Error fetching menu items:', error);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchDashboardData();
    }, [authData?.id])
  );

  // Listen for new orders from socket
  useEffect(() => {
    const newOrderListenerId = on('newOrder', (data) => {
      console.log('🆕 New order received in NotificationSettingsScreen:', data);
      setNewOrderData(data);
      setNewOrderPopupVisible(true);
    });

    return () => {
      if (newOrderListenerId) {
        off('newOrder', newOrderListenerId);
      }
    };
  }, [on, off]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchDashboardData();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'delivered':
      case 'completed':
        return theme.color.system.success;
      case 'cancelled':
        return theme.color.system.error;
      case 'preparing':
        return theme.color.system.information;
      default:
        return theme.color.system.warning;
    }
  };

  const renderStatCard = ({ item, index }) => (
    <TouchableOpacity
      onPress={() => navigation.navigate('OrderStatusScreen', { restaurantId: authData?.id })}
      style={[styles.statCard, { backgroundColor: item.color }]}
    >
      <Icon name={item.icon} size={24} color={theme.color.primary.white} />
      <Text style={styles.statCount}>{item.count}</Text>
      <Text style={styles.statTitle}>{item.title}</Text>
    </TouchableOpacity>
  );

  const renderRecentOrder = (order) => (
    <TouchableOpacity
      key={order.id}
      style={styles.orderCard}
      onPress={() => navigation.navigate('OrderStatusScreen', { 
        restaurantId: authData?.id,
        order: order 
      })}
    >
      <View style={styles.orderContent}>
        <View style={styles.orderInfo}>
          <Icon name="person-outline" size={20} color={theme.color.text.primary} />
          <View style={styles.orderDetails}>
            <Text style={styles.orderText}>{order.customer} ordered {order.item}</Text>
            <View style={styles.orderMeta}>
              <View style={[styles.statusBadge, { backgroundColor: getStatusColor(order.status) + '20' }]}>
                <Text style={[styles.orderStatus, { color: getStatusColor(order.status) }]}>
                  {order.status}
                </Text>
              </View>
              <Text style={styles.orderTime}>• {order.time}</Text>
            </View>
          </View>
        </View>
        <Icon name="chevron-forward" size={20} color={theme.color.text.tertiary} />
      </View>
    </TouchableOpacity>
  );

  if (loading && !refreshing) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor={theme.color.primary.white} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.color.primary.main} />
          <Text style={styles.loadingText}>{getString('home.loadingDashboard')}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.color.primary.white} />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <View style={styles.headerInfo}>
              <View style={styles.restaurantInfo}>
                <Icon name="restaurant" size={24} color={theme.color.primary.main} />
                <View style={styles.restaurantDetails}>
                  <Text style={styles.restaurantName}>{authData?.full_name || 'Restaurant'}</Text>
                  {authData?.address && (
                    <View style={styles.addressRow}>
                      <Icon name="location-outline" size={14} color={theme.color.text.tertiary} />
                      <Text style={styles.addressText} numberOfLines={1}>
                        {authData.address}
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            </View>
            <TouchableOpacity
              style={styles.notificationButton}
              onPress={() => navigation.navigate('NotificationsScreen')}
            >
              <Icon name="notifications-outline" size={24} color={theme.color.text.primary} />
            </TouchableOpacity>
          </View>

          {/* Online Status Toggle */}
          <View style={styles.statusToggleContainer}>
            <View style={styles.statusInfo}>
              <View style={[styles.statusDot, isOnline && styles.statusDotOnline]} />
              <Text style={styles.statusText}>
                {isOnline ? getString('home.onlineStatus') : getString('home.offlineStatus')}
              </Text>
            </View>
            <Switch
              value={isOnline}
              onValueChange={setIsOnline}
              trackColor={{ false: theme.color.other.border, true: theme.color.accent.main }}
              thumbColor={theme.color.primary.white}
            />
          </View>
        </View>

        {/* Stats Grid */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{getString('home.dashboardOverview')}</Text>
          <FlatList
            data={orderStats}
            renderItem={renderStatCard}
            keyExtractor={(item, index) => index.toString()}
            numColumns={2}
            scrollEnabled={false}
            columnWrapperStyle={styles.statRow}
          />
        </View>

        {/* Revenue Card */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{getString('home.monthlyRevenue')}</Text>
          <View style={styles.revenueCard}>
            <View style={styles.revenueHeader}>
              <Icon name="trending-up" size={28} color={theme.color.accent.main} />
              <Text style={styles.revenueAmount}>{formatCurrency(totalIncome)}</Text>
            </View>
            <Text style={styles.revenueSubText}>{getString('home.revenueSubtext')}</Text>
          </View>
        </View>

        {/* Inventory Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{getString('home.inventorySummary')}</Text>
          <View style={styles.inventoryRow}>
            <View style={styles.inventoryCard}>
              <Icon name="restaurant-outline" size={32} color={theme.color.primary.main} />
              <Text style={styles.inventoryCount}>{activeItems}</Text>
              <Text style={styles.inventoryLabel}>{getString('home.activeItems')}</Text>
            </View>
            <View style={styles.inventoryCard}>
              <Icon name="alert-circle-outline" size={32} color={theme.color.system.error} />
              <Text style={styles.inventoryCount}>{outOfStock}</Text>
              <Text style={styles.inventoryLabel}>{getString('home.outOfStock')}</Text>
            </View>
          </View>
        </View>

        {/* Recent Orders */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{getString('home.recentOrders')}</Text>
            <TouchableOpacity onPress={() => navigation.navigate('RecentOrders')}>
              <Text style={styles.seeAllText}>{getString('home.seeAll')}</Text>
            </TouchableOpacity>
          </View>
          {recentOrders.length > 0 ? (
            recentOrders.map(renderRecentOrder)
          ) : (
            <View style={styles.emptyState}>
              <Icon name="receipt-outline" size={48} color={theme.color.text.tertiary} />
              <Text style={styles.emptyStateText}>{getString('home.noRecentOrders')}</Text>
            </View>
          )}
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{getString('home.quickActions')}</Text>
          <View style={styles.quickActionsRow}>
            <TouchableOpacity
              style={styles.quickActionCard}
              onPress={() => navigation.navigate('MyMenu')}
            >
              <Icon name="restaurant-outline" size={28} color={theme.color.primary.main} />
              <Text style={styles.quickActionText}>{getString('home.manageMenu')}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.quickActionCard}
              onPress={() => navigation.navigate('RecentOrders')}
            >
              <Icon name="receipt-outline" size={28} color={theme.color.system.information} />
              <Text style={styles.quickActionText}>{getString('home.viewOrders')}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.quickActionCard}
              onPress={() => navigation.navigate('RestaurantProfile')}
            >
              <Icon name="settings-outline" size={28} color={theme.color.text.secondary} />
              <Text style={styles.quickActionText}>{getString('home.settings')}</Text>
            </TouchableOpacity>
          </View>
        </View>
        </ScrollView>

        {/* New Order Popup */}
        <NewOrderPopup
          visible={newOrderPopupVisible}
          orderData={newOrderData}
          onClose={() => {
            setNewOrderPopupVisible(false);
            setNewOrderData(null);
          }}
          onViewOrder={(order) => {
            // Navigate to order details or recent orders
            navigation.navigate('RecentOrders');
          }}
        />
      </SafeAreaView>
    );
  }

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.color.secondary.light,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
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
  header: {
    backgroundColor: theme.color.primary.white,
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: theme.color.other.border,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  headerInfo: {
    flex: 1,
  },
  restaurantInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  restaurantDetails: {
    flex: 1,
  },
  restaurantName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: theme.color.text.primary,
    marginBottom: 4,
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  addressText: {
    fontSize: 13,
    color: theme.color.text.tertiary,
    flex: 1,
  },
  notificationButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.color.secondary.light,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusToggleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: theme.color.other.divider + '30',
  },
  statusInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
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
    fontWeight: '500',
  },
  section: {
    paddingHorizontal: 20,
    marginTop: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.color.text.primary,
    marginBottom: 12,
  },
  seeAllText: {
    fontSize: 14,
    color: theme.color.primary.main,
    fontWeight: '500',
  },
  statRow: {
    justifyContent: 'space-between',
    gap: 12,
  },
  statCard: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    minWidth: (screenWidth - 52) / 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statCount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.color.primary.white,
    marginTop: 8,
  },
  statTitle: {
    fontSize: 13,
    color: theme.color.primary.white,
    marginTop: 4,
    opacity: 0.9,
  },
  revenueCard: {
    backgroundColor: theme.color.primary.white,
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.color.other.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  revenueHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  revenueAmount: {
    fontSize: 28,
    fontWeight: 'bold',
    color: theme.color.accent.main,
  },
  revenueSubText: {
    fontSize: 14,
    color: theme.color.text.secondary,
  },
  inventoryRow: {
    flexDirection: 'row',
    gap: 12,
  },
  inventoryCard: {
    flex: 1,
    backgroundColor: theme.color.primary.white,
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.color.other.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  inventoryCount: {
    fontSize: 28,
    fontWeight: 'bold',
    color: theme.color.text.primary,
    marginTop: 8,
  },
  inventoryLabel: {
    fontSize: 13,
    color: theme.color.text.secondary,
    marginTop: 4,
  },
  orderCard: {
    backgroundColor: theme.color.primary.white,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: theme.color.other.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  orderContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  orderInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  orderDetails: {
    flex: 1,
  },
  orderText: {
    fontSize: 15,
    color: theme.color.text.primary,
    fontWeight: '500',
    marginBottom: 6,
  },
  orderMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  orderStatus: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  orderTime: {
    fontSize: 12,
    color: theme.color.text.tertiary,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    backgroundColor: theme.color.primary.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.color.other.border,
  },
  emptyStateText: {
    fontSize: 14,
    color: theme.color.text.secondary,
    marginTop: 12,
  },
  quickActionsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  quickActionCard: {
    flex: 1,
    backgroundColor: theme.color.primary.white,
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.color.other.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  quickActionText: {
    fontSize: 13,
    color: theme.color.text.primary,
    marginTop: 8,
    fontWeight: '500',
    textAlign: 'center',
  },
});
