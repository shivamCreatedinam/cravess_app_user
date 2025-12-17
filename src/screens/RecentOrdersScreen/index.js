import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import AxiosClient from '../../apis/clients';
import theme from '../../theme';

const RecentOrdersScreen = () => {
  const navigation = useNavigation();
  const user = useSelector((state) => state?.userInfo?.user);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Fetch orders history
  const fetchOrders = async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      // Fetch order history
      const response = await AxiosClient.get('menu/orders/history', {
        params: {
          role: 'restaurant',
          restaurant_id: user.id,
          limit: 50,
        }
      });

      const ordersData = response.data?.data || [];
      
      // Transform orders to match our format
      const transformedOrders = ordersData.map(order => ({
        id: order.id?.toString(),
        orderNumber: `#ORD-${order.id}`,
        customerName: order.customer?.full_name || 'Customer',
        items: order.order_items?.map(item => ({
          name: item.food_item?.name || 'Item',
          quantity: item.quantity || 1,
          price: parseFloat(item.price || 0),
        })) || [],
        total: parseFloat(order.total_amount || 0),
        status: order.order_status === 'completed' ? 'completed' : 
                order.order_status === 'cancelled' ? 'cancelled' : 'completed',
        date: order.created_at ? new Date(order.created_at).toLocaleDateString() : new Date().toLocaleDateString(),
        time: order.created_at ? new Date(order.created_at).toLocaleTimeString('en-US', { 
          hour: '2-digit', 
          minute: '2-digit' 
        }) : 'Just now',
        deliveryType: order.delivery_type || 'Delivery',
        address: order.delivery_address || 'Address not available',
        rating: order.rating || null,
        orderData: order, // Keep original data
      }));

      setOrders(transformedOrders);
    } catch (error) {
      console.error('Error fetching orders:', error);
      // Don't show alert, just use empty array
      setOrders([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchOrders();
    }, [user?.id])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchOrders();
  };

  const filters = [
    { id: 'all', label: 'All Orders' },
    { id: 'completed', label: 'Completed' },
    { id: 'cancelled', label: 'Cancelled' },
  ];

  const filteredOrders = selectedFilter === 'all'
    ? orders
    : orders.filter(order => order.status === selectedFilter);

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return theme.color.system.success;
      case 'cancelled':
        return theme.color.system.error;
      default:
        return theme.color.text.tertiary;
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
        <View style={styles.orderInfo}>
          <Text style={styles.orderNumber}>{item.orderNumber}</Text>
          <Text style={styles.customerName}>{item.customerName}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '20' }]}>
          <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
            {item.status.toUpperCase()}
          </Text>
        </View>
      </View>

      <View style={styles.orderDetails}>
        <View style={styles.timeInfo}>
          <Icon name="time-outline" size={16} color={theme.color.text.secondary} />
          <Text style={styles.dateTimeText}>
            {item.date} • {item.time}
          </Text>
        </View>
        <View style={styles.deliveryInfo}>
          <Icon
            name={item.deliveryType === 'Delivery' ? 'car-outline' : item.deliveryType === 'Pickup' ? 'bag-outline' : 'restaurant-outline'}
            size={16}
            color={theme.color.text.secondary}
          />
          <Text style={styles.deliveryText}>{item.deliveryType}</Text>
        </View>
      </View>

      <View style={styles.itemsContainer}>
        {item.items.map((orderItem, index) => (
          <View key={index} style={styles.itemRow}>
            <Text style={styles.itemText}>
              {orderItem.quantity}x {orderItem.name}
            </Text>
            <Text style={styles.itemPrice}>${orderItem.price.toFixed(2)}</Text>
          </View>
        ))}
      </View>

      <View style={styles.orderFooter}>
        <View>
          <Text style={styles.totalLabel}>Total Amount</Text>
          <Text style={styles.totalText}>${item.total.toFixed(2)}</Text>
        </View>
        {item.rating && (
          <View style={styles.ratingContainer}>
            <Icon name="star" size={16} color={theme.color.system.warningBright} />
            <Text style={styles.ratingText}>{item.rating}.0</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.color.primary.white} />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Recent Orders</Text>
      </View>

      {/* Filters */}
      <View style={styles.filterContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
          {filters.map((filter) => (
            <TouchableOpacity
              key={filter.id}
              style={[
                styles.filterButton,
                selectedFilter === filter.id && styles.filterButtonActive,
              ]}
              onPress={() => setSelectedFilter(filter.id)}
            >
              <Text
                style={[
                  styles.filterText,
                  selectedFilter === filter.id && styles.filterTextActive,
                ]}
              >
                {filter.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Orders List */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.color.primary.main} />
          <Text style={styles.loadingText}>Loading orders...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredOrders}
          renderItem={renderOrderCard}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListEmptyComponent={
          <View style={styles.emptyState}>
            <Icon name="receipt-outline" size={64} color={theme.color.text.tertiary} />
            <Text style={styles.emptyStateText}>No orders found</Text>
            <Text style={styles.emptyStateSubtext}>
              {selectedFilter === 'all' ? 'You have no orders yet' : `No ${selectedFilter} orders`}
            </Text>
          </View>
          }
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.color.secondary.light,
  },
  header: {
    backgroundColor: theme.color.primary.white,
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: theme.color.other.border,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.color.text.primary,
  },
  filterContainer: {
    backgroundColor: theme.color.primary.white,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.color.other.border,
  },
  filterScroll: {
    paddingHorizontal: 20,
    gap: 8,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: theme.color.secondary.light,
    marginRight: 8,
  },
  filterButtonActive: {
    backgroundColor: theme.color.primary.main,
  },
  filterText: {
    fontSize: 14,
    color: theme.color.text.secondary,
  },
  filterTextActive: {
    color: theme.color.primary.white,
  },
  listContent: {
    padding: 20,
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
  orderInfo: {
    flex: 1,
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
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  orderDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.color.other.divider + '30',
  },
  timeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  dateTimeText: {
    fontSize: 13,
    color: theme.color.text.secondary,
  },
  deliveryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  deliveryText: {
    fontSize: 13,
    color: theme.color.text.secondary,
  },
  itemsContainer: {
    marginBottom: 12,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  itemText: {
    fontSize: 14,
    color: theme.color.text.primary,
    flex: 1,
  },
  itemPrice: {
    fontSize: 14,
    color: theme.color.text.secondary,
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: theme.color.other.divider + '30',
  },
  totalLabel: {
    fontSize: 12,
    color: theme.color.text.tertiary,
  },
  totalText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.color.text.primary,
    marginTop: 2,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.color.text.primary,
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
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: theme.color.text.secondary,
  },
});

export default RecentOrdersScreen;

