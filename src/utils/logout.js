import AsyncStorage from '@react-native-async-storage/async-storage';
import { store, persistor } from '../../store';
import { clearUser } from '../features/userInfoSlice';
import { clearToken } from '../features/userSlice';
import { clearCart } from '../features/cartSlice';
import { clearAddress } from '../features/addressSlice';
import { clearLocation } from '../features/locationSlice';
import { clearSocket } from '../features/socketSlice';
import socketService from '../services/SocketService/SocketService';

/**
 * Complete logout function that clears all data and resets the store
 * @param {Function} navigation - Navigation object to navigate after logout
 * @param {string} navigateTo - Screen name to navigate to (default: 'LoginScreen')
 * @returns {Promise<void>}
 */
export const logout = async (navigation, navigateTo = 'LoginScreen') => {
  try {
    // 1. Disconnect socket connection
    if (socketService.isSocketConnected()) {
      socketService.disconnect();
    }

    // 2. Clear all Redux slices
    store.dispatch(clearUser());
    store.dispatch(clearToken());
    store.dispatch(clearCart());
    store.dispatch(clearAddress());
    store.dispatch(clearLocation());
    store.dispatch(clearSocket());

    // 3. Purge redux-persist store
    await persistor.purge();

    // 4. Clear AsyncStorage completely
    await AsyncStorage.clear();

    // 5. Navigate to login/splash screen
    if (navigation) {
      // Reset navigation stack and navigate to login
      navigation.reset({
        index: 0,
        routes: [{ name: navigateTo }],
      });
    }

    console.log('Logout successful: All data cleared and store reset');
  } catch (error) {
    console.error('Error during logout:', error);
    // Even if there's an error, try to navigate
    if (navigation) {
      navigation.reset({
        index: 0,
        routes: [{ name: navigateTo }],
      });
    }
    throw error;
  }
};

export default logout;

