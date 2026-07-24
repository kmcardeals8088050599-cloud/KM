import React, { createContext, useContext, useState, useEffect } from 'react';

export type ThemeMode = 'black-gold' | 'clean-light';

interface ThemeContextType {
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
  toggleTheme: () => void;
  isBlackGold: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = 'km_car_deals_theme';

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<ThemeMode>(() => {
    try {
      const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
      if (savedTheme === 'clean-light' || savedTheme === 'black-gold') {
        return savedTheme;
      }
    } catch (e) {
      console.warn('Failed to load theme preference from localStorage', e);
    }
    return 'black-gold';
  });

  useEffect(() => {
    try {
      localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch (e) {
      console.warn('Failed to save theme preference to localStorage', e);
    }

    // Apply data attribute and class on root HTML element
    const root = document.documentElement;
    root.setAttribute('data-theme', theme);
    if (theme === 'clean-light') {
      root.classList.add('theme-clean-light');
      root.classList.remove('theme-black-gold');
    } else {
      root.classList.add('theme-black-gold');
      root.classList.remove('theme-clean-light');
    }
  }, [theme]);

  const setTheme = (newTheme: ThemeMode) => {
    setThemeState(newTheme);
  };

  const toggleTheme = () => {
    setThemeState(prev => (prev === 'black-gold' ? 'clean-light' : 'black-gold'));
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        setTheme,
        toggleTheme,
        isBlackGold: theme === 'black-gold'
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
