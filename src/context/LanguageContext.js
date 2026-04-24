"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { RTL_LOCALES, SUPPORTED_LOCALES, translateUi } from "@/lib/i18n";

const STORAGE_KEY = "irwa-locale";
const SESSION_STORAGE_KEY = "irwa-session-locale";

const LanguageContext = createContext(null);

const DEFAULT_LOCALE = "bn";
const normalizeLocale = (value) =>
  SUPPORTED_LOCALES.includes(value) ? value : DEFAULT_LOCALE;

export function LanguageProvider({ children }) {
  const [locale, setLocale] = useState(DEFAULT_LOCALE);
  const [isLanguageReady, setIsLanguageReady] = useState(false);

  useEffect(() => {
    try {
      const storedLocale =
        window.sessionStorage.getItem(SESSION_STORAGE_KEY) ||
        window.localStorage.getItem(STORAGE_KEY);

      if (storedLocale) {
        setLocale(normalizeLocale(storedLocale));
      } else {
        setLocale(DEFAULT_LOCALE);
      }
    } catch (error) {
      console.error("Unable to initialize language preference:", error);
    } finally {
      setIsLanguageReady(true);
    }
  }, []);

  useEffect(() => {
    if (!isLanguageReady) return;

    const nextLocale = normalizeLocale(locale);
    const isRtl = RTL_LOCALES.includes(nextLocale);

    document.documentElement.lang = nextLocale;
    document.documentElement.dir = isRtl ? "rtl" : "ltr";
    document.documentElement.setAttribute("data-locale", nextLocale);

    try {
      window.sessionStorage.setItem(SESSION_STORAGE_KEY, nextLocale);
      window.localStorage.setItem(STORAGE_KEY, nextLocale);
    } catch (error) {
      console.error("Unable to persist language preference:", error);
    }
  }, [isLanguageReady, locale]);

  const value = useMemo(() => {
    const normalizedLocale = normalizeLocale(locale);
    const isRtl = RTL_LOCALES.includes(normalizedLocale);

    return {
      locale: normalizedLocale,
      isLanguageReady,
      isRtl,
      dir: isRtl ? "rtl" : "ltr",
      setLocale: (nextLocale) => setLocale(normalizeLocale(nextLocale)),
      t: (key, fallback = "") => translateUi(normalizedLocale, key, fallback),
    };
  }, [isLanguageReady, locale]);

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }

  return context;
}
