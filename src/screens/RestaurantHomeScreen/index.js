import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  StatusBar,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import AxiosClient from '../../apis/clients';
import theme from '../../theme';

const RestaurantHomeScreen = () => {
  const navigation = useNavigation();
  const user = useSelector((state) => state?.userInfo?.user);
  const [activeOrders, setActiveOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [stats, setStats] = useState({
    todayOrders: 0,
    todayRevenue: 0,
    pendingOrders: 0,
    completedOrders: 0,
  });

  // Fetch active orders
  const fetchActiveOrders = async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      // Fetch new/pending orders
      const response = await AxiosClient.get(`menu/latest_restaurant_order/${user.id}/new-orders`, {
        params: { order_status: 'placed' }
      });
      
      const orders = response.data?.data || [];
      
      // Transform orders to match our format
      const transformedOrders = orders.map(order => ({
        id: order.id?.toString(),
        orderNumber: `#ORD-${order.id}`,
        customerName: order.customer?.full_name || 'Customer',
        items: order.order_items?.map(item => ({
          name: item.food_item?.name || 'Item',
          quantity: item.quantity || 1,
          price: parseFloat(item.price || 0),
        })) || [],
        total: parseFloat(order.total_amount || 0),
        status: order.order_status === 'placed' ? 'pending' : 
                order.order_status === 'preparing' ? 'preparing' :
                order.order_status === 'ready' ? 'ready' : 'pending',
        time: order.created_at ? new Date(order.created_at).toLocaleTimeString('en-US', { 
          hour: '2-digit', 
          minute: '2-digit' 
        }) : 'Just now',
        deliveryType: order.delivery_type || 'Delivery',
        address: order.delivery_address || 'Address not available',
        orderData: order, // Keep original data
      }));

      setActiveOrders(transformedOrders);
      setStats(prev => ({
        ...prev,
        pendingOrders: transformedOrders.filter(o => o.status === 'pending').length,
      }));
    } catch (error) {
      console.error('Error fetching orders:', error);
      // Don't show alert, just use empty array
      setActiveOrders([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchActiveOrders();
    }, [user?.id])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchActiveOrders();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return theme.color.system.warning;
      case 'preparing':
        return theme.color.system.information;
      case 'ready':
        return theme.color.system.success;
      default:
        return theme.color.text.tertiary;
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return 'time-outline';
      case 'preparing':
        return 'restaurant-outline';
      case 'ready':
        return 'checkmark-circle-outline';
      default:
        return 'ellipse-outline';
    }
  };

  const renderOrderCard = ({ item }) => (
        <TouchableOpacity
          style={styles.orderCard}
          onPress={() => navigation.navigate('OrderStatusScreen', { 
            restaurantId: user?.id,
            order: item.orderData 
          })}
        >
      <View style={styles.orderHeader}>
        <View>
          <Text style={styles.orderNumber}>{item.orderNumber}</Text>
          <Text style={styles.customerName}>{item.customerName}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '20' }]}>
          <Icon
            name={getStatusIcon(item.status)}
            size={16}
            color={getStatusColor(item.status)}
          />
          <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
            {item.status.toUpperCase()}
          </Text>
        </View>
      </View>

      <View style={styles.orderDetails}>
        <View style={styles.deliveryInfo}>
          <Icon
            name={item.deliveryType === 'Delivery' ? 'car-outline' : item.deliveryType === 'Pickup' ? 'bag-outline' : 'restaurant-outline'}
            size={16}
            color={theme.color.text.secondary}
          />
          <Text style={styles.deliveryText}>{item.deliveryType}</Text>
          <Text style={styles.timeText}> • {item.time}</Text>
        </View>
        <Text style={styles.addressText} numberOfLines={1}>
          {item.address}
        </Text>
      </View>

      <View style={styles.itemsContainer}>
        {item.items.slice(0, 2).map((orderItem, index) => (
          <Text key={index} style={styles.itemText}>
            {orderItem.quantity}x {orderItem.name}
          </Text>
        ))}
        {item.items.length > 2 && (
          <Text style={styles.moreItemsText}>+{item.items.length - 2} more items</Text>
        )}
      </View>

      <View style={styles.orderFooter}>
        <Text style={styles.totalText}>Total: ${item.total.toFixed(2)}</Text>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => navigation.navigate('OrderStatusScreen', { 
            restaurantId: user?.id,
            order: item.orderData 
          })}
        >
          <Text style={styles.actionButtonText}>
            {item.status === 'pending' ? 'Accept' : item.status === 'preparing' ? 'Mark Ready' : 'Complete'}
          </Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.color.primary.white} />
      <ScrollView 
        style={styles.scrollView} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Good Morning!</Text>
            <Text style={styles.restaurantName}>Cravess Restaurant</Text>
          </View>
          <TouchableOpacity style={styles.notificationButton}>
            <Icon name="notifications-outline" size={24} color={theme.color.text.primary} />
            <View style={styles.notificationBadge}>
              <Text style={styles.notificationBadgeText}>{stats.pendingOrders}</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Icon name="receipt-outline" size={24} color={theme.color.primary.main} />
            <Text style={styles.statValue}>{stats.todayOrders}</Text>
            <Text style={styles.statLabel}>Today's Orders</Text>
          </View>
          <View style={styles.statCard}>
            <Icon name="cash-outline" size={24} color={theme.color.accent.main} />
            <Text style={styles.statValue}>${stats.todayRevenue.toFixed(2)}</Text>
            <Text style={styles.statLabel}>Today's Revenue</Text>
          </View>
        </View>

        {/* Active Orders Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Active Orders</Text>
            <TouchableOpacity onPress={() => navigation.navigate('RecentOrders')}>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>

          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={theme.color.primary.main} />
              <Text style={styles.loadingText}>Loading orders...</Text>
            </View>
          ) : activeOrders.length > 0 ? (
            <FlatList
              data={activeOrders}
              renderItem={renderOrderCard}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
            />
          ) : (
            <View style={styles.emptyState}>
              <Icon name="restaurant-outline" size={64} color={theme.color.text.tertiary} />
              <Text style={styles.emptyStateText}>No active orders</Text>
              <Text style={styles.emptyStateSubtext}>New orders will appear here</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.color.primary.white,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: theme.color.primary.white,
  },
  greeting: {
    fontSize: 16,
    color: theme.color.text.secondary,
  },
  restaurantName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.color.text.primary,
    marginTop: 4,
  },
  notificationButton: {
    position: 'relative',
    padding: 8,
  },
  notificationBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: theme.color.system.error,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  notificationBadgeText: {
    color: theme.color.primary.white,
    fontSize: 12,
    fontWeight: 'bold',
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 20,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: theme.color.secondary.light,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.color.text.primary,
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: theme.color.text.secondary,
    marginTop: 4,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.color.text.primary,
  },
  seeAllText: {
    fontSize: 14,
    color: theme.color.primary.main,
  },
  orderCard: {
    backgroundColor: theme.color.primary.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: theme.color.other.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  orderNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.color.text.primary,
  },
  customerName: {
    fontSize: 14,
    color: theme.color.text.secondary,
    marginTop: 4,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  orderDetails: {
    marginBottom: 12,
  },
  deliveryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    gap: 4,
  },
  deliveryText: {
    fontSize: 14,
    color: theme.color.text.secondary,
  },
  timeText: {
    fontSize: 14,
    color: theme.color.text.tertiary,
  },
  addressText: {
    fontSize: 13,
    color: theme.color.text.tertiary,
    marginLeft: 20,
  },
  itemsContainer: {
    marginBottom: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: theme.color.other.divider + '30',
  },
  itemText: {
    fontSize: 14,
    color: theme.color.text.primary,
    marginBottom: 4,
  },
  moreItemsText: {
    fontSize: 13,
    color: theme.color.text.tertiary,
    fontStyle: 'italic',
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: theme.color.other.divider + '30',
  },
  totalText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.color.text.primary,
  },
  actionButton: {
    backgroundColor: theme.color.primary.main,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  actionButtonText: {
    color: theme.color.primary.white,
    fontSize: 14,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.color.text.secondary,
    marginTop: 16,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: theme.color.text.tertiary,
    marginTop: 8,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: theme.color.text.secondary,
  },
});

export default RestaurantHomeScreen;

