import {Dimensions, PixelRatio} from 'react-native';

const {width: SCREEN_WIDTH, height: SCREEN_HEIGHT} = Dimensions.get('window');

// Based on iPhone 11 Pro Max dimensions (414 x 896)
const BASE_WIDTH = 414;
const BASE_HEIGHT = 896;

/**
 * Normalize font size based on screen width
 * @param size - Font size to normalize
 * @returns Normalized font size
 */
export const normalize = (size: number): number => {
  const scale = SCREEN_WIDTH / BASE_WIDTH;
  const newSize = size * scale;
  return Math.round(PixelRatio.roundToNearestPixel(newSize));
};

/**
 * Get viewport width percentage
 * @param percentage - Percentage of screen width (0-100)
 * @returns Width in pixels
 */
export const vw = (percentage: number): number => {
  return (SCREEN_WIDTH * percentage) / 100;
};

/**
 * Get viewport height percentage
 * @param percentage - Percentage of screen height (0-100)
 * @returns Height in pixels
 */
export const vh = (percentage: number): number => {
  return (SCREEN_HEIGHT * percentage) / 100;
};

/**
 * Get screen dimensions
 */
export const screenDimensions = {
  width: SCREEN_WIDTH,
  height: SCREEN_HEIGHT,
};

