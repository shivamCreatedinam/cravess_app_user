# Asset Management Scripts

Scripts for managing assets and app icons in the Cravess Restro app.

## Available Scripts

### 1. Map Assets (`mapAssets.js`)

Automatically maps all images and icons in the assets folder to the assets index.

**Usage:**
```bash
npm run map-assets
# or
node scripts/mapAssets.js
```

**What it does:**
- Scans `assets/images/` folder for image files
- Scans `assets/icons/` folder for icon files
- Automatically generates imports in `src/assets/index.ts`
- Converts filenames to camelCase for easy access

**Example:**
- `assets/images/restaurant-logo.png` → `assets.images.restaurantLogo`
- `assets/icons/home-icon.png` → `assets.icons.homeIcon`

### 2. Setup App Icon (`setupAppIcon.js`)

Sets up `app_icons.jpg` (or similar) as the app icon for both Android and iOS.

**Requirements:**
- ImageMagick installed on your system
- `app_icons.jpg` (or `app_icon.jpg`, `app-icon.jpg`) in the `assets/` folder

**Install ImageMagick:**
```bash
# macOS
brew install imagemagick

# Linux
sudo apt-get install imagemagick

# Windows
# Download from https://imagemagick.org/script/download.php
```

**Usage:**
```bash
npm run setup-icon
# or
node scripts/setupAppIcon.js
```

**What it does:**
- Finds `app_icons.jpg` in the assets folder
- Generates all required Android icon sizes:
  - mdpi (48x48)
  - hdpi (72x72)
  - xhdpi (96x96)
  - xxhdpi (144x144)
  - xxxhdpi (192x192)
- Generates all required iOS icon sizes (20x20 to 1024x1024)
- Updates iOS Contents.json
- Creates both regular and round launcher icons for Android

**After running:**
1. Rebuild your app:
   ```bash
   npm run android
   npm run ios
   ```

## Workflow

### Adding New Images

1. Place images in `assets/images/` folder
2. Run `npm run map-assets` to update the index
3. Use in your code:
   ```typescript
   import assets from '../assets';
   <Image source={assets.images.myImage} />
   ```

### Adding New Icons

1. Place icons in `assets/icons/` folder
2. Run `npm run map-assets` to update the index
3. Use in your code:
   ```typescript
   import assets from '../assets';
   <Image source={assets.icons.myIcon} />
   ```

### Setting Up App Icon

1. Place `app_icons.jpg` in the `assets/` folder (root)
2. Ensure ImageMagick is installed
3. Run `npm run setup-icon`
4. Rebuild your app

## File Naming Conventions

- Use lowercase with hyphens: `my-image.png`
- Be descriptive: `restaurant-logo.png` not `img1.png`
- For app icon: `app_icons.jpg`, `app_icon.jpg`, or `app-icon.jpg`

## Supported Formats

- Images: `.png`, `.jpg`, `.jpeg`, `.svg`, `.webp`
- Icons: Same as images

## Troubleshooting

### ImageMagick not found
- Install ImageMagick (see requirements above)
- Verify installation: `convert --version`

### Assets not updating
- Make sure files are in correct folders (`assets/images/` or `assets/icons/`)
- Run `npm run map-assets` again
- Check file extensions are supported

### App icon not showing
- Rebuild the app after running `setup-icon`
- Clear build cache: `cd android && ./gradlew clean` or `cd ios && pod install`
- Verify icon files were created in `android/app/src/main/res/` and `ios/CravessRestro/Images.xcassets/`

