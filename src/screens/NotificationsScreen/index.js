import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  RefreshControl,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import theme from '../../theme';
import { useAppStrings } from '../../hooks/useAppStrings';

const NotificationsScreen = () => {
  const navigation = useNavigation();
  const { getString } = useAppStrings();
  const [notifications, setNotifications] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  // Dummy notifications data
  const dummyNotifications = [
    {
      id: '1',
      type: 'new_order',
      title: 'New Order Received',
      message: 'Order #ORD-1234 has been placed by John Doe',
      time: '2 minutes ago',
      read: false,
      icon: 'receipt-outline',
      color: theme.color.primary.main,
    },
    {
      id: '2',
      type: 'order_update',
      title: 'Order Status Updated',
      message: 'Order #ORD-1230 status changed to Preparing',
      time: '15 minutes ago',
      read: false,
      icon: 'time-outline',
      color: theme.color.system.warning,
    },
    {
      id: '3',
      type: 'order_cancelled',
      title: 'Order Cancelled',
      message: 'Order #ORD-1228 has been cancelled by customer',
      time: '1 hour ago',
      read: true,
      icon: 'close-circle-outline',
      color: theme.color.system.error,
    },
    {
      id: '4',
      type: 'payment',
      title: 'Payment Received',
      message: 'Payment of ₹450 received for Order #ORD-1225',
      time: '2 hours ago',
      read: true,
      icon: 'cash-outline',
      color: theme.color.system.success,
    },
    {
      id: '5',
      type: 'new_order',
      title: 'New Order Received',
      message: 'Order #ORD-1220 has been placed by Jane Smith',
      time: '3 hours ago',
      read: true,
      icon: 'receipt-outline',
      color: theme.color.primary.main,
    },
    {
      id: '6',
      type: 'order_update',
      title: 'Order Ready',
      message: 'Order #ORD-1215 is ready for pickup',
      time: '5 hours ago',
      read: true,
      icon: 'checkmark-circle-outline',
      color: theme.color.system.information,
    },
    {
      id: '7',
      type: 'system',
      title: 'System Update',
      message: 'Your restaurant profile has been verified',
      time: '1 day ago',
      read: true,
      icon: 'information-circle-outline',
      color: theme.color.text.secondary,
    },
  ];

  useEffect(() => {
    // Load dummy notifications
    setNotifications(dummyNotifications);
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    // Simulate refresh
    setTimeout(() => {
      setNotifications(dummyNotifications);
      setRefreshing(false);
    }, 1000);
  };

  const markAsRead = (id) => {
    setNotifications(prev =>
      prev.map(notif =>
        notif.id === id ? { ...notif, read: true } : notif
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev =>
      prev.map(notif => ({ ...notif, read: true }))
    );
  };

  const deleteNotification = (id) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id));
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  const renderNotification = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.notificationItem,
        !item.read && styles.unreadNotification,
      ]}
      onPress={() => markAsRead(item.id)}
      activeOpacity={0.7}
    >
      <View style={[styles.iconContainer, { backgroundColor: `${item.color}15` }]}>
        <Icon name={item.icon} size={24} color={item.color} />
      </View>
      <View style={styles.notificationContent}>
        <View style={styles.notificationHeader}>
          <Text style={styles.notificationTitle}>{item.title}</Text>
          {!item.read && <View style={styles.unreadDot} />}
        </View>
        <Text style={styles.notificationMessage} numberOfLines={2}>
          {item.message}
        </Text>
        <Text style={styles.notificationTime}>{item.time}</Text>
      </View>
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => deleteNotification(item.id)}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <Icon name="close-outline" size={20} color={theme.color.text.tertiary} />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Icon name="notifications-off-outline" size={64} color={theme.color.text.tertiary} />
      <Text style={styles.emptyStateTitle}>No Notifications</Text>
      <Text style={styles.emptyStateText}>
        You're all caught up! New notifications will appear here.
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.color.primary.white} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-back" size={24} color={theme.color.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notifications</Text>
        {unreadCount > 0 && (
          <TouchableOpacity
            style={styles.markAllButton}
            onPress={markAllAsRead}
          >
            <Text style={styles.markAllText}>Mark all read</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Unread Badge */}
      {unreadCount > 0 && (
        <View style={styles.unreadBadge}>
          <Text style={styles.unreadBadgeText}>
            {unreadCount} {unreadCount === 1 ? 'unread notification' : 'unread notifications'}
          </Text>
        </View>
      )}

      {/* Notifications List */}
      <FlatList
        data={notifications}
        renderItem={renderNotification}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[theme.color.primary.main]}
            tintColor={theme.color.primary.main}
          />
        }
        ListEmptyComponent={renderEmptyState}
      />
    </SafeAreaView>
  );
};

export default NotificationsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.color.secondary.light,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: theme.color.primary.white,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.color.other.border,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.color.text.primary,
    flex: 1,
    textAlign: 'center',
  },
  markAllButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  markAllText: {
    fontSize: 14,
    color: theme.color.primary.main,
    fontWeight: '600',
  },
  unreadBadge: {
    backgroundColor: theme.color.primary.main,
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  unreadBadgeText: {
    color: theme.color.primary.white,
    fontSize: 14,
    fontWeight: '600',
  },
  listContent: {
    padding: 16,
    paddingBottom: 32,
  },
  notificationItem: {
    flexDirection: 'row',
    backgroundColor: theme.color.primary.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: 'transparent',
    shadowColor: theme.color.other.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  unreadNotification: {
    borderLeftColor: theme.color.primary.main,
    backgroundColor: `${theme.color.primary.main}08`,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  notificationContent: {
    flex: 1,
  },
  notificationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.color.text.primary,
    flex: 1,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.color.primary.main,
    marginLeft: 8,
  },
  notificationMessage: {
    fontSize: 14,
    color: theme.color.text.secondary,
    marginBottom: 4,
    lineHeight: 20,
  },
  notificationTime: {
    fontSize: 12,
    color: theme.color.text.tertiary,
  },
  deleteButton: {
    padding: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 80,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: theme.color.text.primary,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    color: theme.color.text.secondary,
    textAlign: 'center',
    paddingHorizontal: 32,
  },
});

