# Quick Fix for RNGestureHandlerModule Error

## The Problem
`TurboModuleRegistry.getEnforcing(...): 'RNGestureHandlerModule' could not be found`

## Root Cause
The native module isn't being found, usually due to:
1. Stale build cache
2. Native code not rebuilt after installation
3. Metro bundler cache

## Quick Fix (Run these commands in order):

```bash
# 1. Clean everything
cd /Users/i2pify/Documents/CravessRestaurant/CravessRestro
rm -rf android/.gradle android/app/build android/build android/.cxx
rm -rf node_modules/.cache
watchman watch-del-all 2>/dev/null || true

# 2. Rebuild Android (this will register the native module)
cd android
./gradlew clean
./gradlew assembleDebug
cd ..

# 3. Restart Metro bundler
npm start -- --reset-cache

# 4. In a new terminal, run the app
npm run android
```

## Alternative: One-Command Fix

```bash
cd /Users/i2pify/Documents/CravessRestaurant/CravessRestro && \
rm -rf android/.gradle android/app/build android/build android/.cxx node_modules/.cache && \
cd android && ./gradlew clean assembleDebug && cd .. && \
echo "✅ Done! Now run: npm start -- --reset-cache (in one terminal) and npm run android (in another)"
```

## Verification

Your setup is already correct:
- ✅ `import 'react-native-gesture-handler';` is FIRST in `index.js`
- ✅ `GestureHandlerRootView` wraps your app in `App.tsx`
- ✅ Autolinking is enabled in `android/app/build.gradle`

The issue is just that the native module needs to be rebuilt.

