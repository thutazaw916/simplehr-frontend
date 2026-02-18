import { createContext, useState, useContext, useEffect } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [isDark, setIsDark] = useState(true);

  const toggleTheme = () => {
    const newTheme = !isDark;
    setIsDark(newTheme);
    localStorage.setItem('theme', newTheme ? 'dark' : 'light');
  };

  useEffect(() => {
    const saved = localStorage.getItem('theme');
    if (saved) {
      setIsDark(saved === 'dark');
    }
  }, []);

  const theme = isDark ? darkTheme : lightTheme;

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme, theme }}>
      <div style={{ backgroundColor: theme.bg, minHeight: '100vh', color: theme.text }}>
        {children}
      </div>
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);

const darkTheme = {
  bg: '#1a1a2e',
  cardBg: '#16213e',
  text: '#ffffff',
  textSecondary: '#a0a0a0',
  primary: '#1a73e8',
  border: '#2a2a4a',
  inputBg: '#16213e',
  inputBorder: '#2a2a4a',
  shadow: '0 2px 10px rgba(0,0,0,0.3)',
  headerBg: '#16213e',
  success: '#27ae60',
  warning: '#e67e22',
  danger: '#e74c3c',
  badgeBg: '#1a3a5c',
  badgeText: '#4a9eff',
  dateBg: '#1a3a5c',
  dateText: '#4a9eff',
};

const lightTheme = {
  bg: '#f5f5f5',
  cardBg: '#ffffff',
  text: '#333333',
  textSecondary: '#666666',
  primary: '#1a73e8',
  border: '#eeeeee',
  inputBg: '#f8f9fa',
  inputBorder: '#dddddd',
  shadow: '0 2px 10px rgba(0,0,0,0.06)',
  headerBg: '#ffffff',
  success: '#27ae60',
  warning: '#e67e22',
  danger: '#e74c3c',
  badgeBg: '#e8f0fe',
  badgeText: '#1a73e8',
  dateBg: '#e8f0fe',
  dateText: '#1a73e8',
};