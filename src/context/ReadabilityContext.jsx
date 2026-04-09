"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

const STORAGE_KEY = "irwa-readability-text-size";
const TEXT_SIZE_ORDER = ["small", "normal", "large", "x-large"];
const TEXT_SIZE_SCALE = {
  small: 0.95,
  normal: 1,
  large: 1.125,
  "x-large": 1.25,
};

const ReadabilityContext = createContext(null);

export function ReadabilityProvider({ children }) {
  const [textSize, setTextSize] = useState("normal");

  useEffect(() => {
    if (typeof window === "undefined") return;

    const savedValue = window.localStorage.getItem(STORAGE_KEY);
    if (savedValue && TEXT_SIZE_ORDER.includes(savedValue)) {
      setTextSize(savedValue);
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(STORAGE_KEY, textSize);
  }, [textSize]);

  const currentIndex = TEXT_SIZE_ORDER.indexOf(textSize);

  const decreaseTextSize = () => {
    setTextSize((current) => {
      const index = TEXT_SIZE_ORDER.indexOf(current);
      return TEXT_SIZE_ORDER[Math.max(index - 1, 0)];
    });
  };

  const increaseTextSize = () => {
    setTextSize((current) => {
      const index = TEXT_SIZE_ORDER.indexOf(current);
      return TEXT_SIZE_ORDER[Math.min(index + 1, TEXT_SIZE_ORDER.length - 1)];
    });
  };

  const resetTextSize = () => {
    setTextSize("normal");
  };

  const value = useMemo(
    () => ({
      textSize,
      textScale: TEXT_SIZE_SCALE[textSize] || 1,
      canDecrease: currentIndex > 0,
      canIncrease: currentIndex < TEXT_SIZE_ORDER.length - 1,
      decreaseTextSize,
      increaseTextSize,
      resetTextSize,
      getReadingStyle: () => ({
        fontSize: `${TEXT_SIZE_SCALE[textSize] || 1}rem`,
      }),
    }),
    [currentIndex, textSize]
  );

  return (
    <ReadabilityContext.Provider value={value}>
      {children}
    </ReadabilityContext.Provider>
  );
}

export function useReadability() {
  const context = useContext(ReadabilityContext);

  if (!context) {
    throw new Error("useReadability must be used within a ReadabilityProvider.");
  }

  return context;
}

export default ReadabilityContext;
