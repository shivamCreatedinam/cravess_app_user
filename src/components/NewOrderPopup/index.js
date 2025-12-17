import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Animated,
  Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import theme from '../../theme';

const { width } = Dimensions.get('window');

const NewOrderPopup = ({ visible, orderData, onClose, onViewOrder }) => {
  const navigation = useNavigation();
  const [slideAnim] = useState(new Animated.Value(300));
  const [fadeAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    if (visible) {
      // Slide up animation
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 0,
          useNativeDriver: true,
          tension: 65,
          friction: 11,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      slideAnim.setValue(300);
      fadeAnim.setValue(0);
    }
  }, [visible]);

  const handleViewOrder = () => {
    onClose();
    if (onViewOrder) {
      onViewOrder(orderData);
    } else {
      // Navigate to order details or recent orders
      navigation.navigate('RecentOrders');
    }
  };

  const formatCurrency = (amount) => {
    return `₹${Number(amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
  };

  if (!orderData) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <Animated.View
          style={[
            styles.popupContainer,
            {
              transform: [{ translateY: slideAnim }],
              opacity: fadeAnim,
            },
          ]}
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <View style={styles.iconContainer}>
                <Icon name="notifications" size={24} color={theme.color.primary.white} />
              </View>
              <View>
                <Text style={styles.headerTitle}>New Order Received!</Text>
                <Text style={styles.headerSubtitle}>Tap to view details</Text>
              </View>
            </View>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={onClose}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Icon name="close" size={24} color={theme.color.text.primary} />
            </TouchableOpacity>
          </View>

          {/* Order Info */}
          <View style={styles.content}>
            <View style={styles.orderInfoRow}>
              <Icon name="receipt-outline" size={20} color={theme.color.text.secondary} />
              <Text style={styles.orderNumber}>
                Order #{orderData.orderId || orderData.id || 'N/A'}
              </Text>
            </View>

            {orderData.customer && (
              <View style={styles.orderInfoRow}>
                <Icon name="person-outline" size={20} color={theme.color.text.secondary} />
                <Text style={styles.orderText}>
                  {orderData.customer.full_name || orderData.customer.name || 'Customer'}
                </Text>
              </View>
            )}

            {orderData.total_amount && (
              <View style={styles.orderInfoRow}>
                <Icon name="cash-outline" size={20} color={theme.color.text.secondary} />
                <Text style={styles.orderText}>
                  Total: {formatCurrency(orderData.total_amount)}
                </Text>
              </View>
            )}

            {orderData.delivery_type && (
              <View style={styles.orderInfoRow}>
                <Icon
                  name={orderData.delivery_type === 'Delivery' ? 'car-outline' : 'restaurant-outline'}
                  size={20}
                  color={theme.color.text.secondary}
                />
                <Text style={styles.orderText}>{orderData.delivery_type}</Text>
              </View>
            )}

            {orderData.order_items && orderData.order_items.length > 0 && (
              <View style={styles.itemsContainer}>
                <Text style={styles.itemsTitle}>Items ({orderData.order_items.length}):</Text>
                {orderData.order_items.slice(0, 3).map((item, index) => (
                  <Text key={index} style={styles.itemText}>
                    • {item.food_item?.name || item.name || 'Item'} x {item.quantity || 1}
                  </Text>
                ))}
                {orderData.order_items.length > 3 && (
                  <Text style={styles.moreItemsText}>
                    +{orderData.order_items.length - 3} more items
                  </Text>
                )}
              </View>
            )}
          </View>

          {/* Actions */}
          <View style={styles.actions}>
            <TouchableOpacity
              style={styles.viewButton}
              onPress={handleViewOrder}
              activeOpacity={0.8}
            >
              <Icon name="eye-outline" size={20} color={theme.color.primary.white} />
              <Text style={styles.viewButtonText}>View Order</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

export default NewOrderPopup;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
    paddingBottom: 20,
  },
  popupContainer: {
    backgroundColor: theme.color.primary.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginHorizontal: 16,
    maxHeight: '80%',
    shadowColor: theme.color.other.shadowColor,
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: theme.color.primary.main,
    padding: 16,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.color.primary.white,
  },
  headerSubtitle: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 2,
  },
  closeButton: {
    padding: 4,
  },
  content: {
    padding: 16,
  },
  orderInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  orderNumber: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.color.text.primary,
    marginLeft: 8,
  },
  orderText: {
    fontSize: 14,
    color: theme.color.text.secondary,
    marginLeft: 8,
  },
  itemsContainer: {
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: theme.color.other.border,
  },
  itemsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.color.text.primary,
    marginBottom: 8,
  },
  itemText: {
    fontSize: 13,
    color: theme.color.text.secondary,
    marginBottom: 4,
  },
  moreItemsText: {
    fontSize: 12,
    color: theme.color.text.tertiary,
    fontStyle: 'italic',
    marginTop: 4,
  },
  actions: {
    padding: 16,
    paddingTop: 0,
  },
  viewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.color.primary.main,
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  viewButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.color.primary.white,
  },
});

