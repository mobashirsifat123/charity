"use client";

import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { RTL_LOCALES, SUPPORTED_LOCALES, translateUi } from '@/lib/i18n';

const STORAGE_KEY = 'irwa-locale';

const LanguageContext = createContext(null);

const normalizeLocale = (value) => (SUPPORTED_LOCALES.includes(value) ? value : 'en');

export function LanguageProvider({ children }) {
  const [locale, setLocale] = useState('en');

  useEffect(() => {
    try {
      const storedLocale = window.localStorage.getItem(STORAGE_KEY);
      if (storedLocale) {
        setLocale(normalizeLocale(storedLocale));
        return;
      }

      if (window.navigator.language?.toLowerCase().startsWith('ar')) {
        setLocale('ar');
      }
    } catch (error) {
      console.error('Unable to initialize language preference:', error);
    }
  }, []);

  useEffect(() => {
    const nextLocale = normalizeLocale(locale);
    const isRtl = RTL_LOCALES.includes(nextLocale);

    document.documentElement.lang = nextLocale;
    document.documentElement.dir = isRtl ? 'rtl' : 'ltr';
    document.documentElement.setAttribute('data-locale', nextLocale);

    try {
      window.localStorage.setItem(STORAGE_KEY, nextLocale);
    } catch (error) {
      console.error('Unable to persist language preference:', error);
    }
  }, [locale]);

  const value = useMemo(() => {
    const normalizedLocale = normalizeLocale(locale);
    const isRtl = RTL_LOCALES.includes(normalizedLocale);

    return {
      locale: normalizedLocale,
      isRtl,
      dir: isRtl ? 'rtl' : 'ltr',
      setLocale: (nextLocale) => setLocale(normalizeLocale(nextLocale)),
      t: (key, fallback = '') => translateUi(normalizedLocale, key, fallback),
    };
  }, [locale]);

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }

  return context;
}
