import React, {createContext, useContext, ReactNode} from 'react';
import theme from './index';

interface ThemeContextType {
  theme: typeof theme;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
}

/**
 * Theme Provider Component
 * Provides theme context to all child components
 */
export const ThemeProvider: React.FC<ThemeProviderProps> = ({children}) => {
  return (
    <ThemeContext.Provider value={{theme}}>
      {children}
    </ThemeContext.Provider>
  );
};

/**
 * Custom hook to access theme
 * @returns Theme object with all theme properties
 * @throws Error if used outside ThemeProvider
 * 
 * @example
 * const {theme} = useTheme();
 * <Text style={{color: theme.color.primary.main}}>Hello</Text>
 */
export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export default ThemeProvider;

