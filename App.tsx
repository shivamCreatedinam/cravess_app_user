/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, { useEffect, useState } from 'react';
import type { PropsWithChildren } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  useColorScheme,
  View,
  TouchableOpacity,
  Alert,
  Platform,
} from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import firebase from '@react-native-firebase/app';
import crashlytics, { FirebaseCrashlyticsTypes } from '@react-native-firebase/crashlytics';
import database from '@react-native-firebase/database';
import messaging from '@react-native-firebase/messaging';
import SplashScreen from 'react-native-splash-screen';
import { Animated } from 'react-native';
import ErrorBoundary from './src/components/ErrorBoundary';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from './store';
import SocketProvider from './src/services/SocketService/SocketProvider';
import { ThemeProvider } from './src/theme/ThemeProvider';
import { StringsProvider } from './src/services/StringsService/StringsProvider';
import Toast from 'react-native-toast-message';
import Navigation from './src/route/navigation';

import {
  Colors,
  DebugInstructions,
  Header,
  LearnMoreLinks,
  ReloadInstructions,
} from 'react-native/Libraries/NewAppScreen';

type SectionProps = PropsWithChildren<{
  title: string;
}>;

function Section({ children, title }: SectionProps): React.JSX.Element {
  const isDarkMode = useColorScheme() === 'dark';
  return (
    <View style={styles.sectionContainer}>
      <Text
        style={[
          styles.sectionTitle,
          {
            color: isDarkMode ? Colors.white : Colors.black,
          },
        ]}>
        {title}
      </Text>
      <Text
        style={[
          styles.sectionDescription,
          {
            color: isDarkMode ? Colors.light : Colors.dark,
          },
        ]}>
        {children}
      </Text>
    </View>
  );
}

function App(): React.JSX.Element {
  const isDarkMode = useColorScheme() === 'dark';
  const [fcmToken, setFcmToken] = useState<string | null>(null);
  const [notificationPermission, setNotificationPermission] = useState<string>('checking');

  useEffect(() => {
    // Initialize Firebase and log app info
    const app = firebase.app();
    console.log('Firebase initialized:', app.name);
    console.log('Firebase options:', app.options);

    // Get Crashlytics instance once to avoid repeated calls
    const crashlyticsInstance = crashlytics();

    // Initialize Crashlytics
    crashlyticsInstance.setCrashlyticsCollectionEnabled(true);

    // Set user identifier (example)
    crashlyticsInstance.setUserId('test-user-123');

    // Set custom attributes (using the instance to reduce warnings)
    crashlyticsInstance.setAttribute('app_version', '1.0.0');
    crashlyticsInstance.setAttribute('platform', 'react-native');
    crashlyticsInstance.setAttribute('test_mode', 'true');

    // Log initial event
    crashlyticsInstance.log('App initialized - Crashlytics ready');

    console.log('Crashlytics initialized with test attributes');

    // Initialize Firebase Cloud Messaging
    initializeMessaging();

    // Hide native splash screen after app is fully initialized
    // This ensures smooth transition from native splash to React Native app
    const hideSplashTimer = setTimeout(() => {
      SplashScreen.hide();
    }, 1500); // Hide after 1.5 seconds to allow smooth transition

    return () => {
      clearTimeout(hideSplashTimer);
    };
  }, []);

  // Initialize Firebase Cloud Messaging
  const initializeMessaging = async () => {
    try {
      // Request notification permissions
      const authStatus = await messaging().requestPermission();
      const enabled =
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL;

      if (enabled) {
        setNotificationPermission('granted');
        console.log('Notification permission granted');

        // Get FCM token
        const token = await messaging().getToken();
        if (token) {
          setFcmToken(token);
          console.log('FCM Token:', token);

          // Save token to database for testing
          await database().ref('/fcm_tokens').push({
            token: token,
            platform: Platform.OS,
            timestamp: new Date().toISOString(),
          });
        }

        // Handle foreground messages
        const unsubscribeForeground = messaging().onMessage(async remoteMessage => {
          console.log('Foreground message received:', remoteMessage);
          Alert.alert(
            remoteMessage.notification?.title || 'New Message',
            remoteMessage.notification?.body || 'You have a new message',
            [{ text: 'OK' }]
          );
        });

        // Handle background/quit state messages
        messaging().setBackgroundMessageHandler(async remoteMessage => {
          console.log('Background message received:', remoteMessage);
        });

        // Handle notification opened app
        messaging()
          .getInitialNotification()
          .then(remoteMessage => {
            if (remoteMessage) {
              console.log('Notification opened app:', remoteMessage);
            }
          });

        // Handle notification when app is in background
        messaging().onNotificationOpenedApp(remoteMessage => {
          console.log('Notification opened app from background:', remoteMessage);
          Alert.alert(
            'Notification Opened',
            `You opened a notification: ${remoteMessage.notification?.title}`,
            [{ text: 'OK' }]
          );
        });

        return () => {
          unsubscribeForeground();
        };
      } else {
        setNotificationPermission('denied');
        console.log('Notification permission denied');
      }
    } catch (error) {
      console.error('Error initializing messaging:', error);
      setNotificationPermission('error');
    }
  };

  // Function to send a test Crashlytics event
  const sendTestEvent = () => {
    try {
      // Get Crashlytics instance
      const crashlyticsInstance = crashlytics();

      // Log an event
      crashlyticsInstance.log('Test event button clicked');

      // Set additional attributes
      crashlyticsInstance.setAttribute('last_action', 'test_event');
      crashlyticsInstance.setAttribute('timestamp', new Date().toISOString());

      // Record a non-fatal error
      const testError = new Error('This is a test non-fatal error');
      crashlyticsInstance.recordError(testError);

      Alert.alert(
        'Crashlytics Event Sent',
        'Test event has been sent to Crashlytics. Check Firebase Console to see the event.',
        [{ text: 'OK' }]
      );
    } catch (error) {
      console.error('Error sending Crashlytics event:', error);
      Alert.alert('Error', 'Failed to send Crashlytics event');
    }
  };

  // Function to force a test crash
  const testCrash = () => {
    Alert.alert(
      'Test Crash',
      'This will force the app to crash. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Crash',
          style: 'destructive',
          onPress: () => {
            // Get Crashlytics instance
            const crashlyticsInstance = crashlytics();

            // Log before crashing
            crashlyticsInstance.log('User triggered test crash');
            crashlyticsInstance.setAttribute('crash_type', 'test_crash');

            // Force a crash
            crashlyticsInstance.crash();
          },
        },
      ]
    );
  };

  // Function to get FCM token
  const getFCMToken = async () => {
    try {
      const token = await messaging().getToken();
      if (token) {
        setFcmToken(token);
        Alert.alert(
          'FCM Token',
          `Token: ${token.substring(0, 50)}...\n\nToken copied to clipboard and saved to database.`,
          [{ text: 'OK' }]
        );
        console.log('FCM Token:', token);

        // Save token to database
        await database().ref('/fcm_tokens').push({
          token: token,
          platform: Platform.OS,
          timestamp: new Date().toISOString(),
        });
      } else {
        Alert.alert('Error', 'Failed to get FCM token');
      }
    } catch (error) {
      console.error('Error getting FCM token:', error);
      Alert.alert('Error', `Failed to get token: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  // Function to delete FCM token
  const deleteFCMToken = async () => {
    try {
      await messaging().deleteToken();
      setFcmToken(null);
      Alert.alert('Success', 'FCM token deleted');
      console.log('FCM token deleted');
    } catch (error) {
      console.error('Error deleting FCM token:', error);
      Alert.alert('Error', 'Failed to delete token');
    }
  };

  // Function to send dummy data to Firebase Realtime Database
  const sendDummyDataToDatabase = async () => {
    try {
      const databaseRef = database().ref('/restaurant');

      // Create dummy restaurant data
      const dummyData = {
        name: 'Cravess Restro',
        location: {
          address: '123 Main Street',
          city: 'Mumbai',
          state: 'Maharashtra',
          country: 'India',
          coordinates: {
            latitude: 19.0760,
            longitude: 72.8777,
          },
        },
        contact: {
          phone: '+91-1234567890',
          email: 'info@cravessrestro.com',
          website: 'https://www.cravessrestro.com',
        },
        menu: {
          categories: [
            {
              id: 'cat1',
              name: 'Appetizers',
              items: [
                {
                  id: 'item1',
                  name: 'Spring Rolls',
                  price: 150,
                  description: 'Crispy vegetable spring rolls',
                  available: true,
                },
                {
                  id: 'item2',
                  name: 'Chicken Wings',
                  price: 250,
                  description: 'Spicy chicken wings',
                  available: true,
                },
              ],
            },
            {
              id: 'cat2',
              name: 'Main Course',
              items: [
                {
                  id: 'item3',
                  name: 'Butter Chicken',
                  price: 350,
                  description: 'Creamy butter chicken curry',
                  available: true,
                },
                {
                  id: 'item4',
                  name: 'Biryani',
                  price: 300,
                  description: 'Fragrant basmati rice with spices',
                  available: true,
                },
              ],
            },
          ],
        },
        hours: {
          monday: { open: '11:00', close: '22:00' },
          tuesday: { open: '11:00', close: '22:00' },
          wednesday: { open: '11:00', close: '22:00' },
          thursday: { open: '11:00', close: '22:00' },
          friday: { open: '11:00', close: '23:00' },
          saturday: { open: '11:00', close: '23:00' },
          sunday: { open: '12:00', close: '22:00' },
        },
        ratings: {
          average: 4.5,
          total: 1250,
          breakdown: {
            5: 800,
            4: 300,
            3: 100,
            2: 30,
            1: 20,
          },
        },
        metadata: {
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          version: '1.0.0',
          testData: true,
        },
      };

      // Send data to Firebase Realtime Database
      await databaseRef.set(dummyData);

      // Also create a timestamped entry for tracking
      const timestamp = Date.now();
      await database().ref(`/restaurant/updates/${timestamp}`).set({
        action: 'data_updated',
        timestamp: new Date().toISOString(),
        source: 'mobile_app',
      });

      Alert.alert(
        'Success',
        'Dummy data has been sent to Firebase Realtime Database!\n\nCheck Firebase Console → Realtime Database to view the data.',
        [{ text: 'OK' }]
      );

      console.log('Dummy data sent to Firebase Realtime Database:', dummyData);
    } catch (error) {
      console.error('Error sending data to database:', error);
      Alert.alert(
        'Error',
        `Failed to send data to database: ${error instanceof Error ? error.message : 'Unknown error'}`,
        [{ text: 'OK' }]
      );
    }
  };

  // Animated values using React Native's Animated API
  const scaleAnim = React.useRef(new Animated.Value(0.8)).current;
  const opacityAnim = React.useRef(new Animated.Value(0)).current;

  // Animate on mount
  React.useEffect(() => {
    Animated.parallel([
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
          <ErrorBoundary>
            <ThemeProvider>
              <StringsProvider>
                <SocketProvider>
                  <Navigation />
                  <Toast />
                </SocketProvider>
              </StringsProvider>
            </ThemeProvider>
          </ErrorBoundary>
        </PersistGate>
      </Provider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  sectionContainer: {
    marginTop: 32,
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '600',
  },
  sectionDescription: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: '400',
  },
  highlight: {
    fontWeight: '700',
  },
  buttonContainer: {
    paddingHorizontal: 24,
    marginTop: 16,
    marginBottom: 16,
    gap: 12,
  },
  button: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 50,
  },
  eventButton: {
    backgroundColor: '#007AFF',
  },
  crashButton: {
    backgroundColor: '#FF3B30',
  },
  databaseButton: {
    backgroundColor: '#34C759',
  },
  messagingButton: {
    backgroundColor: '#5856D6',
  },
  deleteButton: {
    backgroundColor: '#FF9500',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  tokenText: {
    marginTop: 8,
    fontSize: 12,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    color: '#666',
  },
  successText: {
    color: '#34C759',
    fontWeight: '600',
  },
  errorText: {
    color: '#FF3B30',
    fontWeight: '600',
  },
});

export default App;
