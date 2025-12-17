import {typography} from './typography';
import {color} from './color';
import {fontFamily} from './fontFamily';
import {fontWeight} from './fontWeight';
import {fontSize} from './fontSize';
import {globalStyle} from './globalStyle';

const theme = {
  color,
  typography,
  fontWeight,
  fontSize,
  fontFamily,
  globalStyle,
};

// Export theme and provider
export default theme;
export {ThemeProvider, useTheme} from './ThemeProvider';
export {typography, color, fontFamily, fontWeight, fontSize, globalStyle};
