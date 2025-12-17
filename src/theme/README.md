# Theme System

A comprehensive theme system for the Cravess Restro app with colors, typography, fonts, and global styles.

## Features

- ✅ **Comprehensive Color Palette** - Primary, secondary, accent, text, action, button, system colors
- ✅ **Typography System** - Headings, subheadings, body text, buttons, links
- ✅ **Font Management** - Poppins and Bauhaus font families
- ✅ **Global Styles** - Reusable spacing, layout, and utility styles
- ✅ **Responsive Dimensions** - Viewport-based sizing (vw, vh) and normalized fonts
- ✅ **TypeScript Support** - Fully typed theme system

## Quick Start

### 1. Theme is Already Integrated

The theme is automatically available throughout the app via `ThemeProvider` in `App.tsx`.

### 2. Using Theme in Components

```typescript
import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {useTheme} from '../theme';

const MyComponent = () => {
  const {theme} = useTheme();

  return (
    <View style={styles.container}>
      <Text
        style={[
          theme.typography.heading.heading1,
          {color: theme.color.primary.main},
        ]}>
        Welcome
      </Text>
      <Text
        style={[
          theme.typography.bodyMedium.regular,
          {color: theme.color.text.secondary},
        ]}>
        This is body text
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
});
```

## Theme Structure

### Colors

```typescript
theme.color.primary.main        // #000099
theme.color.secondary.main      // #AFE4FF
theme.color.accent.main          // #7FD287
theme.color.text.primary         // #25304B
theme.color.button.activeBackground // #000099
theme.color.system.error          // #C3272E
theme.color.system.success        // #218946
```

### Typography

```typescript
// Headings
theme.typography.heading.heading1
theme.typography.heading.heading2
theme.typography.heading.heading3

// Subheadings
theme.typography.subHeading.subHeading1
theme.typography.subHeading.subHeading2

// Body Text
theme.typography.bodyLarge.regular
theme.typography.bodyMedium.regular
theme.typography.bodySmall.regular

// Buttons & Links
theme.typography.button
theme.typography.link
```

### Global Styles

```typescript
// Padding
theme.globalStyle.p12          // padding: 12
theme.globalStyle.pdh12        // paddingHorizontal: 12
theme.globalStyle.pdv12        // paddingVertical: 12

// Margin
theme.globalStyle.mt12         // marginTop: 12
theme.globalStyle.mB16         // marginBottom: 16
theme.globalStyle.mV16         // marginVertical: 16

// Layout
theme.globalStyle.fdRow        // flexDirection: 'row'
theme.globalStyle.flex1        // flex: 1
theme.globalStyle.jCCenter     // justifyContent: 'center'
```

## Examples

### Example 1: Button Component

```typescript
import {TouchableOpacity, Text, StyleSheet} from 'react-native';
import {useTheme} from '../theme';

const Button = ({title, onPress, disabled}) => {
  const {theme} = useTheme();

  return (
    <TouchableOpacity
      style={[
        styles.button,
        {
          backgroundColor: disabled
            ? theme.color.button.disabledBackground
            : theme.color.button.activeBackground,
        },
      ]}
      onPress={onPress}
      disabled={disabled}>
      <Text
        style={[
          theme.typography.button,
          {
            color: theme.color.button.activeText,
          },
        ]}>
        {title}
      </Text>
    </TouchableOpacity>
  );
};
```

### Example 2: Card Component

```typescript
import {View, Text, StyleSheet} from 'react-native';
import {useTheme} from '../theme';

const Card = ({title, content}) => {
  const {theme} = useTheme();

  return (
    <View
      style={[
        styles.card,
        theme.globalStyle.p12,
        {
          backgroundColor: theme.color.primary.white,
          borderColor: theme.color.other.border,
        },
      ]}>
      <Text
        style={[
          theme.typography.heading.heading4,
          {color: theme.color.text.primary},
        ]}>
        {title}
      </Text>
      <Text
        style={[
          theme.typography.bodyMedium.regular,
          theme.globalStyle.mt8,
          {color: theme.color.text.secondary},
        ]}>
        {content}
      </Text>
    </View>
  );
};
```

### Example 3: Using Global Styles

```typescript
import {View, Text} from 'react-native';
import {useTheme} from '../theme';

const Layout = () => {
  const {theme} = useTheme();

  return (
    <View style={[theme.globalStyle.flex1, theme.globalStyle.pdh16]}>
      <View style={[theme.globalStyle.fdRow, theme.globalStyle.mt12]}>
        <Text style={theme.typography.heading.heading5}>Title</Text>
      </View>
    </View>
  );
};
```

## Color Palette

### Primary Colors
- `primary.main`: #000099 (Main brand color)
- `primary.black`: #000000
- `primary.white`: #FFFFFF

### Secondary Colors
- `secondary.main`: #AFE4FF
- `secondary.light`: #EAF8FF
- `secondary.bright`: #00AEE5

### Accent Colors
- `accent.main`: #7FD287 (Success/Green)
- `accent.light`: #F1FBF5
- `accent.dark`: #209326

### System Colors
- `system.error`: #C3272E
- `system.success`: #218946
- `system.warning`: #A97D0E
- `system.information`: #348DC4

## Typography Scale

### Headings
- `heading1`: 44px (Bauhaus Medium)
- `heading2`: 40px (Bauhaus Medium)
- `heading3`: 32px (Bauhaus Medium)
- `heading4`: 24px (Bauhaus Medium)
- `heading5`: 20px (Bauhaus Medium)

### Body Text
- `bodyLarge`: 16px (Poppins)
- `bodyMedium`: 14px (Poppins)
- `bodySmall`: 12px (Poppins)
- `bodyExtraSmall`: 10px (Poppins)

## Font Families

- **Poppins**: Regular, Medium, SemiBold, Bold, Light
- **Bauhaus**: Medium, Bold, Demi, Heavy, Light

## Responsive Dimensions

The theme uses viewport-based dimensions for responsive design:

- `vw(percentage)`: Viewport width percentage
- `vh(percentage)`: Viewport height percentage
- `normalize(size)`: Normalized font size based on screen width

## Best Practices

1. **Always use theme colors** instead of hardcoded hex values
2. **Use typography styles** for consistent text styling
3. **Leverage global styles** for common spacing and layout patterns
4. **Combine theme styles** with component-specific styles
5. **Use TypeScript** for type safety when accessing theme properties

## File Structure

```
src/theme/
├── index.ts              # Main theme export
├── ThemeProvider.tsx     # Theme context provider
├── color.ts              # Color definitions
├── typography.ts         # Typography styles
├── fontFamily.ts         # Font family definitions
├── fontSize.ts           # Font size scale
├── fontWeight.ts         # Font weight definitions
├── fontStyle.ts          # Font style definitions
└── globalStyle.ts        # Global utility styles
```

## Integration

The theme is integrated at the app level in `App.tsx`:

```typescript
<ThemeProvider>
  <SocketProvider>
    {/* Your app content */}
  </SocketProvider>
</ThemeProvider>
```

All components can now access the theme using the `useTheme` hook.

