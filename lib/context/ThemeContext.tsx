'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextValue {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (t: Theme) => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: 'dark', // Default dark — prevents SSR flash for dark-mode users
  toggleTheme: () => {},
  setTheme: () => {},
});

const applyTheme = (t: Theme) => {
  const root = document.documentElement;
  if (t === 'dark') {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }
};

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // Initialize as 'dark' to match what the inline script sets on <html> before hydration
  const [theme, setThemeState] = useState<Theme>('dark');

  useEffect(() => {
    // On first mount: honour saved preference, fallback to OS preference, then default dark
    const saved = localStorage.getItem('humAi-theme') as Theme | null;
    let resolved: Theme;
    if (saved === 'dark' || saved === 'light') {
      resolved = saved;
    } else {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      resolved = prefersDark ? 'dark' : 'dark'; // Always default dark if no preference saved
    }
    applyTheme(resolved);
    setThemeState(resolved);
  }, []);

  const setTheme = (t: Theme) => {
    applyTheme(t);
    setThemeState(t);
    localStorage.setItem('humAi-theme', t);
  };

  const toggleTheme = () => setTheme(theme === 'light' ? 'dark' : 'light');

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);

