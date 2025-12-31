import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { themes, Theme } from '@/themes';

interface ThemeContextType {
  theme: string;
  setTheme: (themeId: string) => void;
  availableThemes: Theme[];
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [themeId, setThemeId] = useState<string>(() => {
    const stored = localStorage.getItem('theme');
    if (stored && themes.some(t => t.id === stored)) {
      return stored;
    }

    return 'light';
  });

  useEffect(() => {
    const theme = themes.find(t => t.id === themeId) || themes[0];
    const root = document.documentElement;

    // Apply CSS variables
    Object.entries(theme.colors).forEach(([key, value]) => {
      root.style.setProperty(`--${key}`, value);
    });

    // For Tailwind's dark selector compatibility
    if (theme.isDark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }

    // Remove all previous theme classes
    themes.forEach(t => root.classList.remove(t.id));
    // Add current theme class
    root.classList.add(themeId);

    localStorage.setItem('theme', themeId);
  }, [themeId]);

  const setTheme = (id: string) => {
    if (themes.some(t => t.id === id)) {
      setThemeId(id);
    }
  };

  const value: ThemeContextType = {
    theme: themeId,
    setTheme,
    availableThemes: themes,
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};