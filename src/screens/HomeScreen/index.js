import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    ActivityIndicator,
    TouchableOpacity,
    SafeAreaView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import HomeHeader from '../../components/HomeHeader'; // Adjust the path accordingly

const HomeScreen = () => {

    const navigation = useNavigation();
    const [data, setData] = useState([]); // To store booking data
    const [page, setPage] = useState(1); // Current page
    const [isLoading, setIsLoading] = useState(false); // Loading state
    const [hasMore, setHasMore] = useState(true); // To check if more data is available

    const ITEMS_PER_PAGE = 10; // The limit you set in the API

    useEffect(() => {
        fetchBookings();
    }, [page]);

    const fetchBookings = async () => {
        if (isLoading || !hasMore) return;

        setIsLoading(true);

        try {
            const response = await fetch(
                `https://nodeadmin.createdinam.com/bookings?page=${page}&limit=${ITEMS_PER_PAGE}`
            );
            const result = await response.json();
            console.error('result fetching bookings:', result);
            if (result.success) {
                setData((prevData) => [...prevData, ...result.data]); // Append new data
                setHasMore(page < result.pagination.totalPages); // Check if more pages exist
            }
        } catch (error) {
            console.error('Error fetching bookings:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const renderItem = ({ item, index }) => (
        <TouchableOpacity key={item.id} onPress={() => navigation.navigate('BookingAcceptScreen', { item })}>
            <View style={styles.card}>
                <Text>{index}</Text>
                <Text style={styles.title}>Booking ID: {item.id}</Text>
                <Text>Pickup: {item.pickup_location_name}</Text>
                <Text>Drop: {item.drop_location_name}</Text>
                <Text>Status: {item.status}</Text>
            </View>
        </TouchableOpacity>
    );

    const loadMore = () => {
        if (!isLoading && hasMore) {
            setPage(page + 1);
        }
    };

    const renderFooter = () => {
        return isLoading ? (
            <View style={styles.footer}>
                <ActivityIndicator size="small" color="#0000ff" />
            </View>
        ) : null;
    };

    const renderEmptyComponent = () => (
        <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No bookings found</Text>
        </View>
    );

    return (
        <SafeAreaView style={{ flex: 1 }}>
            <View style={styles.container}>
                <HomeHeader />
                <FlatList
                    data={data}
                    keyExtractor={(item, index) => item.id.toString()}
                    renderItem={renderItem}
                    onEndReached={loadMore} // Called when the end of the list is reached
                    onEndReachedThreshold={0.5} // Trigger loadMore when 50% from the bottom
                    ListFooterComponent={renderFooter} // Show loader while fetching data
                    showsVerticalScrollIndicator={false}
                    ListEmptyComponent={renderEmptyComponent()}
                />
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 0,
        backgroundColor: '#f5f5f5',
    },
    card: {
        backgroundColor: '#ffffff',
        borderRadius: 8,
        padding: 15,
        marginBottom: 10,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 8,
        elevation: 3,
    },
    title: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 5,
    },
    footer: {
        paddingVertical: 20,
        alignItems: 'center',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyText: {
        fontSize: 88,
        color: 'gray',
    },
});

export default HomeScreen;
