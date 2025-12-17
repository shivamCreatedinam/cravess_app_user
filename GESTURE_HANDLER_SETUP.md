# React Native Gesture Handler Setup

This document describes the setup and configuration of `react-native-gesture-handler` in this project.

## ✅ Setup Status

The gesture handler is fully configured and ready to use.

## 📦 Installation

The package is already installed:
```json
"react-native-gesture-handler": "^2.29.1"
```

## 🔧 Configuration

### 1. JavaScript Entry Point (`index.js`)

**CRITICAL**: The gesture handler import **MUST** be the very first import in your entry file.

```javascript
// ✅ CORRECT - Import at the very top
import 'react-native-gesture-handler';

import {AppRegistry} from 'react-native';
// ... other imports
```

### 2. App Root Component (`App.tsx`)

The app is wrapped with `GestureHandlerRootView`:

```tsx
import { GestureHandlerRootView } from 'react-native-gesture-handler';

function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      {/* Your app content */}
    </GestureHandlerRootView>
  );
}
```

### 3. Android Configuration

#### MainActivity.kt
- Already configured with proper lifecycle methods
- Autolinking handles native module registration

#### build.gradle
- Kotlin version: 1.9.24
- Java compatibility: Version 17
- Kotlin JVM target: 17

### 4. iOS Configuration

#### Podfile
- Autolinking is enabled via `use_native_modules!`
- No additional configuration needed

#### AppDelegate
- Standard React Native setup
- Gesture handler works automatically with autolinking

## 🚀 Usage

### Basic Gesture Components

```tsx
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import Animated, { useSharedValue, useAnimatedStyle } from 'react-native-reanimated';

function MyComponent() {
  const translateX = useSharedValue(0);
  
  const pan = Gesture.Pan()
    .onUpdate((e) => {
      translateX.value = e.translationX;
    });
  
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));
  
  return (
    <GestureDetector gesture={pan}>
      <Animated.View style={animatedStyle}>
        {/* Your content */}
      </Animated.View>
    </GestureDetector>
  );
}
```

### With React Navigation

Gesture handler is required for React Navigation. It's already set up:

```tsx
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

// Works automatically with gesture handler
const Stack = createStackNavigator();
```

### Bottom Sheet (with @gorhom/bottom-sheet)

```tsx
import BottomSheet from '@gorhom/bottom-sheet';

function MyScreen() {
  const sheetRef = useRef<BottomSheet>(null);
  
  return (
    <BottomSheet ref={sheetRef} index={0} snapPoints={['25%', '50%', '90%']}>
      {/* Your content */}
    </BottomSheet>
  );
}
```

## ⚠️ Common Issues

### Issue: "RNGestureHandlerModule could not be found"

**Solution:**
1. Ensure `import 'react-native-gesture-handler';` is the FIRST import in `index.js`
2. Clean and rebuild:
   ```bash
   cd android && ./gradlew clean && cd ..
   npm start -- --reset-cache
   npm run android
   ```

### Issue: Gestures not working

**Solution:**
1. Verify `GestureHandlerRootView` wraps your app root
2. Check that the import is at the top of `index.js`
3. Restart Metro bundler with `--reset-cache`

### Issue: iOS build fails

**Solution:**
```bash
cd ios
pod install
cd ..
npm run ios
```

## 📚 Resources

- [Official Documentation](https://docs.swmansion.com/react-native-gesture-handler/)
- [API Reference](https://docs.swmansion.com/react-native-gesture-handler/docs/api/gestures/pan-gesture)
- [Examples](https://github.com/software-mansion/react-native-gesture-handler/tree/main/example)

## ✅ Verification

To verify the setup is working:

1. **Check import order:**
   ```bash
   head -10 index.js
   # Should show: import 'react-native-gesture-handler'; as first import
   ```

2. **Check App.tsx:**
   ```bash
   grep -n "GestureHandlerRootView" App.tsx
   # Should show the wrapper component
   ```

3. **Test gestures:**
   - Use any gesture-based component (swipe, pan, etc.)
   - Should work smoothly without errors

## 🎯 Next Steps

The gesture handler is fully set up. You can now:
- Use gesture-based components from libraries like `@gorhom/bottom-sheet`
- Implement custom gestures with `GestureDetector`
- Use React Navigation with full gesture support
- Add swipe gestures, pinch-to-zoom, and more

