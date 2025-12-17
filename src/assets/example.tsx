/**
 * Assets Usage Example
 * This file demonstrates how to use assets throughout the application
 */

import React from 'react';
import {View, Text, StyleSheet, Image} from 'react-native';
import {useTheme} from '../theme';
import assets from './index';

/**
 * Example: Using fonts with theme
 */
export const FontExample = () => {
  const {theme} = useTheme();

  return (
    <View style={styles.container}>
      <Text style={[theme.typography.heading.heading1, {color: theme.color.primary.main}]}>
        Heading with Theme Font
      </Text>
      <Text style={[theme.typography.bodyMedium.regular, {color: theme.color.text.secondary}]}>
        Body text with Poppins font
      </Text>
    </View>
  );
};

/**
 * Example: Using images
 */
export const ImageExample = () => {
  // When images are added to assets
  // return (
  //   <Image source={assets.images.logo} style={styles.image} />
  // );
  return null;
};

/**
 * Example: Using icons
 */
export const IconExample = () => {
  // When icons are added to assets
  // return (
  //   <Image source={assets.icons.home} style={styles.icon} />
  // );
  return null;
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  image: {
    width: 100,
    height: 100,
  },
  icon: {
    width: 24,
    height: 24,
  },
});

