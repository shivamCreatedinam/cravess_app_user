import React, { useEffect, useState } from 'react';
import {
    View, Text, FlatList, ActivityIndicator,
    StyleSheet, TouchableOpacity, Alert, TextInput,
    Dimensions
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AxiosClient from '../../apis/clients';
import DropDownPicker from 'react-native-dropdown-picker';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useSelector } from 'react-redux';
import { showToast, showSuccessToast, showErrorToast } from '../../utils/common';
import useSocket from '../../hooks/useSocket';

const validStatuses = [
    'placed', 'accepted', 'preparing',
    'ready', 'on_the_way', 'delivered', 'cancelled'
];

const statusIcons = {
    placed: 'assignment',
    accepted: 'check-circle',
    preparing: 'restaurant',
    ready: 'check-box',
    on_the_way: 'delivery-dining',
    delivered: 'done-all',
    cancelled: 'cancel'
};

const OrderStatusScreen = ({ route }) => {
    const navigation = useNavigation();
    const restaurantId = route?.params?.restaurantId;
    const authData = useSelector((state) => state?.userInfo?.user);
    const { emit, on, off, isConnected, joinRoom, leaveRoom } = useSocket();
    const [orders, setOrders] = useState([]);
    const [filteredOrders, setFilteredOrders] = useState([]);
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [statusFilter, setStatusFilter] = useState('placed');
    const [loading, setLoading] = useState(false);
    const [updatingId, setUpdatingId] = useState(null);
    const [driverLocations, setDriverLocations] = useState({}); // Track driver locations

    const [dropdownState, setDropdownState] = useState({});
    const [drivers, setDrivers] = useState([]);

    const fetchOrders = async (reset = false) => {
        try {
            setLoading(true);
            const status = statusFilter;
            const res = await AxiosClient.get(
                `menu/latest_restaurant_order/${restaurantId}/new-orders`,
                {
                    params: { order_status: status },
                }
            );
            const fetched = res?.data?.data || [];
            setOrders(fetched);
            // Update filtered orders based on search
            if (search) {
                setFilteredOrders(fetched.filter(o =>
                    o.customer?.full_name?.toLowerCase().includes(search.toLowerCase())
                ));
            } else {
                setFilteredOrders(fetched);
            }
            setLoading(false);
        } catch (error) {
            console.error('Failed to fetch orders:', error);
            showErrorToast('Failed to load orders',{
                type: 'danger',
                placement: 'bottom',
            });
        } finally {
            setLoading(false);
        }
    };

    const updateStatus = async (orderId, newStatus, currentStatus) => {
        try {
            setUpdatingId(orderId);
            
            // Validation: Can't assign driver if status is not "ready"
            if (newStatus === 'on_the_way' && currentStatus !== 'ready') {
                Alert.alert(
                    'Invalid Status Change',
                    'Order must be "ready" before it can be marked as "on the way". Please assign a driver first.',
                );
                setUpdatingId(null);
                return;
            }

            const res = await AxiosClient.put(`menu/order-status/${orderId}`, {
                new_status: newStatus,
            });

            if (res?.data?.status || res?.data?.success) {
                console.log('Status updated successfully', res?.data);
                
                // Emit socket event for status change
                if (isConnected) {
                    emit('orderStatusChanged', {
                        orderId: orderId,
                        status: newStatus,
                        restaurantId: restaurantId,
                        previousStatus: currentStatus,
                    });
                }

                // Update local state immediately
                setOrders(prevOrders => 
                    prevOrders.map(order => 
                        order.id === orderId 
                            ? { ...order, order_status: newStatus }
                            : order
                    )
                );

                showSuccessToast(`Order #${orderId} marked as ${newStatus.replace(/_/g, ' ')}`);
                
                // Refresh orders after a short delay to ensure consistency
                setTimeout(() => {
                fetchOrders(true);
                }, 500);
            } else {
                Alert.alert('Failed', res?.data?.message || 'Status update failed');
            }
        } catch (error) {
            console.error('Status Update Error:', error);
            Alert.alert('Error', 'Unable to update status');
        } finally {
            setUpdatingId(null);
        }
    };

    const onSearch = (text) => {
        setSearch(text);
        // Filtering is handled in useEffect when orders or search changes
    };

    const fetchDrivers = async () => {
        try {
            const res = await AxiosClient.get('menu/FetchAllDrivers');
            console.log('fetchDriversData', JSON.stringify(res?.data));
            if (res?.data?.success) {
                setDrivers(
                    res.data.drivers.map(d => ({
                        label: d.full_name,
                        value: d.id,
                    }))
                );
            }
        } catch (error) {
            console.error('Failed to fetch drivers:', error);
        }
    };


    const assignDriver = async (orderId, driverId, currentStatus) => {
        try {
            // Validation: Only allow assignment when status is "ready"
            if (currentStatus !== 'ready') {
                Alert.alert(
                    'Cannot Assign Driver',
                    'Driver can only be assigned when order status is "ready". Please update order status first.',
                );
                return;
            }

            const res = await AxiosClient.put(
                `menu/bookingAssignDriver/${orderId}/assign-driver`,
                {}, // no body
                {
                    params: { driver_id: driverId },
                }
            );
            console.log('DriverAssign:', JSON.stringify(res?.data), driverId);
            
            if (res?.data?.success) {
                // Emit socket event for driver assignment
                if (isConnected) {
                    emit('driverAssigned', {
                        orderId: orderId,
                        driverId: driverId,
                        restaurantId: restaurantId,
                        driver: res?.data?.driver,
                    });
                    
                    // Join driver tracking room
                    joinRoom(`driver_${driverId}`, { driverId, orderId: orderId });
                }

                showSuccessToast(`Driver assigned to order #${orderId}`);
                
                // Update local state immediately
                setOrders(prevOrders => 
                    prevOrders.map(order => 
                        order.id === orderId 
                            ? { 
                                ...order, 
                                driver_id: driverId, 
                                driver: res?.data?.driver || order.driver,
                                // Optionally auto-update status to "on_the_way" after assignment
                                // order_status: 'on_the_way'
                              }
                            : order
                    )
                );
                
                // Refresh orders after a short delay
                setTimeout(() => {
                fetchOrders();
                }, 500);
            } else {
                Alert.alert('Failed', res?.data?.message || 'Unable to assign driver');
            }
        } catch (error) {
            console.error('Driver assign error:', error);
            Alert.alert('Error', error.message || 'Something went wrong');
        }
    };

    // Setup socket listeners for real-time updates
    useEffect(() => {
        if (!isConnected || !restaurantId) return;

        // Join restaurant room for order updates
        joinRoom(`restaurant_${restaurantId}`, { restaurantId });

        // Listen for driver location updates
        const locationListenerId = on('driverLocationUpdate', (data) => {
            console.log('🚗 Driver location update:', data);
            if (data?.driverId && data?.latitude && data?.longitude) {
                setDriverLocations(prev => ({
                    ...prev,
                    [data.driverId]: {
                        latitude: data.latitude,
                        longitude: data.longitude,
                        timestamp: Date.now(),
                    }
                }));
            }
        }, {
            showNotification: false, // Don't notify for every location update
        });

        // Listen for driver assignment confirmations
        const assignListenerId = on('driverAssigned', (data) => {
            console.log('✅ Driver assignment confirmed:', data);
            if (data?.orderId && data?.driverId) {
                // Join driver room for this order
                joinRoom(`driver_${data.driverId}`, { driverId: data.driverId, orderId: data.orderId });
                
                // Update order with driver info
                setOrders(prevOrders => 
                    prevOrders.map(order => 
                        order.id === data.orderId 
                            ? { ...order, driver_id: data.driverId, driver: data.driver }
                            : order
                    )
                );
            }
        }, {
            title: 'Driver Assigned',
            message: 'Driver has been assigned to the order',
            type: 'success',
        });

        // Listen for order status changes
        const statusListenerId = on('orderStatusChanged', (data) => {
            console.log('📦 Order status changed:', data);
            if (data?.orderId && data?.status) {
                setOrders(prevOrders => 
                    prevOrders.map(order => 
                        order.id === data.orderId 
                            ? { ...order, order_status: data.status }
                            : order
                    )
                );
            }
        }, {
            title: 'Status Changed',
            message: 'Order status has been updated',
            type: 'info',
        });

        return () => {
            off('driverLocationUpdate', locationListenerId);
            off('driverAssigned', assignListenerId);
            off('orderStatusChanged', statusListenerId);
            leaveRoom(`restaurant_${restaurantId}`);
        };
    }, [isConnected, restaurantId, emit, on, off, joinRoom, leaveRoom]);

    // Initialize filtered orders when orders change
    useEffect(() => {
        if (search) {
            setFilteredOrders(orders.filter(o =>
                o.customer?.full_name?.toLowerCase().includes(search.toLowerCase())
            ));
        } else {
            setFilteredOrders(orders);
        }
    }, [orders, search]);

    useEffect(() => {
        fetchOrders(true);
        fetchDrivers();
    }, [statusFilter]);

    const renderOrderCard = ({ item, index }) => (
        <View style={[styles.card, { zIndex: 1000 - index }]}>
            <View style={styles.rowBetween}>
                <Text style={styles.orderId}>Order #{item.id}</Text>
                <Icon name={statusIcons[item.order_status]} size={24} color="#f35353" />
            </View>
            <Text style={styles.detail}>👤 {item.customer?.full_name}</Text>
            <Text style={styles.detail}>💰 ₹{item.total_amount}</Text>
            <Text style={styles.detail}>📅 {item.ordered_at}</Text>

            {/* Order Items */}
            <View style={{ marginTop: 6, marginBottom: 10 }}>
                {item.items?.map((food, idx) => (
                    <View key={idx} style={styles.itemRow}>
                        <Text style={styles.itemText}>🍽️ {food.name}</Text>
                        <Text style={styles.itemText}>Qty: {food.quantity}</Text>
                        <Text style={styles.itemText}>₹{food.price}</Text>
                    </View>
                ))}
            </View>

            {/* Order Status Section */}
            <View style={styles.statusSection}>
                <Text style={styles.sectionLabel}>Order Status:</Text>
            <View style={{ zIndex: 99 + index, elevation: 5 }}>
                <DropDownPicker
                    open={dropdownState[item.id]?.open || false}
                    value={dropdownState[item.id]?.value || item.order_status}
                        items={validStatuses.map(s => ({ 
                            label: s.replace(/_/g, ' ').toUpperCase(), 
                            value: s 
                        }))}
                    setOpen={open => setDropdownState(prev => ({
                        ...prev,
                        [item.id]: { ...prev[item.id], open }
                    }))}
                    setValue={callback => {
                        const selected = callback(dropdownState[item.id]?.value || item.order_status);
                        setDropdownState(prev => ({
                            ...prev,
                            [item.id]: { ...prev[item.id], value: selected }
                        }));
                            updateStatus(item.id, selected, item.order_status);
                    }}
                        containerStyle={{ marginTop: 5 }}
                    dropDownDirection='TOP'
                        style={{ 
                            backgroundColor: '#fff', 
                            borderColor: '#ddd',
                            borderWidth: 1,
                            zIndex: 99999 + index 
                        }}
                        dropDownContainerStyle={{ 
                            backgroundColor: '#fafafa',
                            zIndex: 99999 + index,
                            borderColor: '#ddd',
                        }}
                    disabled={updatingId === item.id}
                        placeholder="Select status"
                />
                </View>
            </View>

            {/* Driver Assignment Section - Only show when status is "ready" */}
            {item?.order_status === 'ready' && !item.driver_id && (
                <View style={[styles.driverSection, { zIndex: 998 - index }]}>
                    <View style={styles.driverSectionHeader}>
                        <Icon name="delivery-dining" size={20} color="#f35353" />
                        <Text style={styles.sectionLabel}>Assign Delivery Driver:</Text>
                    </View>
                    <DropDownPicker
                        open={dropdownState[`driver_${item.id}`]?.open || false}
                        value={dropdownState[`driver_${item.id}`]?.value || null}
                        items={drivers.length > 0 ? drivers : [{ label: 'No drivers available', value: null, disabled: true }]}
                        placeholder={drivers.length > 0 ? "Select driver" : "No drivers available"}
                        setOpen={open => setDropdownState(prev => ({
                            ...prev,
                            [`driver_${item.id}`]: { ...prev[`driver_${item.id}`], open }
                        }))}
                        setValue={callback => {
                            const selectedDriverId = callback();
                            if (selectedDriverId) {
                            setDropdownState(prev => ({
                                ...prev,
                                [`driver_${item.id}`]: { ...prev[`driver_${item.id}`], value: selectedDriverId }
                            }));
                                console.log('Assigning driver:', selectedDriverId, 'to order:', item.id);
                                assignDriver(item.id, selectedDriverId, item.order_status);
                            }
                        }}
                        dropDownDirection='TOP'
                        style={{ 
                            backgroundColor: '#fff',
                            borderColor: '#f35353',
                            borderWidth: 1,
                            marginTop: 5,
                        }}
                        dropDownContainerStyle={{ 
                            backgroundColor: '#fafafa',
                            borderColor: '#ddd',
                        }}
                        listMode="SCROLLVIEW"
                        disabled={drivers.length === 0}
                    />
                    {drivers.length === 0 && (
                        <Text style={styles.warningText}>⚠️ No drivers available. Please add drivers first.</Text>
                    )}
                </View>
            )}

            {/* Driver Info Section - Show when driver is assigned */}
            {item.driver_id && (
                <View style={styles.driverInfoContainer}>
                    <View style={styles.driverSectionHeader}>
                        <Icon name="delivery-dining" size={20} color="#28a745" />
                        <Text style={styles.driverInfoText}>
                            {item.driver?.full_name || `Driver #${item.driver_id}`}
                        </Text>
                    </View>
                    {driverLocations[item.driver_id] && (
                        <View style={styles.driverLocationRow}>
                            <Icon name="location-on" size={16} color="#007bff" />
                            <Text style={styles.driverLocationText}>
                                Live Location Available
                            </Text>
                        </View>
                    )}
                    <TouchableOpacity
                        style={styles.trackButton}
                        onPress={() => navigation.navigate('TrackDriverScreen', {
                            orderId: item.id,
                            driverId: item.driver_id,
                            driverName: item.driver?.full_name || `Driver #${item.driver_id}`,
                            customerName: item.customer?.full_name,
                            deliveryAddress: item.delivery_address || item.address,
                        })}
                    >
                        <Icon name="my-location" size={18} color="#fff" />
                        <Text style={styles.trackButtonText}>Track Driver</Text>
                    </TouchableOpacity>
                </View>
            )}
        </View>
    );

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Manage Orders ({statusFilter.replace(/_/g, ' ')})</Text>

            <TextInput
                placeholder={`Search by customer name... ${loading}`}
                value={search}
                onChangeText={onSearch}
                style={styles.searchBar}
            />

            <View style={styles.filterContainer}>
                {['placed', 'accepted', 'preparing', 'ready', 'on_the_way', 'delivered'].map(status => (
                    <TouchableOpacity
                        key={status}
                        onPress={() => setStatusFilter(status)}
                        style={[styles.filterButton, statusFilter === status && styles.activeFilterBtn]}>
                        <Text style={[styles.filterText, statusFilter === status && styles.activeFilterText]}>
                            {status.replace(/_/g, ' ')}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>
            {loading ? (
                <ActivityIndicator size="large" color="#f35353" />
            ) : (
                <FlatList
                    style={{ flex: 1, height: Dimensions.get('window').height }}
                    contentContainerStyle={{ flexGrow: 1 }}
                    data={filteredOrders.length > 0 ? filteredOrders : orders}
                    keyExtractor={item => item.id.toString()}
                    renderItem={renderOrderCard}
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Icon name="inbox" size={48} color="#ccc" />
                            <Text style={styles.emptyText}>No orders found</Text>
                            {search && (
                                <Text style={styles.emptySubText}>Try adjusting your search</Text>
                            )}
                        </View>
                    }
                    refreshing={loading}
                    onRefresh={() => fetchOrders(true)}
                />
            )}
        </View>
    );
};

export default OrderStatusScreen;

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff', padding: 10 },
    title: { fontSize: 22, fontWeight: 'bold', marginBottom: 10, color: '#333' },
    searchBar: {
        borderWidth: 1, borderColor: '#ccc', borderRadius: 10,
        paddingHorizontal: 12, marginBottom: 10
    },
    filterContainer: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 10 },
    filterButton: {
        paddingHorizontal: 12, paddingVertical: 6,
        borderRadius: 20, backgroundColor: '#eee', margin: 4
    },
    activeFilterBtn: { backgroundColor: '#f35353' },
    filterText: { fontSize: 13, color: '#555' },
    activeFilterText: { color: '#fff', fontWeight: 'bold' },
    card: {
        backgroundColor: '#fafafa', padding: 15, borderRadius: 10,
        marginBottom: 12, elevation: 1, borderColor: '#ddd', borderWidth: 1
    },
    orderId: { fontSize: 16, fontWeight: 'bold', marginBottom: 5 },
    detail: { fontSize: 14, color: '#333', marginBottom: 2 },
    rowBetween: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'
    },
    itemRow: {
        flexDirection: 'row', justifyContent: 'space-between',
        paddingVertical: 2, borderBottomColor: '#ddd', borderBottomWidth: 1,
    },
    itemText: {
        fontSize: 13, color: '#444', flex: 1,
    },
    driverInfoContainer: {
        backgroundColor: '#e8f5e9',
        padding: 12,
        borderRadius: 8,
        marginTop: 10,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: '#c8e6c9',
    },
    driverInfoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 6,
    },
    driverInfoText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#2e7d32',
        marginLeft: 8,
    },
    driverLocationRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    driverLocationText: {
        fontSize: 12,
        color: '#007bff',
        marginLeft: 6,
        fontStyle: 'italic',
    },
    trackButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#28a745',
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 6,
        marginTop: 4,
    },
    trackButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        marginLeft: 6,
        fontSize: 14,
    },
    assignDriverLabel: {
        fontSize: 12,
        color: '#666',
        marginBottom: 4,
        fontWeight: '500',
    },
    statusSection: {
        marginTop: 10,
        marginBottom: 10,
        padding: 12,
        backgroundColor: '#f8f9fa',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#e9ecef',
    },
    driverSection: {
        marginTop: 10,
        marginBottom: 10,
        padding: 12,
        backgroundColor: '#fff3cd',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#ffc107',
    },
    driverSectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    sectionLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
        marginLeft: 8,
    },
    warningText: {
        fontSize: 12,
        color: '#856404',
        marginTop: 5,
        fontStyle: 'italic',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 60,
    },
    emptyText: {
        fontSize: 18,
        color: '#999',
        marginTop: 16,
        fontWeight: '500',
    },
    emptySubText: {
        fontSize: 14,
        color: '#bbb',
        marginTop: 8,
    },
});
