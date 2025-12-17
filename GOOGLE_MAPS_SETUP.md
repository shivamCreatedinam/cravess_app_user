# Google Maps Setup Guide

This document describes the setup and configuration of Google Maps using `react-native-maps` in this project.

## ✅ Setup Status

The Google Maps configuration is complete. You need to add your Google Maps API keys to enable maps.

## 📦 Installation

The package is already installed:
```json
"react-native-maps": "^1.15.3",
"react-native-maps-directions": "^1.9.0"
```

## 🔑 Getting Your Google Maps API Key

### Step 1: Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the following APIs:
   - **Maps SDK for Android**
   - **Maps SDK for iOS**
   - **Geocoding API** (if using geocoding)
   - **Directions API** (if using directions)

### Step 2: Create API Keys

1. Navigate to **APIs & Services** > **Credentials**
2. Click **Create Credentials** > **API Key**
3. Create separate keys for Android and iOS (recommended for security)
4. Restrict the keys:
   - **Android**: Restrict by package name: `com.createdinam.india.cravessrestro`
   - **iOS**: Restrict by bundle ID: `com.createdinam.india.cravessrestro`

## 🔧 Configuration

### Android Setup

#### 1. Add API Key to AndroidManifest.xml

The API key placeholder is already added. Replace it with your actual key:

**File:** `android/app/src/main/AndroidManifest.xml`

```xml
<meta-data
  android:name="com.google.android.geo.API_KEY"
  android:value="YOUR_GOOGLE_MAPS_API_KEY_HERE" />
```

Replace `YOUR_GOOGLE_MAPS_API_KEY_HERE` with your Android API key.

#### 2. Permissions (Already Added)

The following permissions are already configured:
- `ACCESS_FINE_LOCATION`
- `ACCESS_COARSE_LOCATION`
- `INTERNET`

#### 3. Dependencies (Already Added)

Google Play Services dependencies are already added in `build.gradle`:
- `play-services-maps:18.2.0`
- `play-services-location:21.0.1`

### iOS Setup

#### 1. Add API Key to AppDelegate.mm

The API key initialization is already added. Replace it with your actual key:

**File:** `ios/CravessRestro/AppDelegate.mm`

```objc
[GMSServices provideAPIKey:@"YOUR_GOOGLE_MAPS_API_KEY_HERE"];
```

Replace `YOUR_GOOGLE_MAPS_API_KEY_HERE` with your iOS API key.

#### 2. Location Permissions (Already Added)

Location permission descriptions are already added in `Info.plist`:
- `NSLocationWhenInUseUsageDescription`
- `NSLocationAlwaysAndWhenInUseUsageDescription`
- `NSLocationAlwaysUsageDescription`

#### 3. Install Pods

After adding the API key, run:
```bash
cd ios
pod install
cd ..
```

## 🚀 Usage Examples

### Basic MapView

```tsx
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';

function MyMap() {
  return (
    <MapView
      provider={PROVIDER_GOOGLE}
      style={{ flex: 1 }}
      initialRegion={{
        latitude: 37.78825,
        longitude: -122.4324,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      }}
    >
      <Marker
        coordinate={{
          latitude: 37.78825,
          longitude: -122.4324,
        }}
        title="My Location"
        description="This is my location"
      />
    </MapView>
  );
}
```

### Map with Directions

```tsx
import MapView, { PROVIDER_GOOGLE } from 'react-native-maps';
import MapViewDirections from 'react-native-maps-directions';

function MapWithDirections() {
  const origin = { latitude: 37.78825, longitude: -122.4324 };
  const destination = { latitude: 37.7749, longitude: -122.4194 };
  const GOOGLE_MAPS_APIKEY = 'YOUR_API_KEY';

  return (
    <MapView
      provider={PROVIDER_GOOGLE}
      style={{ flex: 1 }}
      initialRegion={{
        latitude: 37.78825,
        longitude: -122.4324,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      }}
    >
      <MapViewDirections
        origin={origin}
        destination={destination}
        apikey={GOOGLE_MAPS_APIKEY}
        strokeWidth={3}
        strokeColor="hotpink"
      />
    </MapView>
  );
}
```

### Custom Map Style

```tsx
const mapStyle = [
  {
    elementType: 'geometry',
    stylers: [{ color: '#f5f5f5' }],
  },
  {
    elementType: 'labels.icon',
    stylers: [{ visibility: 'off' }],
  },
  // ... more styles
];

<MapView
  provider={PROVIDER_GOOGLE}
  customMapStyle={mapStyle}
  style={{ flex: 1 }}
/>
```

### Get User Location

```tsx
import { useState, useEffect } from 'react';
import Geolocation from '@react-native-community/geolocation';

function MapWithUserLocation() {
  const [region, setRegion] = useState(null);

  useEffect(() => {
    Geolocation.getCurrentPosition(
      (position) => {
        setRegion({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        });
      },
      (error) => console.error(error),
      { enableHighAccuracy: true, timeout: 20000, maximumAge: 1000 }
    );
  }, []);

  return (
    <MapView
      provider={PROVIDER_GOOGLE}
      style={{ flex: 1 }}
      region={region}
      showsUserLocation={true}
      showsMyLocationButton={true}
    />
  );
}
```

## 📍 Current Usage in Project

The following screens already use Google Maps:

1. **TrackDriverScreen** (`src/screens/TrackDriverScreen/TrackDriverScreen.js`)
   - Shows driver location on map
   - Real-time location updates

2. **RideScreen** (`src/screens/RideScreen/index.js`)
   - Map with directions
   - Route visualization

3. **BookingScreen** (`src/screens/BookingScreen/index.js`)
   - Map with directions
   - Animated regions
   - Polyline support

4. **RestaurantCard** (`src/common/RestaurantCard.js`)
   - Shows restaurant location on map
   - Custom map styling

## ⚠️ Important Notes

### API Key Security

1. **Never commit API keys to version control**
   - Use environment variables or secure storage
   - Consider using `.env` files (add to `.gitignore`)

2. **Restrict API Keys**
   - Restrict by package name (Android)
   - Restrict by bundle ID (iOS)
   - Set usage limits

3. **Use Different Keys for Development and Production**

### Environment Variables (Recommended)

Create a `.env` file:
```
GOOGLE_MAPS_API_KEY_ANDROID=your_android_key_here
GOOGLE_MAPS_API_KEY_IOS=your_ios_key_here
```

Then use `react-native-config` or similar to load them.

### Billing

- Google Maps requires a billing account
- First $200/month is free (as of 2024)
- Monitor usage in Google Cloud Console

## 🔍 Troubleshooting

### Issue: Maps not showing on Android

**Solutions:**
1. Verify API key is correct in `AndroidManifest.xml`
2. Check that Maps SDK for Android is enabled in Google Cloud Console
3. Ensure package name matches: `com.createdinam.india.cravessrestro`
4. Check logcat for API key errors:
   ```bash
   adb logcat | grep -i "maps\|api"
   ```

### Issue: Maps not showing on iOS

**Solutions:**
1. Verify API key is correct in `AppDelegate.mm`
2. Check that Maps SDK for iOS is enabled in Google Cloud Console
3. Ensure bundle ID matches: `com.createdinam.india.cravessrestro`
4. Run `pod install` after adding API key
5. Clean build:
   ```bash
   cd ios
   pod deintegrate && pod install
   cd ..
   ```

### Issue: "API key not valid" error

**Solutions:**
1. Verify API key is correct (no extra spaces)
2. Check API restrictions in Google Cloud Console
3. Ensure correct APIs are enabled (Maps SDK for Android/iOS)
4. Wait a few minutes after creating/updating API key

### Issue: Location not working

**Solutions:**
1. Request location permissions at runtime
2. Check `Info.plist` (iOS) and `AndroidManifest.xml` (Android) permissions
3. Test on a real device (location doesn't work well on emulators)
4. Enable location services on device

## 📚 Resources

- [react-native-maps Documentation](https://github.com/react-native-maps/react-native-maps)
- [Google Maps Platform](https://developers.google.com/maps)
- [Maps SDK for Android](https://developers.google.com/maps/documentation/android-sdk)
- [Maps SDK for iOS](https://developers.google.com/maps/documentation/ios-sdk)
- [API Key Best Practices](https://developers.google.com/maps/api-security-best-practices)

## ✅ Next Steps

1. **Add your API keys:**
   - Replace `YOUR_GOOGLE_MAPS_API_KEY_HERE` in `AndroidManifest.xml`
   - Replace `YOUR_GOOGLE_MAPS_API_KEY_HERE` in `AppDelegate.mm`

2. **Test the setup:**
   ```bash
   # Android
   npm run android
   
   # iOS
   cd ios && pod install && cd ..
   npm run ios
   ```

3. **Verify maps are working:**
   - Open any screen that uses maps
   - Check that maps render correctly
   - Test location features

4. **Set up billing** (if not already done):
   - Add billing account in Google Cloud Console
   - Monitor usage

The Google Maps setup is complete! Just add your API keys and you're ready to go! 🗺️

