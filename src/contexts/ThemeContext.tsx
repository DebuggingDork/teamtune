import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { themes, mapThemeToCSSVariables, Theme } from '@/lib/theme-registry';

interface ThemeContextType {
  theme: string;
  setTheme: (theme: string) => void;
  availableThemes: Theme[];
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentTheme, setCurrentTheme] = useState<string>(() => {
    // Check localStorage first
    const stored = localStorage.getItem('theme');
    if (stored && themes[stored]) {
      return stored;
    }

    // Check system preference
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }

    return 'light';
  });

  useEffect(() => {
    const themeConfig = themes[currentTheme] || themes.light;
    const root = document.documentElement;

    // Apply CSS variables
    const cssVariables = mapThemeToCSSVariables(themeConfig);
    Object.entries(cssVariables).forEach(([property, value]) => {
      root.style.setProperty(property, value);
    });

    // Handle "dark" class for Tailwind dark mode
    if (themeConfig.type === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }

    // Store in localStorage
    localStorage.setItem('theme', currentTheme);
  }, [currentTheme]);

  const setTheme = (newTheme: string) => {
    if (themes[newTheme]) {
      setCurrentTheme(newTheme);
    } else {
      console.warn(`Theme '${newTheme}' not found.`);
    }
  };

  const value: ThemeContextType = {
    theme: currentTheme,
    setTheme,
    availableThemes: Object.values(themes),
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
