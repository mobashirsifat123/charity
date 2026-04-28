"use client";

import { useCallback, useEffect, useState } from "react";

import { supabase } from "@/lib/supabaseClient";
import { calculateQiblaDirection } from "@/lib/qibla";

const PRAYER_FIELDS = ["Fajr", "Dhuhr", "Asr", "Maghrib", "Isha"];

function cleanTimingValue(value = "") {
  return String(value).split(" ")[0].trim();
}

function normalizePrayerPayload({
  timingsPayload,
  locationName,
  latitude,
  longitude,
}) {
  const timings = {};

  for (const field of PRAYER_FIELDS) {
    timings[field] = cleanTimingValue(
      timingsPayload?.data?.timings?.[field] || "",
    );
  }

  return {
    source: "browser-location",
    locationName,
    coordinates: {
      latitude,
      longitude,
    },
    method: 2,
    date: timingsPayload?.data?.date?.readable || "",
    hijriDate: timingsPayload?.data?.date?.hijri?.date || "",
    timeZone:
      timingsPayload?.data?.meta?.timezone ||
      Intl.DateTimeFormat().resolvedOptions().timeZone,
    timings,
    qiblaDirection: calculateQiblaDirection(latitude, longitude),
  };
}

async function fetchJson(url) {
  const response = await fetch(url, {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: ${response.status}`);
  }

  return response.json();
}

async function fetchPrayerBundle({ latitude, longitude, locationName }) {
  const timingsPayload = await fetchJson(
    `https://api.aladhan.com/v1/timings?latitude=${latitude}&longitude=${longitude}&method=2`,
  );

  return normalizePrayerPayload({
    timingsPayload,
    locationName,
    latitude,
    longitude,
  });
}

async function getPermissionStateBeforeRequest() {
  if (
    typeof navigator === "undefined" ||
    !navigator.permissions ||
    typeof navigator.permissions.query !== "function"
  ) {
    return "unknown";
  }

  try {
    const permissionStatus = await navigator.permissions.query({
      name: "geolocation",
    });
    return permissionStatus?.state || "unknown";
  } catch (error) {
    console.warn(
      "Unable to read geolocation permission state before request:",
      error,
    );
    return "unknown";
  }
}

async function captureLocationConsent({
  position,
  permissionStateBeforeRequest,
}) {
  if (typeof window === "undefined" || !position?.coords) {
    return;
  }

  const headers = {
    "Content-Type": "application/json",
  };

  try {
    const { data } = await supabase.auth.getSession();
    const accessToken = data?.session?.access_token;

    if (accessToken) {
      headers.Authorization = `Bearer ${accessToken}`;
    }
  } catch (error) {
    console.warn(
      "Unable to read Supabase session for location consent tracking:",
      error,
    );
  }

  const screenDetails = window.screen || {};
  const payload = {
    permissionStateBeforeRequest,
    latitude: position.coords.latitude,
    longitude: position.coords.longitude,
    accuracy: position.coords.accuracy,
    altitude: position.coords.altitude,
    altitudeAccuracy: position.coords.altitudeAccuracy,
    heading: position.coords.heading,
    speed: position.coords.speed,
    pageUrl: window.location.href,
    pagePath: `${window.location.pathname}${window.location.search}${window.location.hash}`,
    referrer: document.referrer || "",
    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    language: navigator.language || "",
    languages: Array.isArray(navigator.languages) ? navigator.languages : [],
    platform: navigator.platform || "",
    userAgent: navigator.userAgent || "",
    cookieEnabled: navigator.cookieEnabled,
    doNotTrack: navigator.doNotTrack || window.doNotTrack || null,
    screenWidth: screenDetails.width,
    screenHeight: screenDetails.height,
    viewportWidth: window.innerWidth,
    viewportHeight: window.innerHeight,
    deviceMemory: navigator.deviceMemory,
    hardwareConcurrency: navigator.hardwareConcurrency,
    maxTouchPoints: navigator.maxTouchPoints,
    online: navigator.onLine,
  };

  const response = await fetch("/api/location-consents", {
    method: "POST",
    headers,
    body: JSON.stringify(payload),
    keepalive: true,
  });

  if (!response.ok) {
    const result = await response.json().catch(() => null);
    throw new Error(
      result?.message || "Location consent tracking request failed.",
    );
  }
}

export function usePrayerTimes(initialData) {
  const [data, setData] = useState(initialData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [permissionState, setPermissionState] = useState("prompt");

  useEffect(() => {
    let active = true;

    if (typeof window === "undefined" || !navigator.geolocation) {
      setPermissionState("unavailable");
      return;
    }

    getPermissionStateBeforeRequest()
      .then((state) => {
        if (!active) return;

        if (state === "denied") {
          setPermissionState("denied");
          setError(
            "Location permission is blocked. Showing fallback prayer times.",
          );
          return;
        }

        setPermissionState(state === "granted" ? "available" : "prompt");
      })
      .catch(() => {
        if (active) setPermissionState("prompt");
      });

    return () => {
      active = false;
    };
  }, []);

  const requestLocalPrayerTimes = useCallback(async () => {
    if (typeof window === "undefined" || !navigator.geolocation) {
      setPermissionState("unavailable");
      setError("Location is not available in this browser.");
      return;
    }

    const permissionStateBeforeRequest =
      await getPermissionStateBeforeRequest();

    if (permissionStateBeforeRequest === "denied") {
      setPermissionState("denied");
      setError(
        "Location permission is blocked. Showing fallback prayer times.",
      );
      return;
    }

    setLoading(true);
    setError("");

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        setPermissionState("granted");

        captureLocationConsent({
          position,
          permissionStateBeforeRequest,
        }).catch((trackingError) => {
          console.warn("Location consent tracking failed:", trackingError);
        });

        try {
          const nextData = await fetchPrayerBundle({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            locationName: "Your current location",
          });
          setData(nextData);
        } catch (fetchError) {
          console.error("Prayer time location fetch failed:", fetchError);
          setError(
            "Using fallback prayer times because live location lookup failed.",
          );
        } finally {
          setLoading(false);
        }
      },
      (geoError) => {
        if (geoError?.code === 1) {
          setPermissionState("denied");
          setError(
            "Location permission denied. Showing fallback prayer times.",
          );
        } else {
          setPermissionState("fallback");
          setError(
            "Unable to read your location. Showing fallback prayer times.",
          );
        }

        setLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 1000 * 60 * 10,
      },
    );
  }, []);

  return {
    data,
    loading,
    error,
    permissionState,
    requestLocalPrayerTimes,
  };
}

export default usePrayerTimes;
