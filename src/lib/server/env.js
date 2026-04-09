const PLACEHOLDER_MARKERS = ["placeholder", "your_", "changeme", "example"];

function normalizeValue(value) {
  return String(value || "").trim();
}

export function isPlaceholderValue(value) {
  const normalized = normalizeValue(value).toLowerCase();
  if (!normalized) return true;

  return PLACEHOLDER_MARKERS.some((marker) => normalized.includes(marker));
}

export function hasValidSupabaseServerEnv() {
  const url = normalizeValue(process.env.NEXT_PUBLIC_SUPABASE_URL);
  const key = normalizeValue(process.env.SUPABASE_SERVICE_ROLE_KEY);

  return Boolean(url && key && !isPlaceholderValue(url) && !isPlaceholderValue(key));
}

export function hasValidSupabaseBrowserEnv() {
  const url = normalizeValue(process.env.NEXT_PUBLIC_SUPABASE_URL);
  const key = normalizeValue(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

  return Boolean(url && key && !isPlaceholderValue(url) && !isPlaceholderValue(key));
}

export function hasValidStripeSecret() {
  const key = normalizeValue(process.env.STRIPE_SECRET_KEY);
  return key.startsWith("sk_") && !isPlaceholderValue(key);
}
