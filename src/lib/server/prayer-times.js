import { calculateQiblaDirection } from '@/lib/qibla';

const DEFAULT_PRAYER_METHOD = 2;
const PRAYER_TIMES_REVALIDATE_SECONDS = 60 * 30;
const PRAYER_API_TIMEOUT_MS = 5000;

export const DEFAULT_PRAYER_LOCATION = {
  city: 'London',
  country: 'United Kingdom',
  label: 'London, United Kingdom',
  latitude: 51.5072,
  longitude: -0.1276,
  timeZone: 'Europe/London',
};

const PRAYER_FIELDS = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];

const STATIC_FALLBACK_TIMINGS = {
  Fajr: '05:12',
  Dhuhr: '12:58',
  Asr: '16:37',
  Maghrib: '19:41',
  Isha: '21:02',
};

async function fetchJson(url) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), PRAYER_API_TIMEOUT_MS);

  let response;

  try {
    response = await fetch(url, {
      next: { revalidate: PRAYER_TIMES_REVALIDATE_SECONDS },
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timeoutId);
  }

  if (!response.ok) {
    throw new Error(`Failed to fetch prayer data: ${response.status}`);
  }

  return response.json();
}

function buildStaticFallbackPayload() {
  return {
    source: 'static-fallback',
    locationName: DEFAULT_PRAYER_LOCATION.label,
    coordinates: {
      latitude: DEFAULT_PRAYER_LOCATION.latitude,
      longitude: DEFAULT_PRAYER_LOCATION.longitude,
    },
    method: DEFAULT_PRAYER_METHOD,
    date: '',
    hijriDate: '',
    timeZone: DEFAULT_PRAYER_LOCATION.timeZone,
    timings: STATIC_FALLBACK_TIMINGS,
    qiblaDirection: calculateQiblaDirection(
      DEFAULT_PRAYER_LOCATION.latitude,
      DEFAULT_PRAYER_LOCATION.longitude
    ),
  };
}

function cleanTimingValue(value = '') {
  return String(value).split(' ')[0].trim();
}

function normalizePrayerPayload({ timingsPayload, locationName, latitude, longitude, fallbackTimeZone }) {
  const timings = {};

  for (const field of PRAYER_FIELDS) {
    timings[field] = cleanTimingValue(timingsPayload?.data?.timings?.[field] || '');
  }

  return {
    source: 'server-fallback',
    locationName,
    coordinates: {
      latitude,
      longitude,
    },
    method: DEFAULT_PRAYER_METHOD,
    date: timingsPayload?.data?.date?.readable || '',
    hijriDate: timingsPayload?.data?.date?.hijri?.date || '',
    timeZone: timingsPayload?.data?.meta?.timezone || fallbackTimeZone,
    timings,
    qiblaDirection: calculateQiblaDirection(latitude, longitude),
  };
}

export async function getPrayerTimesForCoordinates({
  latitude,
  longitude,
  locationName = 'Your location',
  fallbackTimeZone = 'UTC',
}) {
  const timingsPayload = await fetchJson(
    `https://api.aladhan.com/v1/timings?latitude=${latitude}&longitude=${longitude}&method=${DEFAULT_PRAYER_METHOD}`
  );

  return normalizePrayerPayload({
    timingsPayload,
    locationName,
    latitude,
    longitude,
    fallbackTimeZone,
  });
}

export async function getFallbackPrayerTimes() {
  try {
    return await getPrayerTimesForCoordinates({
      latitude: DEFAULT_PRAYER_LOCATION.latitude,
      longitude: DEFAULT_PRAYER_LOCATION.longitude,
      locationName: DEFAULT_PRAYER_LOCATION.label,
      fallbackTimeZone: DEFAULT_PRAYER_LOCATION.timeZone,
    });
  } catch (error) {
    console.warn('Falling back to static prayer times because the remote prayer API is unavailable:', error);
    return buildStaticFallbackPayload();
  }
}
