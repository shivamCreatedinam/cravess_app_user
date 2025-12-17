#!/bin/bash

echo "🔧 Fixing react-native-gesture-handler TurboModule error..."

# Navigate to project root
cd "$(dirname "$0")"

echo "📦 Step 1: Cleaning node_modules and reinstalling..."
rm -rf node_modules
npm install

echo "🧹 Step 2: Cleaning Android build..."
cd android
./gradlew clean
rm -rf .gradle app/build build
cd ..

echo "🧹 Step 3: Cleaning Metro bundler cache..."
rm -rf $TMPDIR/react-*
rm -rf $TMPDIR/metro-*
watchman watch-del-all 2>/dev/null || true

echo "📱 Step 4: Rebuilding Android..."
cd android
./gradlew assembleDebug
cd ..

echo "✅ Done! Now run: npm run android"

