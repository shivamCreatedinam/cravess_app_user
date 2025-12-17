/**
 * App Icon Setup Script
 * Sets up app_icons.jpg as the app icon for Android and iOS
 * 
 * Requirements:
 * - ImageMagick or sharp package for image processing
 * - app_icons.jpg in assets folder
 * 
 * Run: node scripts/setupAppIcon.js
 */

const fs = require('fs');
const path = require('path');

const assetsDir = path.join(__dirname, '../assets');
const androidResDir = path.join(__dirname, '../android/app/src/main/res');
const iosAssetsDir = path.join(__dirname, '../ios/CravessRestro/Images.xcassets/AppIcon.appiconset');

// Android icon sizes
const androidSizes = {
  'mipmap-mdpi': { size: 48, folder: 'mipmap-mdpi' },
  'mipmap-hdpi': { size: 72, folder: 'mipmap-hdpi' },
  'mipmap-xhdpi': { size: 96, folder: 'mipmap-xhdpi' },
  'mipmap-xxhdpi': { size: 144, folder: 'mipmap-xxhdpi' },
  'mipmap-xxxhdpi': { size: 192, folder: 'mipmap-xxxhdpi' },
};

// iOS icon sizes
const iosSizes = [
  { size: 20, scale: 1, name: 'Icon-App-20x20@1x.png' },
  { size: 20, scale: 2, name: 'Icon-App-20x20@2x.png' },
  { size: 20, scale: 3, name: 'Icon-App-20x20@3x.png' },
  { size: 29, scale: 1, name: 'Icon-App-29x29@1x.png' },
  { size: 29, scale: 2, name: 'Icon-App-29x29@2x.png' },
  { size: 29, scale: 3, name: 'Icon-App-29x29@3x.png' },
  { size: 40, scale: 1, name: 'Icon-App-40x40@1x.png' },
  { size: 40, scale: 2, name: 'Icon-App-40x40@2x.png' },
  { size: 40, scale: 3, name: 'Icon-App-40x40@3x.png' },
  { size: 60, scale: 2, name: 'Icon-App-60x60@2x.png' },
  { size: 60, scale: 3, name: 'Icon-App-60x60@3x.png' },
  { size: 76, scale: 1, name: 'Icon-App-76x76@1x.png' },
  { size: 76, scale: 2, name: 'Icon-App-76x76@2x.png' },
  { size: 83.5, scale: 2, name: 'Icon-App-83.5x83.5@2x.png' },
  { size: 1024, scale: 1, name: 'Icon-App-1024x1024@1x.png' },
];

/**
 * Find app icon file
 */
function findAppIcon() {
  const files = fs.readdirSync(assetsDir);
  const iconFile = files.find(f => 
    f.toLowerCase().includes('app_icon') && 
    (f.endsWith('.jpg') || f.endsWith('.jpeg') || f.endsWith('.png'))
  );
  
  if (!iconFile) {
    throw new Error('app_icons.jpg not found in assets folder');
  }
  
  return path.join(assetsDir, iconFile);
}

/**
 * Check if ImageMagick is available
 */
function checkImageMagick() {
  const { execSync } = require('child_process');
  try {
    execSync('which convert', { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

/**
 * Resize image using ImageMagick
 */
function resizeImage(inputPath, outputPath, size) {
  const { execSync } = require('child_process');
  try {
    execSync(`convert "${inputPath}" -resize ${size}x${size} "${outputPath}"`, {
      stdio: 'ignore'
    });
    return true;
  } catch (error) {
    console.error(`Error resizing image: ${error.message}`);
    return false;
  }
}

/**
 * Setup Android icons
 */
function setupAndroidIcons(iconPath) {
  console.log('Setting up Android icons...');
  
  Object.entries(androidSizes).forEach(([key, config]) => {
    const folder = path.join(androidResDir, config.folder);
    const outputPath = path.join(folder, 'ic_launcher.png');
    const outputRoundPath = path.join(folder, 'ic_launcher_round.png');
    
    if (!fs.existsSync(folder)) {
      fs.mkdirSync(folder, { recursive: true });
    }
    
    if (resizeImage(iconPath, outputPath, config.size)) {
      console.log(`  ✅ Created ${config.folder}/ic_launcher.png (${config.size}x${config.size})`);
    }
    
    // Copy to round launcher
    if (fs.existsSync(outputPath)) {
      fs.copyFileSync(outputPath, outputRoundPath);
      console.log(`  ✅ Created ${config.folder}/ic_launcher_round.png`);
    }
  });
}

/**
 * Setup iOS icons
 */
function setupIOSIcons(iconPath) {
  console.log('Setting up iOS icons...');
  
  if (!fs.existsSync(iosAssetsDir)) {
    fs.mkdirSync(iosAssetsDir, { recursive: true });
  }
  
  iosSizes.forEach(config => {
    const actualSize = config.size * config.scale;
    const outputPath = path.join(iosAssetsDir, config.name);
    
    if (resizeImage(iconPath, outputPath, actualSize)) {
      console.log(`  ✅ Created ${config.name} (${actualSize}x${actualSize})`);
    }
  });
  
  // Update Contents.json
  updateIOSContentsJson();
}

/**
 * Update iOS Contents.json
 */
function updateIOSContentsJson() {
  const contentsJson = {
    images: iosSizes.map(config => ({
      filename: config.name,
      idiom: 'universal',
      scale: `${config.scale}x`,
      size: `${config.size}x${config.size}`,
    })),
    info: {
      author: 'xcode',
      version: 1,
    },
  };
  
  const jsonPath = path.join(iosAssetsDir, 'Contents.json');
  fs.writeFileSync(jsonPath, JSON.stringify(contentsJson, null, 2));
  console.log('  ✅ Updated Contents.json');
}

/**
 * Main function
 */
function main() {
  try {
    console.log('🚀 Setting up app icon...\n');
    
    // Check for ImageMagick
    if (!checkImageMagick()) {
      console.error('❌ ImageMagick not found. Please install it:');
      console.error('   macOS: brew install imagemagick');
      console.error('   Linux: sudo apt-get install imagemagick');
      console.error('   Windows: Download from https://imagemagick.org/script/download.php');
      process.exit(1);
    }
    
    // Find app icon
    const iconPath = findAppIcon();
    console.log(`📷 Found app icon: ${path.basename(iconPath)}\n`);
    
    // Setup Android icons
    setupAndroidIcons(iconPath);
    console.log('');
    
    // Setup iOS icons
    setupIOSIcons(iconPath);
    console.log('');
    
    console.log('✅ App icon setup complete!');
    console.log('📱 Rebuild your app to see the new icon.');
    
  } catch (error) {
    console.error('❌ Error setting up app icon:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { setupAndroidIcons, setupIOSIcons, findAppIcon };

