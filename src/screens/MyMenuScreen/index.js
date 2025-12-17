import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Image,
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
import { useAppStrings } from '../../hooks/useAppStrings';

const MyMenuScreen = () => {
  const navigation = useNavigation();
  const user = useSelector((state) => state?.userInfo?.user);
  const { getString } = useAppStrings();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [categories, setCategories] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Fetch categories and menu items
  const fetchMenuData = async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    try {
      // Fetch categories
      const categoriesRes = await AxiosClient.get(`menu/categories-by-restaurant/${user.id}`);
      const categoryList = categoriesRes.data?.data || [];
      
      // Add "All Items" option
      const allCategories = [
        { id: 'all', name: getString('menu.allItems'), icon: 'grid-outline' },
        ...categoryList.map(cat => ({
          id: cat.id,
          name: cat.name,
          icon: 'restaurant-outline',
          ...cat
        }))
      ];
      setCategories(allCategories);

      // Fetch all food items for all categories
      const allItems = [];
      for (const category of categoryList) {
        try {
          const itemsRes = await AxiosClient.get(`menu/categories/${user.id}`);
          const items = itemsRes.data?.data || [];
          // Find the category in the response and get its food_items
          const categoryData = items.find(cat => cat.id === category.id);
          if (categoryData?.food_items) {
            allItems.push(...categoryData.food_items.map(item => ({
              ...item,
              category_id: category.id,
              category_name: category.name,
            })));
          }
        } catch (error) {
          console.error(`Error fetching items for category ${category.id}:`, error);
        }
      }
      setMenuItems(allItems);
    } catch (error) {
      console.error('Error fetching menu data:', error);
      Alert.alert('Error', 'Failed to load menu. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchMenuData();
    }, [user?.id])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchMenuData();
  };

  const filteredItems = selectedCategory === 'all'
    ? menuItems
    : menuItems.filter(item => item.category_id === selectedCategory || item.category_id?.toString() === selectedCategory?.toString());

  const renderMenuItem = ({ item }) => (
    <TouchableOpacity
      style={styles.menuItemCard}
      onPress={() => navigation.navigate('CategoryDetailsScreen', { 
        id: item.category_id,
        name: item.category_name || 'Category',
        food_items: [item]
      })}
    >
      <Image
        source={item.image ? { uri: item.image } : require('../../assets/bibimbap.png')}
        style={styles.menuItemImage}
        resizeMode="cover"
      />
      <View style={styles.menuItemContent}>
        <View style={styles.menuItemHeader}>
          <View style={styles.menuItemInfo}>
            <Text style={styles.menuItemName}>{item.name}</Text>
            <Text style={styles.menuItemDescription} numberOfLines={2}>
              {item.description || 'No description available'}
            </Text>
            {item.category_name && (
              <Text style={styles.categoryName}>{item.category_name}</Text>
            )}
          </View>
          {item.is_available === false && (
            <View style={styles.unavailableBadge}>
              <Text style={styles.unavailableText}>Unavailable</Text>
            </View>
          )}
        </View>

        <View style={styles.menuItemFooter}>
          <View>
            <Text style={styles.priceLabel}>Price</Text>
            <Text style={styles.priceText}>${parseFloat(item.price || 0).toFixed(2)}</Text>
          </View>
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => navigation.navigate('AddFoodItemScreen')}
          >
            <Icon name="create-outline" size={18} color={theme.color.primary.main} />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.color.primary.white} />
      
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>{getString('menu.myMenu')}</Text>
          <Text style={styles.headerSubtitle}>{menuItems.length} {getString('menu.itemsAvailable')}</Text>
        </View>
        <View style={styles.headerButtons}>
          <TouchableOpacity
            style={[styles.addButton, styles.addButtonSmall]}
            onPress={() => navigation.navigate('AddCategoryScreen')}
          >
            <Icon name="folder-add-outline" size={20} color={theme.color.primary.white} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => navigation.navigate('AddFoodItemScreen')}
          >
            <Icon name="add" size={24} color={theme.color.primary.white} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Category Filters */}
      <View style={styles.categoryContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryScroll}
        >
          {categories.map((category) => (
            <TouchableOpacity
              key={category.id}
              style={[
                styles.categoryButton,
                selectedCategory === category.id && styles.categoryButtonActive,
              ]}
              onPress={() => setSelectedCategory(category.id)}
            >
              <Icon
                name={category.icon}
                size={20}
                color={selectedCategory === category.id ? theme.color.primary.white : theme.color.text.secondary}
              />
              <Text
                style={[
                  styles.categoryText,
                  selectedCategory === category.id && styles.categoryTextActive,
                ]}
              >
                {category.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Menu Items List */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.color.primary.main} />
          <Text style={styles.loadingText}>{getString('menu.loadingMenu')}</Text>
        </View>
      ) : (
        <FlatList
          data={filteredItems}
          renderItem={renderMenuItem}
          keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          numColumns={2}
          columnWrapperStyle={styles.row}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Icon name="restaurant-outline" size={64} color={theme.color.text.tertiary} />
              <Text style={styles.emptyStateText}>{getString('menu.noItemsInCategory')}</Text>
              <TouchableOpacity
                style={styles.addItemButton}
                onPress={() => navigation.navigate('AddFoodItemScreen')}
              >
                <Text style={styles.addItemButtonText}>{getString('menu.addNewItem')}</Text>
              </TouchableOpacity>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  headerSubtitle: {
    fontSize: 14,
    color: theme.color.text.secondary,
    marginTop: 4,
  },
  headerButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  addButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: theme.color.primary.main,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonSmall: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  categoryContainer: {
    backgroundColor: theme.color.primary.white,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.color.other.border,
  },
  categoryScroll: {
    paddingHorizontal: 20,
    gap: 8,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: theme.color.secondary.light,
    marginRight: 8,
    gap: 6,
  },
  categoryButtonActive: {
    backgroundColor: theme.color.primary.main,
  },
  categoryText: {
    fontSize: 14,
    color: theme.color.text.secondary,
  },
  categoryTextActive: {
    color: theme.color.primary.white,
  },
  listContent: {
    padding: 12,
  },
  row: {
    justifyContent: 'space-between',
  },
  menuItemCard: {
    width: '48%',
    backgroundColor: theme.color.primary.white,
    borderRadius: 12,
    marginBottom: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: theme.color.other.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  menuItemImage: {
    width: '100%',
    height: 120,
    backgroundColor: theme.color.secondary.light,
  },
  menuItemContent: {
    padding: 12,
  },
  menuItemHeader: {
    marginBottom: 8,
  },
  menuItemInfo: {
    marginBottom: 4,
  },
  menuItemName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.color.text.primary,
    marginBottom: 4,
  },
  menuItemDescription: {
    fontSize: 12,
    color: theme.color.text.tertiary,
  },
  unavailableBadge: {
    alignSelf: 'flex-start',
    backgroundColor: theme.color.system.error + '20',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginTop: 4,
  },
  unavailableText: {
    fontSize: 10,
    color: theme.color.system.error,
    fontWeight: '600',
  },
  menuItemFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: theme.color.other.divider + '30',
  },
  priceLabel: {
    fontSize: 10,
    color: theme.color.text.tertiary,
  },
  priceText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.color.text.primary,
    marginTop: 2,
  },
  timeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  timeText: {
    fontSize: 11,
    color: theme.color.text.tertiary,
  },
  editButton: {
    padding: 6,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: theme.color.text.secondary,
  },
  categoryName: {
    fontSize: 11,
    color: theme.color.text.tertiary,
    marginTop: 4,
    fontStyle: 'italic',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    width: '100%',
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.color.text.secondary,
    marginTop: 16,
  },
  addItemButton: {
    marginTop: 20,
    backgroundColor: theme.color.primary.main,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  addItemButtonText: {
    color: theme.color.primary.white,
    fontSize: 14,
    fontWeight: '600',
  },
});

export default MyMenuScreen;

