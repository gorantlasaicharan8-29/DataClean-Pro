import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const ThemeContext = createContext(null);

const VALID_THEMES = ['light', 'dark', 'blue', 'green', 'purple'];

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState('light');

  useEffect(() => {
    const stored = localStorage.getItem('dc_theme');
    if (stored && VALID_THEMES.includes(stored)) {
      setThemeState(stored);
      applyTheme(stored);
    } else {
      applyTheme('light');
    }
  }, []);

  const applyTheme = (t) => {
    if (t === 'light') {
      document.documentElement.removeAttribute('data-theme');
    } else {
      document.documentElement.setAttribute('data-theme', t);
    }
  };

  const setTheme = useCallback((newTheme) => {
    if (!VALID_THEMES.includes(newTheme)) return;
    setThemeState(newTheme);
    applyTheme(newTheme);
    localStorage.setItem('dc_theme', newTheme);
  }, []);

  const toggleDark = useCallback(() => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  }, [theme, setTheme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleDark, themes: VALID_THEMES }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within a ThemeProvider');
  return ctx;
}
