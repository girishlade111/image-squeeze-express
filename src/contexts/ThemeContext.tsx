import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface ThemeContextType {
  darkMode: boolean;
  toggleDarkMode: () => void;
}

const ThemeContext = createContext<ThemeContextType>({ darkMode: true, toggleDarkMode: () => {} });

export const useTheme = () => useContext(ThemeContext);

const THEME_KEY = 'ls-image-compressor-theme';
const THEME_KEY_OLD = 'imagesqueeze-theme';

const migrateThemeKey = () => {
  try {
    const old = localStorage.getItem(THEME_KEY_OLD);
    if (old !== null && localStorage.getItem(THEME_KEY) === null) {
      localStorage.setItem(THEME_KEY, old);
      localStorage.removeItem(THEME_KEY_OLD);
    }
  } catch {
    /* storage disabled — non-fatal */
  }
};

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  migrateThemeKey();

  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem(THEME_KEY);
    return saved ? saved === 'dark' : true; // default dark
  });

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
    try {
      localStorage.setItem(THEME_KEY, darkMode ? 'dark' : 'light');
    } catch {
      /* storage disabled — non-fatal */
    }
  }, [darkMode]);

  const toggleDarkMode = () => setDarkMode((prev) => !prev);

  return (
    <ThemeContext.Provider value={{ darkMode, toggleDarkMode }}>
      {children}
    </ThemeContext.Provider>
  );
};
