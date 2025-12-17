# Assets Management

Centralized asset management system for the Cravess Restro app.

## Structure

```
assets/
├── fonts/          # Font files (Poppins, Bauhaus, Icomoon)
├── images/         # Image assets (add as needed)
└── icons/          # Icon assets (add as needed)
```

## Fonts

The app uses three font families:

### Poppins
- All weights and styles (Regular, Medium, SemiBold, Bold, Light, etc.)
- Used for body text, buttons, and UI elements

### Bauhaus
- Medium, Bold, Demi, Heavy, Light
- Used for headings and display text

### Icomoon
- Icon font for custom icons

## Usage

### Import Assets

```typescript
import assets from '../assets';
// or
import {fonts, images, icons} from '../assets';
```

### Use Fonts

Fonts are automatically linked via `react-native.config.js`. They can be used directly in styles:

```typescript
import {Text, StyleSheet} from 'react-native';

const MyComponent = () => {
  return (
    <Text style={styles.text}>Hello World</Text>
  );
};

const styles = StyleSheet.create({
  text: {
    fontFamily: 'Poppins-Regular', // Use font name from theme
  },
});
```

### Use with Theme

Fonts are already configured in the theme system:

```typescript
import {useTheme} from '../theme';

const MyComponent = () => {
  const {theme} = useTheme();
  
  return (
    <Text style={theme.typography.heading.heading1}>
      Heading
    </Text>
  );
};
```

### Use Images

```typescript
import {Image} from 'react-native';
import assets from '../assets';

const MyComponent = () => {
  return (
    <Image source={assets.images.logo} />
  );
};
```

### Use Icons

```typescript
import {Image} from 'react-native';
import assets from '../assets';

const MyComponent = () => {
  return (
    <Image source={assets.icons.home} />
  );
};
```

## Adding New Assets

### Adding Images

1. Place image files in `assets/images/`
2. Import in `src/assets/index.ts`:

```typescript
export const images = {
  logo: require('../../assets/images/logo.png'),
  placeholder: require('../../assets/images/placeholder.png'),
};
```

### Adding Icons

1. Place icon files in `assets/icons/`
2. Import in `src/assets/index.ts`:

```typescript
export const icons = {
  home: require('../../assets/icons/home.png'),
  user: require('../../assets/icons/user.png'),
};
```

### Adding Fonts

1. Place font files in `assets/fonts/`
2. Update `react-native.config.js` if needed
3. Run `npx react-native-asset` to link fonts
4. Add font reference in `src/assets/index.ts`

## Font Linking

Fonts are automatically linked via `react-native.config.js`. After adding new fonts:

1. Run: `npx react-native-asset`
2. For iOS: `cd ios && pod install`
3. Rebuild the app

## Best Practices

1. **Use theme typography** instead of direct font names
2. **Import from assets index** for consistency
3. **Optimize images** before adding to assets
4. **Use vector icons** when possible (SVG or icon fonts)
5. **Organize assets** by type (images, icons, fonts)

## File Naming

- Use lowercase with hyphens: `my-image.png`
- Be descriptive: `restaurant-logo.png` not `img1.png`
- Group related assets: `icon-home.png`, `icon-user.png`

## Asset Sizes

- **Icons**: 24x24, 32x32, 48x48 (1x, 2x, 3x for retina)
- **Images**: Optimize for mobile (max 2048px width)
- **Fonts**: Use only necessary weights/styles

