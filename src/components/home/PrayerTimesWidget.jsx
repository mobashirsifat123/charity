"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Lottie from "lottie-react";

import qiblaCompassAnimation from "@/assets/lottie/qibla-compass.json";
import { normalizeDegrees, shortestAngleDelta } from "@/lib/qibla";
import usePrayerTimes from "@/hooks/usePrayerTimes";

const PRAYER_ORDER = ["Fajr", "Dhuhr", "Asr", "Maghrib", "Isha"];

function parseClockToSeconds(value = "00:00") {
  const [hours, minutes] = String(value).split(":").map(Number);
  return (hours || 0) * 3600 + (minutes || 0) * 60;
}

function getCurrentTimeInZone(timeZone) {
  const formatter = new Intl.DateTimeFormat("en-GB", {
    timeZone,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });

  const parts = formatter.formatToParts(new Date());
  const getPart = (type) =>
    Number(parts.find((part) => part.type === type)?.value || 0);

  return {
    hours: getPart("hour"),
    minutes: getPart("minute"),
    seconds: getPart("second"),
  };
}

function getNextPrayerState(timings = {}, timeZone = "UTC") {
  const now = getCurrentTimeInZone(timeZone);
  const nowSeconds = now.hours * 3600 + now.minutes * 60 + now.seconds;

  const entries = PRAYER_ORDER.map((name) => ({
    name,
    time: timings[name],
    seconds: parseClockToSeconds(timings[name]),
  })).filter((entry) => entry.time);

  if (!entries.length) {
    return null;
  }

  const upcomingToday = entries.find((entry) => entry.seconds > nowSeconds);
  if (upcomingToday) {
    return {
      ...upcomingToday,
      remainingSeconds: upcomingToday.seconds - nowSeconds,
    };
  }

  const tomorrowPrayer = entries[0];
  return {
    ...tomorrowPrayer,
    remainingSeconds: 24 * 3600 - nowSeconds + tomorrowPrayer.seconds,
  };
}

function formatRemainingTime(totalSeconds) {
  const safeSeconds = Math.max(totalSeconds, 0);
  const hours = Math.floor(safeSeconds / 3600);
  const minutes = Math.floor((safeSeconds % 3600) / 60);
  const seconds = safeSeconds % 60;

  if (hours > 0) {
    return `${hours}h ${minutes}m ${seconds}s`;
  }

  if (minutes > 0) {
    return `${minutes}m ${seconds}s`;
  }

  return `${seconds}s`;
}

function readHeadingFromEvent(event) {
  if (!event) {
    return null;
  }

  if (
    typeof event.webkitCompassHeading === "number" &&
    Number.isFinite(event.webkitCompassHeading)
  ) {
    return normalizeDegrees(event.webkitCompassHeading);
  }

  if (typeof event.alpha === "number" && Number.isFinite(event.alpha)) {
    return normalizeDegrees(360 - event.alpha);
  }

  return null;
}

function useDeviceHeading() {
  const [heading, setHeading] = useState(null);
  const [permissionState, setPermissionState] = useState("checking");
  const targetHeadingRef = useRef(null);
  const animatedHeadingRef = useRef(null);
  const frameRef = useRef(null);
  const listenersRef = useRef([]);
  const isListeningRef = useRef(false);

  useEffect(() => {
    if (typeof window === "undefined") {
      return undefined;
    }

    const animateHeading = () => {
      const targetHeading = targetHeadingRef.current;
      const currentHeading = animatedHeadingRef.current;

      if (typeof targetHeading === "number") {
        const nextHeading =
          typeof currentHeading === "number"
            ? currentHeading +
              shortestAngleDelta(
                normalizeDegrees(currentHeading),
                targetHeading,
              ) *
                0.18
            : targetHeading;

        const shouldUpdate =
          typeof currentHeading !== "number" ||
          Math.abs(nextHeading - currentHeading) > 0.05;

        animatedHeadingRef.current = nextHeading;
        if (shouldUpdate) {
          setHeading(nextHeading);
        }
      }

      frameRef.current = window.requestAnimationFrame(animateHeading);
    };

    frameRef.current = window.requestAnimationFrame(animateHeading);

    return () => {
      if (frameRef.current) {
        window.cancelAnimationFrame(frameRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") {
      return undefined;
    }

    const stopListening = () => {
      for (const [eventName, handler] of listenersRef.current) {
        window.removeEventListener(eventName, handler, true);
      }
      listenersRef.current = [];
      isListeningRef.current = false;
    };

    const startListening = () => {
      if (isListeningRef.current) {
        return;
      }

      const handleOrientation = (event) => {
        const nextHeading = readHeadingFromEvent(event);
        if (typeof nextHeading !== "number") {
          return;
        }

        targetHeadingRef.current = nextHeading;
        setPermissionState("granted");
      };

      for (const eventName of [
        "deviceorientationabsolute",
        "deviceorientation",
      ]) {
        window.addEventListener(eventName, handleOrientation, true);
        listenersRef.current.push([eventName, handleOrientation]);
      }

      isListeningRef.current = true;
    };

    if (typeof window.DeviceOrientationEvent === "undefined") {
      setPermissionState("unsupported");
      return stopListening;
    }

    if (typeof window.DeviceOrientationEvent.requestPermission === "function") {
      setPermissionState("prompt");
      return stopListening;
    }

    setPermissionState("pending");
    startListening();

    return stopListening;
  }, []);

  const requestPermission = async () => {
    if (typeof window === "undefined") {
      return;
    }

    if (typeof window.DeviceOrientationEvent === "undefined") {
      setPermissionState("unsupported");
      return;
    }

    try {
      if (
        typeof window.DeviceOrientationEvent.requestPermission === "function"
      ) {
        setPermissionState("pending");
        const permissionResult =
          await window.DeviceOrientationEvent.requestPermission();

        if (permissionResult !== "granted") {
          setPermissionState("denied");
          return;
        }
      }

      const handleOrientation = (event) => {
        const nextHeading = readHeadingFromEvent(event);
        if (typeof nextHeading !== "number") {
          return;
        }

        targetHeadingRef.current = nextHeading;
        setPermissionState("granted");
      };

      if (!isListeningRef.current) {
        for (const eventName of [
          "deviceorientationabsolute",
          "deviceorientation",
        ]) {
          window.addEventListener(eventName, handleOrientation, true);
          listenersRef.current.push([eventName, handleOrientation]);
        }
        isListeningRef.current = true;
      }
    } catch (error) {
      console.error("Unable to enable live compass heading:", error);
      setPermissionState("denied");
    }
  };

  return {
    heading,
    permissionState,
    requestPermission,
  };
}

function PrayerCompass({ qiblaDirection = 0 }) {
  const { heading, permissionState, requestPermission } = useDeviceHeading();
  const normalizedQiblaDirection = normalizeDegrees(qiblaDirection);
  const currentHeading =
    typeof heading === "number" ? normalizeDegrees(heading) : null;
  const qiblaOffset =
    typeof currentHeading === "number"
      ? shortestAngleDelta(currentHeading, normalizedQiblaDirection)
      : null;
  const isAligned =
    typeof qiblaOffset === "number" && Math.abs(qiblaOffset) <= 5;
  const liveCompassActive = typeof currentHeading === "number";
  const qiblaNeedleRotation = liveCompassActive
    ? qiblaOffset
    : normalizedQiblaDirection;

  return (
    <div className="d-flex flex-column align-items-center justify-content-center">
      <div className="prayer-compass-lottie" aria-hidden="true">
        <div
          className="prayer-compass-lottie__rotator"
          style={{
            transform: `rotate(${qiblaNeedleRotation}deg)`,
          }}
        >
          <Lottie
            animationData={qiblaCompassAnimation}
            loop
            autoplay
            className="prayer-compass-lottie__animation"
          />
        </div>
      </div>

      <p className="mt-3 mb-1 fw-semibold text-center">
        Qibla direction: {Math.round(normalizedQiblaDirection)}°
      </p>
      <small className="text-muted text-center">
        {liveCompassActive
          ? isAligned
            ? "Aligned with the Qibla."
            : `${Math.round(Math.abs(qiblaOffset || 0))}° ${qiblaOffset > 0 ? "to your right" : "to your left"}`
          : "Clockwise from North"}
      </small>

      {permissionState === "prompt" ? (
        <button
          type="button"
          className="btn btn-sm btn-outline-primary rounded-pill mt-3"
          onClick={requestPermission}
        >
          Enable live compass
        </button>
      ) : null}

      {permissionState === "pending" && !liveCompassActive ? (
        <small className="text-muted text-center mt-3">
          Move your device gently so the compass can calibrate.
        </small>
      ) : null}

      {permissionState === "denied" ? (
        <small className="text-muted text-center mt-3">
          Compass access was denied, so this view stays in North-up mode.
        </small>
      ) : null}

      {permissionState === "unsupported" ? (
        <small className="text-muted text-center mt-3">
          Live compass heading is not supported here. Use the degree value with
          North at the top.
        </small>
      ) : null}
    </div>
  );
}

export default function PrayerTimesWidget({ initialData }) {
  const { data, loading, error, permissionState, requestLocalPrayerTimes } =
    usePrayerTimes(initialData);
  const [countdown, setCountdown] = useState(null);

  useEffect(() => {
    const updateCountdown = () => {
      setCountdown(getNextPrayerState(data?.timings, data?.timeZone));
    };

    updateCountdown();
    const intervalId = window.setInterval(updateCountdown, 1000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [data]);

  const prayerRows = useMemo(
    () =>
      PRAYER_ORDER.map((name) => ({
        name,
        time: data?.timings?.[name] || "--:--",
      })),
    [data],
  );

  return (
    <section className="py-5 page-surface-alt section-shell">
      <div className="container position-relative">
        <div className="row g-4 align-items-stretch">
          <div className="col-xl-7">
            <div className="card border-0 shadow-sm rounded-4 h-100 system-panel glass-surface--light">
              <div className="card-body p-4 p-lg-5">
                <div className="d-flex flex-wrap justify-content-between align-items-start gap-3 mb-4">
                  <div>
                    <span className="section-header-rail mb-3">
                      Daily Worship
                    </span>
                    <h2 className="fw-bold mb-2">Prayer Times</h2>
                    <p className="text-muted mb-0">
                      {data?.locationName || "Loading your location"}
                      {data?.date ? ` • ${data.date}` : ""}
                    </p>
                  </div>

                  <div className="text-lg-end">
                    <p className="text-muted small mb-1">Hijri date</p>
                    <strong>{data?.hijriDate || "Unavailable"}</strong>
                    <div className="mt-3">
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-primary rounded-pill"
                        onClick={requestLocalPrayerTimes}
                        disabled={
                          loading ||
                          permissionState === "denied" ||
                          permissionState === "unavailable"
                        }
                      >
                        <i className="fa-solid fa-location-crosshairs me-2" />
                        {loading ? "Updating..." : "Use my location"}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="system-panel--dark aurora-grid rounded-4 p-4 mb-4">
                  <p className="text-white-50 text-uppercase small fw-semibold mb-2">
                    Next upcoming prayer
                  </p>
                  <h3 className="text-white fw-bold mb-2">
                    {countdown?.name || "Calculating..."}
                  </h3>
                  <p className="text-white mb-1 fs-5">
                    {countdown
                      ? `${countdown.name} is in ${formatRemainingTime(countdown.remainingSeconds)}`
                      : "Waiting for prayer data..."}
                  </p>
                  <small className="text-white-50">
                    {countdown?.time
                      ? `Scheduled at ${countdown.time}`
                      : "Fallback prayer time data is being prepared."}
                  </small>
                  <div className="d-flex flex-wrap gap-2 mt-4">
                    <span className="signal-chip">
                      <span className="signal-chip__dot signal-chip__dot--green" />
                      {data?.source === "browser-location"
                        ? "Local timing"
                        : "Fallback timing"}
                    </span>
                    <span className="signal-chip">
                      <span className="signal-chip__dot" />
                      Live countdown
                    </span>
                  </div>
                </div>

                {error ? (
                  <div className="alert alert-warning border-0 rounded-4">
                    {error}
                  </div>
                ) : null}

                <div className="row g-3">
                  {prayerRows.map((prayer) => {
                    const isNext = prayer.name === countdown?.name;

                    return (
                      <div key={prayer.name} className="col-md-6 col-xl-4">
                        <div
                          className="rounded-4 h-100 p-3 border"
                          style={{
                            background: isNext
                              ? "rgba(200,169,81,0.12)"
                              : "#fff",
                            borderColor: isNext
                              ? "rgba(200,169,81,0.25)"
                              : "rgba(11,61,46,0.08)",
                          }}
                        >
                          <div className="d-flex justify-content-between align-items-center">
                            <span className="fw-semibold">{prayer.name}</span>
                            {isNext ? (
                              <span className="badge bg-warning text-dark rounded-pill">
                                Next
                              </span>
                            ) : null}
                          </div>
                          <h5 className="fw-bold mt-3 mb-0">{prayer.time}</h5>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {loading ? (
                  <p className="text-muted small mt-3 mb-0">
                    Updating prayer times...
                  </p>
                ) : permissionState === "prompt" ||
                  permissionState === "available" ? (
                  <p className="text-muted small mt-3 mb-0">
                    Location is optional. Click “Use my location” for local
                    prayer times.
                  </p>
                ) : null}
              </div>
            </div>
          </div>

          <div className="col-xl-5">
            <div className="card border-0 shadow-sm rounded-4 h-100 system-panel glass-surface--light">
              <div className="card-body p-4 p-lg-5 d-flex flex-column justify-content-center">
                <span className="section-header-rail mb-3 align-self-start">
                  Qibla
                </span>
                <h3 className="fw-bold mb-3">Find the direction of prayer</h3>
                <p className="text-muted mb-4">
                  Using the same location data, this compass points toward the
                  Qibla. On supported phones it can follow your heading live,
                  and it falls back to a North-up guide everywhere else.
                </p>
                <div className="system-list mb-4">
                  <div className="system-list__item">
                    <span className="system-list__icon">
                      <i className="fa-solid fa-location-arrow" />
                    </span>
                    <div>
                      <span className="system-list__title">
                        One location, two utilities
                      </span>
                      <span className="system-list__meta">
                        Prayer timings and Qibla guidance stay in sync.
                      </span>
                    </div>
                  </div>
                </div>
                <PrayerCompass qiblaDirection={data?.qiblaDirection || 0} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
