import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import database from '@react-native-firebase/database';
import AsyncStorage from '@react-native-async-storage/async-storage';

const StringsContext = createContext(null);

const STRINGS_STORAGE_KEY = '@app_strings';
const FIREBASE_STRINGS_PATH = 'app_strings';

// Default fallback strings
const defaultStrings = {
  navigation: {
    home: 'Home',
    orders: 'Orders',
    menu: 'Menu',
    profile: 'Profile',
  },
  home: {
    welcome: 'Good Morning!',
    dashboardOverview: 'Dashboard Overview',
    monthlyRevenue: 'Monthly Revenue',
    revenueSubtext: 'Revenue in last 30 days',
    inventorySummary: 'Inventory Summary',
    activeItems: 'Active Items',
    outOfStock: 'Out of Stock',
    recentOrders: 'Recent Orders',
    seeAll: 'See All',
    noRecentOrders: 'No recent orders',
    quickActions: 'Quick Actions',
    manageMenu: 'Manage Menu',
    viewOrders: 'View Orders',
    settings: 'Settings',
    onlineStatus: 'Online - Accepting Orders',
    offlineStatus: 'Offline - Not Accepting Orders',
    loadingDashboard: 'Loading dashboard...',
  },
  orders: {
    totalOrders: 'Total Orders',
    confirmed: 'Confirmed',
    cancelled: 'Cancelled',
    pending: 'Pending',
    delivered: 'Delivered',
    totalIncome: 'Total Income',
    onlineIncome: 'Online Income',
    codIncome: 'COD Income',
  },
  profile: {
    editProfile: 'Edit Profile',
    restaurantSettings: 'Restaurant Settings',
    paymentSettings: 'Payment Settings',
    orderHistory: 'Order History',
    notifications: 'Notifications',
    helpSupport: 'Help & Support',
    about: 'About',
    logout: 'Logout',
    totalOrders: 'Total Orders',
    totalRevenue: 'Total Revenue',
    avgRating: 'Avg Rating',
    contactInformation: 'Contact Information',
  },
  menu: {
    myMenu: 'My Menu',
    itemsAvailable: 'items available',
    allItems: 'All Items',
    addNewItem: 'Add New Item',
    noItemsInCategory: 'No items in this category',
    loadingMenu: 'Loading menu...',
  },
  common: {
    loading: 'Loading...',
    error: 'Error',
    success: 'Success',
    cancel: 'Cancel',
    save: 'Save',
    delete: 'Delete',
    edit: 'Edit',
    add: 'Add',
    update: 'Update',
    close: 'Close',
    back: 'Back',
    next: 'Next',
    done: 'Done',
    yes: 'Yes',
    no: 'No',
    ok: 'OK',
  },
};

export const StringsProvider = ({ children }) => {
  const [strings, setStrings] = useState(defaultStrings);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadStrings = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Try to load from cache first
      try {
        const cachedStrings = await AsyncStorage.getItem(STRINGS_STORAGE_KEY);
        if (cachedStrings) {
          const parsed = JSON.parse(cachedStrings);
          setStrings({ ...defaultStrings, ...parsed });
        }
      } catch (cacheError) {
        console.log('Error loading cached strings:', cacheError);
      }

      // Fetch from Firebase
      const snapshot = await database().ref(FIREBASE_STRINGS_PATH).once('value');
      const firebaseStrings = snapshot.val();

      if (firebaseStrings) {
        // Merge with defaults (Firebase strings override defaults)
        const mergedStrings = deepMerge(defaultStrings, firebaseStrings);
        setStrings(mergedStrings);

        // Cache the strings
        await AsyncStorage.setItem(STRINGS_STORAGE_KEY, JSON.stringify(mergedStrings));
      } else {
        // If no Firebase data, use defaults
        setStrings(defaultStrings);
      }
    } catch (err) {
      console.error('Error loading strings from Firebase:', err);
      setError(err);
      // Use cached or default strings on error
      try {
        const cachedStrings = await AsyncStorage.getItem(STRINGS_STORAGE_KEY);
        if (cachedStrings) {
          setStrings({ ...defaultStrings, ...JSON.parse(cachedStrings) });
        }
      } catch (cacheError) {
        // Use defaults if cache also fails
        setStrings(defaultStrings);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  // Listen for real-time updates
  useEffect(() => {
    loadStrings();

    // Set up real-time listener
    const ref = database().ref(FIREBASE_STRINGS_PATH);
    const listener = ref.on('value', async (snapshot) => {
      try {
        const firebaseStrings = snapshot.val();
        if (firebaseStrings) {
          const mergedStrings = deepMerge(defaultStrings, firebaseStrings);
          setStrings(mergedStrings);
          await AsyncStorage.setItem(STRINGS_STORAGE_KEY, JSON.stringify(mergedStrings));
        }
      } catch (err) {
        console.error('Error updating strings from Firebase:', err);
      }
    });

    return () => {
      ref.off('value', listener);
    };
  }, [loadStrings]);

  const refreshStrings = useCallback(() => {
    loadStrings();
  }, [loadStrings]);

  const getString = useCallback((path) => {
    const keys = path.split('.');
    let value = strings;
    
    for (const key of keys) {
      if (value && typeof value === 'object' && key in value) {
        value = value[key];
      } else {
        // Return the path as fallback if not found
        return path;
      }
    }
    
    return typeof value === 'string' ? value : path;
  }, [strings]);

  return (
    <StringsContext.Provider value={{ strings, getString, loading, error, refreshStrings }}>
      {children}
    </StringsContext.Provider>
  );
};

// Deep merge utility
function deepMerge(defaultObj, firebaseObj) {
  const result = { ...defaultObj };
  
  for (const key in firebaseObj) {
    if (firebaseObj.hasOwnProperty(key)) {
      if (
        typeof firebaseObj[key] === 'object' &&
        !Array.isArray(firebaseObj[key]) &&
        defaultObj[key] &&
        typeof defaultObj[key] === 'object' &&
        !Array.isArray(defaultObj[key])
      ) {
        result[key] = deepMerge(defaultObj[key], firebaseObj[key]);
      } else {
        result[key] = firebaseObj[key];
      }
    }
  }
  
  return result;
}

export const useStrings = () => {
  const context = useContext(StringsContext);
  if (!context) {
    throw new Error('useStrings must be used within StringsProvider');
  }
  return context;
};

export default StringsContext;

