/**
 * Asset Loading Utility
 * Preloads and caches assets for better performance
 * 
 * Note: For React Native CLI, fonts are automatically linked via react-native.config.js
 * This utility is for future use with image preloading and other asset management
 */

import assets from '../assets';

/**
 * Preload all assets
 * Currently fonts are linked automatically via react-native.config.js
 * This function can be extended for image preloading and other assets
 */
export const preloadAssets = async (): Promise<void> => {
  try {
    // Fonts are automatically linked via react-native.config.js
    // No need to manually load them
    
    // Future: Preload images here
    // const imagePromises = Object.values(assets.images).map(image => {
    //   return Image.prefetch(Image.resolveAssetSource(image).uri);
    // });
    // await Promise.all(imagePromises);
    
    // Future: Preload other assets here
  } catch (error) {
    console.error('Error preloading assets:', error);
  }
};

/**
 * Get asset path
 * Helper function to get asset paths dynamically
 */
export const getAssetPath = (assetType: 'fonts' | 'images' | 'icons', name: string): any => {
  try {
    return assets[assetType][name];
  } catch (error) {
    console.error(`Asset not found: ${assetType}/${name}`, error);
    return null;
  }
};

