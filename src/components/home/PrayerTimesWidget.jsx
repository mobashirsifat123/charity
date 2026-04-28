"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Lottie from "lottie-react";

import qiblaCompassAnimation from "@/assets/lottie/qibla-compass.json";
import { normalizeDegrees, shortestAngleDelta } from "@/lib/qibla";
import { useLanguage } from "@/context/LanguageContext";
import usePrayerTimes from "@/hooks/usePrayerTimes";

const PRAYER_ORDER = ["Fajr", "Dhuhr", "Asr", "Maghrib", "Isha"];
const PRAYER_COPY = {
  en: {
    prayers: {
      Fajr: "Fajr",
      Dhuhr: "Dhuhr",
      Asr: "Asr",
      Maghrib: "Maghrib",
      Isha: "Isha",
    },
    dailyWorship: "Daily Worship",
    prayerTimes: "Prayer Times",
    loadingLocation: "Loading your location",
    hijriDate: "Hijri date",
    updating: "Updating...",
    useLocation: "Use my location",
    nextPrayer: "Next upcoming prayer",
    calculating: "Calculating...",
    isIn: "is in",
    waiting: "Waiting for prayer data...",
    scheduledAt: "Scheduled at",
    fallbackPreparing: "Fallback prayer time data is being prepared.",
    localTiming: "Local timing",
    fallbackTiming: "Fallback timing",
    liveCountdown: "Live countdown",
    next: "Next",
    updatingTimes: "Updating prayer times...",
    locationOptional:
      "Location is optional. Click “Use my location” for local prayer times.",
    qibla: "Qibla",
    qiblaTitle: "Find the direction of prayer",
    qiblaDescription:
      "Using the same location data, this compass points toward the Qibla. On supported phones it can follow your heading live, and it falls back to a North-up guide everywhere else.",
    utilityTitle: "One location, two utilities",
    utilityMeta: "Prayer timings and Qibla guidance stay in sync.",
    qiblaDirection: "Qibla direction",
    aligned: "Aligned with the Qibla.",
    toRight: "to your right",
    toLeft: "to your left",
    north: "Clockwise from North",
    enableCompass: "Enable live compass",
    calibrate: "Move your device gently so the compass can calibrate.",
    denied: "Compass access was denied, so this view stays in North-up mode.",
    unsupported:
      "Live compass heading is not supported here. Use the degree value with North at the top.",
  },
  bn: {
    prayers: {
      Fajr: "ফজর",
      Dhuhr: "যোহর",
      Asr: "আসর",
      Maghrib: "মাগরিব",
      Isha: "এশা",
    },
    dailyWorship: "দৈনিক ইবাদত",
    prayerTimes: "নামাজের সময়",
    loadingLocation: "আপনার অবস্থান লোড হচ্ছে",
    hijriDate: "হিজরি তারিখ",
    updating: "আপডেট হচ্ছে...",
    useLocation: "আমার অবস্থান ব্যবহার করুন",
    nextPrayer: "পরবর্তী নামাজ",
    calculating: "হিসাব করা হচ্ছে...",
    isIn: "বাকি",
    waiting: "নামাজের তথ্যের জন্য অপেক্ষা করা হচ্ছে...",
    scheduledAt: "সময়",
    fallbackPreparing: "বিকল্প নামাজের সময় প্রস্তুত করা হচ্ছে।",
    localTiming: "স্থানীয় সময়",
    fallbackTiming: "বিকল্প সময়",
    liveCountdown: "লাইভ কাউন্টডাউন",
    next: "পরবর্তী",
    updatingTimes: "নামাজের সময় আপডেট হচ্ছে...",
    locationOptional:
      "অবস্থান দেওয়া ঐচ্ছিক। স্থানীয় নামাজের সময় দেখতে “আমার অবস্থান ব্যবহার করুন” চাপুন।",
    qibla: "কিবলা",
    qiblaTitle: "নামাজের দিক খুঁজুন",
    qiblaDescription:
      "একই অবস্থানের তথ্য ব্যবহার করে এই কম্পাস কিবলার দিকে দেখায়। সমর্থিত ফোনে এটি আপনার দিক অনুসরণ করতে পারে, অন্যথায় উত্তরকে ওপর ধরে নির্দেশনা দেয়।",
    utilityTitle: "এক অবস্থান, দুই সুবিধা",
    utilityMeta: "নামাজের সময় ও কিবলা নির্দেশনা একসাথে থাকে।",
    qiblaDirection: "কিবলার দিক",
    aligned: "আপনি কিবলার দিকে আছেন।",
    toRight: "ডান দিকে",
    toLeft: "বাম দিকে",
    north: "উত্তর থেকে ঘড়ির কাঁটার দিকে",
    enableCompass: "লাইভ কম্পাস চালু করুন",
    calibrate: "কম্পাস ক্যালিব্রেট করতে ডিভাইসটি আস্তে নাড়ুন।",
    denied: "কম্পাস অনুমতি বন্ধ আছে, তাই এটি উত্তর-ভিত্তিক নির্দেশনা দেখাচ্ছে।",
    unsupported:
      "এখানে লাইভ কম্পাস সমর্থিত নয়। ওপরের দিককে উত্তর ধরে ডিগ্রি মান ব্যবহার করুন।",
  },
  ar: {
    prayers: {
      Fajr: "الفجر",
      Dhuhr: "الظهر",
      Asr: "العصر",
      Maghrib: "المغرب",
      Isha: "العشاء",
    },
    dailyWorship: "العبادة اليومية",
    prayerTimes: "مواقيت الصلاة",
    loadingLocation: "جار تحميل موقعك",
    hijriDate: "التاريخ الهجري",
    updating: "جار التحديث...",
    useLocation: "استخدم موقعي",
    nextPrayer: "الصلاة القادمة",
    calculating: "جار الحساب...",
    isIn: "بعد",
    waiting: "بانتظار بيانات الصلاة...",
    scheduledAt: "الموعد",
    fallbackPreparing: "جار تجهيز مواقيت الصلاة الاحتياطية.",
    localTiming: "توقيت محلي",
    fallbackTiming: "توقيت احتياطي",
    liveCountdown: "عد تنازلي مباشر",
    next: "القادمة",
    updatingTimes: "جار تحديث مواقيت الصلاة...",
    locationOptional:
      "الموقع اختياري. اضغط “استخدم موقعي” لعرض المواقيت المحلية.",
    qibla: "القبلة",
    qiblaTitle: "اعرف اتجاه الصلاة",
    qiblaDescription:
      "باستخدام نفس بيانات الموقع، تشير هذه البوصلة نحو القبلة. في الهواتف المدعومة يمكنها متابعة اتجاهك مباشرة، وإلا تعرض دليلا من اتجاه الشمال.",
    utilityTitle: "موقع واحد، فائدتان",
    utilityMeta: "تبقى مواقيت الصلاة واتجاه القبلة متزامنين.",
    qiblaDirection: "اتجاه القبلة",
    aligned: "أنت متجه نحو القبلة.",
    toRight: "إلى يمينك",
    toLeft: "إلى يسارك",
    north: "باتجاه عقارب الساعة من الشمال",
    enableCompass: "تفعيل البوصلة المباشرة",
    calibrate: "حرّك جهازك برفق حتى تتم معايرة البوصلة.",
    denied: "تم رفض إذن البوصلة، لذلك يبقى العرض معتمدا على الشمال.",
    unsupported:
      "اتجاه البوصلة المباشر غير مدعوم هنا. استخدم قيمة الدرجة مع وضع الشمال في الأعلى.",
  },
};
const HEADING_INPUT_DEADBAND_DEGREES = 4;
const HEADING_RENDER_DEADBAND_DEGREES = 0.35;
const HEADING_SMOOTHING_FACTOR = 0.12;
const HEADING_SOURCE_RANK = {
  fallback: 1,
  absolute: 2,
  webkit: 3,
};

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

function formatRemainingTime(totalSeconds, locale = "en") {
  const safeSeconds = Math.max(totalSeconds, 0);
  const hours = Math.floor(safeSeconds / 3600);
  const minutes = Math.floor((safeSeconds % 3600) / 60);
  const seconds = safeSeconds % 60;
  const units =
    locale === "bn"
      ? { hour: "ঘণ্টা", minute: "মিনিট", second: "সেকেন্ড" }
      : locale === "ar"
        ? { hour: "س", minute: "د", second: "ث" }
        : { hour: "h", minute: "m", second: "s" };

  if (hours > 0) {
    return `${hours}${units.hour} ${minutes}${units.minute} ${seconds}${units.second}`;
  }

  if (minutes > 0) {
    return `${minutes}${units.minute} ${seconds}${units.second}`;
  }

  return `${seconds}${units.second}`;
}

function readHeadingFromEvent(event, eventName = "") {
  if (!event) {
    return null;
  }

  if (
    typeof event.webkitCompassHeading === "number" &&
    Number.isFinite(event.webkitCompassHeading)
  ) {
    return {
      heading: normalizeDegrees(event.webkitCompassHeading),
      source: "webkit",
    };
  }

  if (eventName === "deviceorientationabsolute" || event.absolute === true) {
    if (typeof event.alpha === "number" && Number.isFinite(event.alpha)) {
      return {
        heading: normalizeDegrees(360 - event.alpha),
        source: "absolute",
      };
    }
  }

  if (typeof event.alpha === "number" && Number.isFinite(event.alpha)) {
    return {
      heading: normalizeDegrees(360 - event.alpha),
      source: "fallback",
    };
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
  const sourceRef = useRef(null);

  const setStableTargetHeading = (nextHeading) => {
    const currentTarget = targetHeadingRef.current;

    if (typeof currentTarget !== "number") {
      targetHeadingRef.current = normalizeDegrees(nextHeading);
      return;
    }

    const delta = shortestAngleDelta(currentTarget, nextHeading);

    if (Math.abs(delta) < HEADING_INPUT_DEADBAND_DEGREES) {
      return;
    }

    const smoothingFactor = Math.abs(delta) > 45 ? 1 : 0.45;
    targetHeadingRef.current = normalizeDegrees(
      currentTarget + delta * smoothingFactor,
    );
  };

  useEffect(() => {
    if (typeof window === "undefined") {
      return undefined;
    }

    const animateHeading = () => {
      const targetHeading = targetHeadingRef.current;
      const currentHeading = animatedHeadingRef.current;

      if (typeof targetHeading === "number") {
        const headingDelta =
          typeof currentHeading === "number"
            ? shortestAngleDelta(
                normalizeDegrees(currentHeading),
                targetHeading,
              )
            : 0;
        const nextHeading =
          typeof currentHeading === "number"
            ? currentHeading + headingDelta * HEADING_SMOOTHING_FACTOR
            : targetHeading;

        const shouldUpdate =
          typeof currentHeading !== "number" ||
          Math.abs(headingDelta) > HEADING_RENDER_DEADBAND_DEGREES;

        animatedHeadingRef.current = shouldUpdate ? nextHeading : targetHeading;
        if (shouldUpdate) {
          setHeading(normalizeDegrees(nextHeading));
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

      const handleOrientation = (event, eventName) => {
        const reading = readHeadingFromEvent(event, eventName);
        if (!reading || typeof reading.heading !== "number") {
          return;
        }

        const activeSource = sourceRef.current;
        const activeRank = HEADING_SOURCE_RANK[activeSource] || 0;
        const nextRank = HEADING_SOURCE_RANK[reading.source] || 0;

        if (activeSource && nextRank < activeRank) {
          return;
        }

        if (!activeSource || nextRank > activeRank) {
          sourceRef.current = reading.source;
        }

        setStableTargetHeading(reading.heading);
        setPermissionState("granted");
      };

      for (const eventName of [
        "deviceorientationabsolute",
        "deviceorientation",
      ]) {
        const boundHandler = (event) => handleOrientation(event, eventName);
        window.addEventListener(eventName, boundHandler, true);
        listenersRef.current.push([eventName, boundHandler]);
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

      const handleOrientation = (event, eventName) => {
        const reading = readHeadingFromEvent(event, eventName);
        if (!reading || typeof reading.heading !== "number") {
          return;
        }

        const activeSource = sourceRef.current;
        const activeRank = HEADING_SOURCE_RANK[activeSource] || 0;
        const nextRank = HEADING_SOURCE_RANK[reading.source] || 0;

        if (activeSource && nextRank < activeRank) {
          return;
        }

        if (!activeSource || nextRank > activeRank) {
          sourceRef.current = reading.source;
        }

        setStableTargetHeading(reading.heading);
        setPermissionState("granted");
      };

      if (!isListeningRef.current) {
        for (const eventName of [
          "deviceorientationabsolute",
          "deviceorientation",
        ]) {
          const boundHandler = (event) => handleOrientation(event, eventName);
          window.addEventListener(eventName, boundHandler, true);
          listenersRef.current.push([eventName, boundHandler]);
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

function PrayerCompass({ qiblaDirection = 0, copy }) {
  const { heading, permissionState, requestPermission } = useDeviceHeading();
  const lottieRef = useRef(null);
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

  useEffect(() => {
    lottieRef.current?.goToAndStop?.(0, true);
  }, []);

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
            lottieRef={lottieRef}
            animationData={qiblaCompassAnimation}
            loop={false}
            autoplay={false}
            initialSegment={[0, 0]}
            className="prayer-compass-lottie__animation"
          />
        </div>
      </div>

      <p className="mt-3 mb-1 fw-semibold text-center">
        {copy.qiblaDirection}: {Math.round(normalizedQiblaDirection)}°
      </p>
      <small className="text-muted text-center">
        {liveCompassActive
          ? isAligned
            ? copy.aligned
            : `${Math.round(Math.abs(qiblaOffset || 0))}° ${qiblaOffset > 0 ? copy.toRight : copy.toLeft}`
          : copy.north}
      </small>

      {permissionState === "prompt" ? (
        <button
          type="button"
          className="btn btn-sm btn-outline-primary rounded-pill mt-3"
          onClick={requestPermission}
        >
          {copy.enableCompass}
        </button>
      ) : null}

      {permissionState === "pending" && !liveCompassActive ? (
        <small className="text-muted text-center mt-3">{copy.calibrate}</small>
      ) : null}

      {permissionState === "denied" ? (
        <small className="text-muted text-center mt-3">{copy.denied}</small>
      ) : null}

      {permissionState === "unsupported" ? (
        <small className="text-muted text-center mt-3">
          {copy.unsupported}
        </small>
      ) : null}
    </div>
  );
}

export default function PrayerTimesWidget({ initialData }) {
  const { locale } = useLanguage();
  const { data, loading, error, permissionState, requestLocalPrayerTimes } =
    usePrayerTimes(initialData);
  const [countdown, setCountdown] = useState(null);
  const copy = PRAYER_COPY[locale] || PRAYER_COPY.en;

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
    <section className="home-prayer-section py-4 py-lg-5 page-surface-alt section-shell">
      <div className="container position-relative">
        <div className="row g-4 align-items-stretch">
          <div className="col-xl-7">
            <div className="card border-0 shadow-sm rounded-4 h-100 system-panel glass-surface--light">
              <div className="card-body p-3 p-lg-4">
                <div className="d-flex flex-wrap justify-content-between align-items-start gap-3 mb-4">
                  <div>
                    <span className="section-header-rail mb-3">
                      {copy.dailyWorship}
                    </span>
                    <h2 className="fw-bold mb-2">{copy.prayerTimes}</h2>
                    <p className="text-muted mb-0">
                      {data?.locationName || copy.loadingLocation}
                      {data?.date ? ` • ${data.date}` : ""}
                    </p>
                  </div>

                  <div className="text-lg-end">
                    <p className="text-muted small mb-1">{copy.hijriDate}</p>
                    <strong>{data?.hijriDate || "..."}</strong>
                    <div className="mt-3">
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-primary rounded-pill"
                        onClick={requestLocalPrayerTimes}
                        disabled={loading || permissionState === "unavailable"}
                      >
                        <i className="fa-solid fa-location-crosshairs me-2" />
                        {loading ? copy.updating : copy.useLocation}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="system-panel--dark aurora-grid rounded-4 p-4 mb-4">
                  <p className="text-white-50 text-uppercase small fw-semibold mb-2">
                    {copy.nextPrayer}
                  </p>
                  <h3 className="text-white fw-bold mb-2">
                    {copy.prayers[countdown?.name] || copy.calculating}
                  </h3>
                  <p className="text-white mb-1 fs-5">
                    {countdown
                      ? `${copy.prayers[countdown.name] || countdown.name} ${copy.isIn} ${formatRemainingTime(countdown.remainingSeconds, locale)}`
                      : copy.waiting}
                  </p>
                  <small className="text-white-50">
                    {countdown?.time
                      ? `${copy.scheduledAt} ${countdown.time}`
                      : copy.fallbackPreparing}
                  </small>
                  <div className="d-flex flex-wrap gap-2 mt-4">
                    <span className="signal-chip">
                      <span className="signal-chip__dot signal-chip__dot--green" />
                      {data?.source === "browser-location"
                        ? copy.localTiming
                        : copy.fallbackTiming}
                    </span>
                    <span className="signal-chip">
                      <span className="signal-chip__dot" />
                      {copy.liveCountdown}
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
                            <span className="fw-semibold">
                              {copy.prayers[prayer.name] || prayer.name}
                            </span>
                            {isNext ? (
                              <span className="badge bg-warning text-dark rounded-pill">
                                {copy.next}
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
                    {copy.updatingTimes}
                  </p>
                ) : permissionState === "prompt" ||
                  permissionState === "available" ? (
                  <p className="text-muted small mt-3 mb-0">
                    {copy.locationOptional}
                  </p>
                ) : null}
              </div>
            </div>
          </div>

          <div className="col-xl-5">
            <div className="card border-0 shadow-sm rounded-4 h-100 system-panel glass-surface--light">
              <div className="card-body p-3 p-lg-4 d-flex flex-column justify-content-center">
                <span className="section-header-rail mb-3 align-self-start">
                  {copy.qibla}
                </span>
                <h3 className="fw-bold mb-3">{copy.qiblaTitle}</h3>
                <p className="text-muted mb-4">{copy.qiblaDescription}</p>
                <div className="system-list mb-4">
                  <div className="system-list__item">
                    <span className="system-list__icon">
                      <i className="fa-solid fa-location-arrow" />
                    </span>
                    <div>
                      <span className="system-list__title">
                        {copy.utilityTitle}
                      </span>
                      <span className="system-list__meta">
                        {copy.utilityMeta}
                      </span>
                    </div>
                  </div>
                </div>
                <PrayerCompass
                  qiblaDirection={data?.qiblaDirection || 0}
                  copy={copy}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
