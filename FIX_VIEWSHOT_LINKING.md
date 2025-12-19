# Fix ViewShot Native Module Linking

## The Error
```
TurboModuleRegistry.getEnforcing(...): 'RNViewShot' could not be found
```

This happens because `react-native-view-shot` is a native module that needs to be linked after installation.

## Solution: Rebuild the Native App

### For Android:

1. **Clean the build:**
   ```bash
   cd android
   ./gradlew clean
   cd ..
   ```

2. **Rebuild the app:**
   ```bash
   npm run android
   ```
   
   Or if you prefer to build manually:
   ```bash
   cd android
   ./gradlew assembleDebug
   cd ..
   ```

### For iOS:

1. **Install pods:**
   ```bash
   cd ios
   pod install
   cd ..
   ```

2. **Rebuild the app:**
   ```bash
   npm run ios
   ```

## Quick Fix (One Command)

**Android:**
```bash
cd android && ./gradlew clean && cd .. && npm run android
```

**iOS:**
```bash
cd ios && pod install && cd .. && npm run ios
```

## Current Status

The QR code screen now works **without crashing** even if ViewShot isn't linked:
- ✅ QR code displays correctly
- ⚠️ Download button shows a helpful message (will work after rebuild)
- ✅ Share button works with text fallback (will work with image after rebuild)

After rebuilding, both Download and Share will work with full image capture functionality.

