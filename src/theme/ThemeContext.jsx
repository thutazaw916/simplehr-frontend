import { createContext, useState, useContext, useEffect } from 'react';

const ThemeContext = createContext();

const themes = {
  dark: {
    bg: '#0a0a0f',
    bgSecondary: '#12121a',
    bgTertiary: '#1a1a2e',
    cardBg: 'rgba(255, 255, 255, 0.03)',
    cardBgHover: 'rgba(255, 255, 255, 0.06)',
    cardBorder: 'rgba(255, 255, 255, 0.06)',
    text: '#e4e4e7',
    textSecondary: '#71717a',
    textMuted: '#52525b',
    primary: '#818cf8',
    primaryLight: 'rgba(129, 140, 248, 0.12)',
    primaryGlow: 'rgba(129, 140, 248, 0.2)',
    success: '#34d399',
    successLight: 'rgba(52, 211, 153, 0.12)',
    warning: '#fbbf24',
    warningLight: 'rgba(251, 191, 36, 0.12)',
    danger: '#f87171',
    dangerLight: 'rgba(248, 113, 113, 0.12)',
    info: '#60a5fa',
    infoLight: 'rgba(96, 165, 250, 0.12)',
    inputBg: 'rgba(255, 255, 255, 0.04)',
    inputBorder: 'rgba(255, 255, 255, 0.08)',
    inputFocus: '#818cf8',
    shadow: '0 4px 30px rgba(0, 0, 0, 0.3)',
    shadowLg: '0 10px 60px rgba(0, 0, 0, 0.5)',
    gradient1: 'linear-gradient(135deg, #818cf8 0%, #a78bfa 100%)',
    gradient2: 'linear-gradient(135deg, #34d399 0%, #60a5fa 100%)',
    gradient3: 'linear-gradient(135deg, #f472b6 0%, #818cf8 100%)',
    gradientBg: 'linear-gradient(180deg, #0a0a0f 0%, #12121a 100%)',
    badgeBg: 'rgba(129, 140, 248, 0.12)',
    badgeText: '#818cf8',
    dateBg: 'rgba(129, 140, 248, 0.06)',
    dateText: '#a1a1aa',
    border: 'rgba(255, 255, 255, 0.06)',
    overlay: 'rgba(0, 0, 0, 0.6)',
  },
  light: {
    bg: '#fafafa',
    bgSecondary: '#f4f4f5',
    bgTertiary: '#e4e4e7',
    cardBg: 'rgba(255, 255, 255, 0.8)',
    cardBgHover: 'rgba(255, 255, 255, 0.95)',
    cardBorder: 'rgba(0, 0, 0, 0.06)',
    text: '#18181b',
    textSecondary: '#52525b',
    textMuted: '#a1a1aa',
    primary: '#6366f1',
    primaryLight: 'rgba(99, 102, 241, 0.1)',
    primaryGlow: 'rgba(99, 102, 241, 0.15)',
    success: '#10b981',
    successLight: 'rgba(16, 185, 129, 0.1)',
    warning: '#f59e0b',
    warningLight: 'rgba(245, 158, 11, 0.1)',
    danger: '#ef4444',
    dangerLight: 'rgba(239, 68, 68, 0.1)',
    info: '#3b82f6',
    infoLight: 'rgba(59, 130, 246, 0.1)',
    inputBg: 'rgba(0, 0, 0, 0.02)',
    inputBorder: 'rgba(0, 0, 0, 0.1)',
    inputFocus: '#6366f1',
    shadow: '0 4px 30px rgba(0, 0, 0, 0.08)',
    shadowLg: '0 10px 60px rgba(0, 0, 0, 0.12)',
    gradient1: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
    gradient2: 'linear-gradient(135deg, #10b981 0%, #3b82f6 100%)',
    gradient3: 'linear-gradient(135deg, #ec4899 0%, #6366f1 100%)',
    gradientBg: 'linear-gradient(180deg, #fafafa 0%, #f4f4f5 100%)',
    badgeBg: 'rgba(99, 102, 241, 0.1)',
    badgeText: '#6366f1',
    dateBg: 'rgba(99, 102, 241, 0.05)',
    dateText: '#71717a',
    border: 'rgba(0, 0, 0, 0.06)',
    overlay: 'rgba(0, 0, 0, 0.4)',
  }
};

export const ThemeProvider = ({ children }) => {
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem('theme');
    if (saved) setIsDark(saved === 'dark');
  }, []);

  useEffect(() => {
    document.body.style.backgroundColor = isDark ? themes.dark.bg : themes.light.bg;
    document.body.style.color = isDark ? themes.dark.text : themes.light.text;
  }, [isDark]);

  const toggleTheme = () => {
    setIsDark(!isDark);
    localStorage.setItem('theme', !isDark ? 'dark' : 'light');
  };

  const theme = isDark ? themes.dark : themes.light;

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme, theme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);