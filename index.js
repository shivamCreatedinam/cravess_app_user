/**
 * @format
 */

// IMPORTANT: react-native-gesture-handler MUST be imported first, before anything else
import 'react-native-gesture-handler';

import {AppRegistry, LogBox} from 'react-native';
import App from './App';
import {name as appName} from './app.json';
import '@react-native-firebase/app';
import messaging from '@react-native-firebase/messaging';
import {setupGlobalErrorHandler} from './src/utils/errorHandler';

// Ignore specific warnings
LogBox.ignoreLogs([
  'Setting a timer for a long period of time',
  'Require cycle:',
  'Module requires',
]);

// Setup global error handler to catch unhandled errors
setupGlobalErrorHandler();

// Register background handler for Android
messaging().setBackgroundMessageHandler(async remoteMessage => {
  console.log('Message handled in the background!', remoteMessage);
});

AppRegistry.registerComponent(appName, () => App);
