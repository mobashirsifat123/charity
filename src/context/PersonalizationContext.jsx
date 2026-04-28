"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

const RECENT_KEY = "irwa-recently-viewed";
const FEATURE_KEY = "irwa-last-feature";
const QURAN_KEY = "irwa-quran-progress";
const MAX_RECENT = 5;

const PersonalizationContext = createContext(null);

function readJson(key, fallback) {
  if (typeof window === "undefined") return fallback;
  try {
    return JSON.parse(window.localStorage.getItem(key) || "null") ?? fallback;
  } catch {
    return fallback;
  }
}

function writeJson(key, value) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {}
}

export function PersonalizationProvider({ children }) {
  const [hydrated, setHydrated] = useState(false);
  const [recentlyViewed, setRecentlyViewed] = useState([]);
  const [lastFeature, setLastFeature] = useState(null);
  const [quranProgress, setQuranProgress] = useState(null);

  useEffect(() => {
    setRecentlyViewed(readJson(RECENT_KEY, []));
    setLastFeature(readJson(FEATURE_KEY, null));
    setQuranProgress(readJson(QURAN_KEY, null));
    setHydrated(true);
  }, []);

  const trackRecent = useCallback((item) => {
    if (!item?.href || !item?.title || !item?.type) return;

    setRecentlyViewed((current) => {
      const next = [
        { ...item, viewedAt: new Date().toISOString() },
        ...current.filter((entry) => entry.href !== item.href),
      ].slice(0, MAX_RECENT);
      writeJson(RECENT_KEY, next);
      return next;
    });
  }, []);

  const trackFeature = useCallback((feature) => {
    if (!feature?.href || !feature?.label) return;
    setLastFeature(feature);
    writeJson(FEATURE_KEY, feature);
  }, []);

  const saveQuranProgress = useCallback((progress) => {
    if (!progress?.surah_id || !progress?.ayah_number) return;
    const next = {
      ...progress,
      last_read_at: progress.last_read_at || new Date().toISOString(),
    };
    setQuranProgress(next);
    writeJson(QURAN_KEY, next);
  }, []);

  const value = useMemo(
    () => ({
      hydrated,
      recentlyViewed,
      lastFeature,
      quranProgress,
      trackRecent,
      trackFeature,
      saveQuranProgress,
    }),
    [
      hydrated,
      lastFeature,
      quranProgress,
      recentlyViewed,
      saveQuranProgress,
      trackFeature,
      trackRecent,
    ],
  );

  return (
    <PersonalizationContext.Provider value={value}>
      {children}
    </PersonalizationContext.Provider>
  );
}

export function usePersonalization() {
  const context = useContext(PersonalizationContext);
  if (!context) {
    throw new Error(
      "usePersonalization must be used within a PersonalizationProvider",
    );
  }
  return context;
}
