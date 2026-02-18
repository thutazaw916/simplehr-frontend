import { createContext, useState, useContext, useEffect } from 'react';
import mm from './mm';
import en from './en';

const languages = { mm, en };

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [lang, setLang] = useState('mm');

  const t = (key) => {
    return languages[lang][key] || key;
  };

  const switchLanguage = (newLang) => {
    setLang(newLang);
    localStorage.setItem('language', newLang);
  };

  useEffect(() => {
    const saved = localStorage.getItem('language');
    if (saved) setLang(saved);
  }, []);

  return (
    <LanguageContext.Provider value={{ lang, t, switchLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);