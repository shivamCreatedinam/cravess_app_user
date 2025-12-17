import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    FlatList,
    TextInput,
    TouchableOpacity,
    ActivityIndicator,
    SafeAreaView,
} from 'react-native';
import axios from 'axios';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { format } from 'date-fns';

const OrderHistoryScreen = ({ route }) => {
    const { role, user_id, restaurant_id, driver_id } = route.params;

    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [fromDate, setFromDate] = useState(null);
    const [toDate, setToDate] = useState(null);
    const [isDatePickerVisible, setDatePickerVisible] = useState(false);
    const [isSelectingFrom, setIsSelectingFrom] = useState(true);

    const fetchOrders = async () => {
        setLoading(true);
        try {
            const params = {
                role,
                page,
                limit: 10,
                ...(role === 'user' && { user_id }),
                ...(role === 'restaurant' && { restaurant_id }),
                ...(role === 'driver' && { driver_id }),
                ...(search && { search }),
                ...(fromDate && { from: fromDate }),
                ...(toDate && { to: toDate }),
            };

            const response = await axios.get('https://cravess.createdinam.com/api/v1/menu/orders/history', { params });

            if (response.data.status) {
                setOrders(response.data.data);
            }
        } catch (error) {
            console.error('Failed to fetch orders', error);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchOrders();
    }, [page, fromDate, toDate, search]);

    const handleConfirmDate = (date) => {
        const formatted = format(date, 'yyyy-MM-dd');
        if (isSelectingFrom) setFromDate(formatted);
        else setToDate(formatted);
        setDatePickerVisible(false);
    };

    const renderOrder = ({ item }) => (
        <View style={{
            margin: 10,
            padding: 15,
            backgroundColor: '#fff',
            borderRadius: 12,
            shadowColor: '#000',
            shadowOpacity: 0.1,
            shadowRadius: 6,
            elevation: 3,
        }}>
            <Text style={{ fontWeight: 'bold', fontSize: 16 }}>{item.restaurant_name}</Text>
            <Text style={{ color: 'gray' }}>Invoice: {item.invoice_number}</Text>
            <Text>Total: ₹{item.total_amount}</Text>
            <Text>Status: {item.order_status}</Text>
            <Text>Date: {item.ordered_at}</Text>
        </View>
    );

    return (
        <SafeAreaView style={{ flex: 1, padding: 10, backgroundColor: '#f6f6f6' }}>
            <View style={{ flexDirection: 'row', marginBottom: 10 }}>
                <TextInput
                    placeholder="Search by name or invoice"
                    value={search}
                    onChangeText={setSearch}
                    style={{
                        flex: 1,
                        backgroundColor: '#fff',
                        padding: 10,
                        borderRadius: 10,
                        marginRight: 5,
                    }}
                />
                <TouchableOpacity
                    onPress={() => {
                        setIsSelectingFrom(true);
                        setDatePickerVisible(true);
                    }}
                    style={{
                        backgroundColor: fromDate ? '#4CAF50' : '#e0e0e0',
                        padding: 10,
                        borderRadius: 8,
                    }}>
                    <Text style={{ color: '#000' }}>{fromDate || 'From'}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={() => {
                        setIsSelectingFrom(false);
                        setDatePickerVisible(true);
                    }}
                    style={{
                        backgroundColor: toDate ? '#4CAF50' : '#e0e0e0',
                        padding: 10,
                        borderRadius: 8,
                        marginLeft: 5,
                    }}>
                    <Text style={{ color: '#000' }}>{toDate || 'To'}</Text>
                </TouchableOpacity>
            </View>

            {loading ? (
                <ActivityIndicator size="large" />
            ) : (
                <FlatList
                    data={orders}
                    keyExtractor={(item) => item.order_id.toString()}
                    renderItem={renderOrder}
                    contentContainerStyle={{ paddingBottom: 100 }}
                />
            )}

            <DateTimePickerModal
                isVisible={isDatePickerVisible}
                mode="date"
                onConfirm={handleConfirmDate}
                onCancel={() => setDatePickerVisible(false)}
            />
        </SafeAreaView>
    );
};

export default OrderHistoryScreen;
