"use client";
import { useEffect } from "react";

const InitializeAOS = () => {
  useEffect(() => {
    let cancelled = false;
    let idleCallbackId = null;
    let timeoutId = null;

    const loadAOS = async () => {
      if (typeof window === "undefined") return;
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

      const { default: AOS } = await import("aos");
      if (cancelled) return;

      AOS.init({
        duration: 700,
        once: true,
        easing: "ease-out-cubic",
        offset: 24,
      });
    };

    if ("requestIdleCallback" in window) {
      idleCallbackId = window.requestIdleCallback(() => {
        void loadAOS();
      });
    } else {
      timeoutId = window.setTimeout(() => {
        void loadAOS();
      }, 1);
    }

    return () => {
      cancelled = true;

      if (idleCallbackId !== null && "cancelIdleCallback" in window) {
        window.cancelIdleCallback(idleCallbackId);
      }

      if (timeoutId !== null) {
        window.clearTimeout(timeoutId);
      }
    };
  }, []);

  return null;
};

export default InitializeAOS;
