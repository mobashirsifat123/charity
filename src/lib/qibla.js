const KAABA_COORDINATES = {
  latitude: 21.422487,
  longitude: 39.826206,
};

function toRadians(value) {
  return (Number(value) * Math.PI) / 180;
}

function toDegrees(value) {
  return (Number(value) * 180) / Math.PI;
}

export function normalizeDegrees(value = 0) {
  const numericValue = Number(value);

  if (!Number.isFinite(numericValue)) {
    return 0;
  }

  return ((numericValue % 360) + 360) % 360;
}

export function shortestAngleDelta(from = 0, to = 0) {
  const delta = normalizeDegrees(to - from);
  return delta > 180 ? delta - 360 : delta;
}

export function calculateBearing({
  fromLatitude,
  fromLongitude,
  toLatitude,
  toLongitude,
}) {
  const startLatitude = Number(fromLatitude);
  const startLongitude = Number(fromLongitude);
  const endLatitude = Number(toLatitude);
  const endLongitude = Number(toLongitude);

  if (
    !Number.isFinite(startLatitude) ||
    !Number.isFinite(startLongitude) ||
    !Number.isFinite(endLatitude) ||
    !Number.isFinite(endLongitude)
  ) {
    return 0;
  }

  const startLatitudeRad = toRadians(startLatitude);
  const endLatitudeRad = toRadians(endLatitude);
  const longitudeDeltaRad = toRadians(endLongitude - startLongitude);

  const y = Math.sin(longitudeDeltaRad) * Math.cos(endLatitudeRad);
  const x =
    (Math.cos(startLatitudeRad) * Math.sin(endLatitudeRad)) -
    (Math.sin(startLatitudeRad) * Math.cos(endLatitudeRad) * Math.cos(longitudeDeltaRad));

  return normalizeDegrees(toDegrees(Math.atan2(y, x)));
}

export function calculateQiblaDirection(latitude, longitude) {
  return calculateBearing({
    fromLatitude: latitude,
    fromLongitude: longitude,
    toLatitude: KAABA_COORDINATES.latitude,
    toLongitude: KAABA_COORDINATES.longitude,
  });
}

