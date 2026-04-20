"use client";
import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import { DEFAULT_SITE_SETTINGS, mergeSiteSettings } from "@/lib/siteSettings";
import { useLanguage } from "@/context/LanguageContext";
import { localizeSiteSettings } from "@/lib/i18n";

const SiteSettingsContext = createContext(null);
const SITE_SETTINGS_CACHE_KEY = "irwa-site-settings-cache-v1";

export function SiteSettingsProvider({ children }) {
  const [rawSettings, setRawSettings] = useState(DEFAULT_SITE_SETTINGS);
  const [loading, setLoading] = useState(true);
  const { locale } = useLanguage();

  const refreshSettings = useCallback(async ({ background = false } = {}) => {
    if (!background) {
      setLoading(true);
    }

    try {
      if (typeof window !== "undefined") {
        window.localStorage.removeItem(SITE_SETTINGS_CACHE_KEY);
      }

      const response = await fetch(`/api/site-settings?ts=${Date.now()}`, {
        cache: "no-store",
        headers: {
          "Cache-Control": "no-cache",
        },
      });
      const result = await response.json();

      if (!response.ok || result?.success === false) {
        throw new Error(result?.error || "Unable to load site settings.");
      }

      const nextData = result.data || [];
      setRawSettings(mergeSiteSettings(nextData));
    } catch (error) {
      console.error("Failed to load global site settings:", error);
      if (!background) {
        setRawSettings(DEFAULT_SITE_SETTINGS);
      }
    } finally {
      if (!background) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(SITE_SETTINGS_CACHE_KEY);
    }

    refreshSettings();
  }, [refreshSettings]);

  useEffect(() => {
    const handleSettingsUpdated = () => {
      refreshSettings();
    };

    window.addEventListener(
      "irwa:site-settings-updated",
      handleSettingsUpdated,
    );

    return () => {
      window.removeEventListener(
        "irwa:site-settings-updated",
        handleSettingsUpdated,
      );
    };
  }, [refreshSettings]);

  const settings = useMemo(
    () => localizeSiteSettings(rawSettings, locale),
    [rawSettings, locale],
  );

  return (
    <SiteSettingsContext.Provider
      value={{ settings, rawSettings, loading, refreshSettings }}
    >
      {children}
    </SiteSettingsContext.Provider>
  );
}

export function useSiteSettings() {
  const context = useContext(SiteSettingsContext);
  if (!context) {
    throw new Error(
      "useSiteSettings must be used within a SiteSettingsProvider",
    );
  }
  return context;
}
