import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder";
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "placeholder_key";

const adminSupabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

const authSupabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

function toNullableNumber(value) {
  const numericValue = Number(value);
  return Number.isFinite(numericValue) ? numericValue : null;
}

function toNullableInteger(value) {
  const numericValue = Number.parseInt(String(value), 10);
  return Number.isFinite(numericValue) ? numericValue : null;
}

function toNullableBoolean(value) {
  if (value === true || value === false) {
    return value;
  }

  return null;
}

function truncate(value, maxLength = 2048) {
  const normalizedValue = String(value || "").trim();
  return normalizedValue ? normalizedValue.slice(0, maxLength) : null;
}

function normalizeLanguages(value) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((entry) => String(entry || "").trim())
    .filter(Boolean)
    .slice(0, 10);
}

function isMissingLocationTable(error) {
  const message = String(error?.message || "").toLowerCase();
  return (
    message.includes("location_consents") &&
    (message.includes("does not exist") || message.includes("relation") || message.includes("schema cache"))
  );
}

async function resolveUserContext(request) {
  const authHeader = request.headers.get("authorization") || "";
  const accessToken = authHeader.startsWith("Bearer ") ? authHeader.slice(7).trim() : "";

  if (!accessToken) {
    return {
      authUserId: null,
      appUserId: null,
      email: null,
    };
  }

  const { data: authData, error: authError } = await authSupabase.auth.getUser(accessToken);
  if (authError || !authData?.user) {
    return {
      authUserId: null,
      appUserId: null,
      email: null,
    };
  }

  const email = authData.user.email || null;
  let appUserId = null;

  if (email) {
    const { data: profile } = await adminSupabase
      .from("users")
      .select("id")
      .eq("email", email)
      .maybeSingle();

    appUserId = profile?.id || null;
  }

  return {
    authUserId: authData.user.id || null,
    appUserId,
    email,
  };
}

export async function POST(request) {
  try {
    const body = await request.json();

    const latitude = toNullableNumber(body?.latitude);
    const longitude = toNullableNumber(body?.longitude);

    if (latitude === null || longitude === null) {
      return NextResponse.json(
        { success: false, message: "Latitude and longitude are required." },
        { status: 400 }
      );
    }

    const userContext = await resolveUserContext(request);

    const payload = {
      permission_status: "granted",
      permission_state_before_request: truncate(body?.permissionStateBeforeRequest, 64) || "unknown",
      latitude,
      longitude,
      accuracy_meters: toNullableNumber(body?.accuracy),
      altitude_meters: toNullableNumber(body?.altitude),
      altitude_accuracy_meters: toNullableNumber(body?.altitudeAccuracy),
      heading_degrees: toNullableNumber(body?.heading),
      speed_mps: toNullableNumber(body?.speed),
      page_url: truncate(body?.pageUrl),
      page_path: truncate(body?.pagePath, 1024),
      referrer: truncate(body?.referrer),
      time_zone: truncate(body?.timeZone, 255),
      language: truncate(body?.language, 64),
      languages: normalizeLanguages(body?.languages),
      platform: truncate(body?.platform, 255),
      user_agent: truncate(body?.userAgent),
      cookie_enabled: toNullableBoolean(body?.cookieEnabled),
      do_not_track: truncate(body?.doNotTrack, 32),
      screen_width: toNullableInteger(body?.screenWidth),
      screen_height: toNullableInteger(body?.screenHeight),
      viewport_width: toNullableInteger(body?.viewportWidth),
      viewport_height: toNullableInteger(body?.viewportHeight),
      device_memory_gb: toNullableNumber(body?.deviceMemory),
      hardware_concurrency: toNullableInteger(body?.hardwareConcurrency),
      max_touch_points: toNullableInteger(body?.maxTouchPoints),
      online: toNullableBoolean(body?.online),
      auth_user_id: userContext.authUserId,
      app_user_id: userContext.appUserId,
      email: userContext.email,
    };

    const { error } = await adminSupabase.from("location_consents").insert([payload]);

    if (error) {
      if (isMissingLocationTable(error)) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Location consent tracking is not configured yet. Run src/lib/sql/content-platform-upgrade.sql in Supabase first.",
          },
          { status: 503 }
        );
      }

      throw error;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Location consent tracking error:", error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Unable to save location consent right now.",
      },
      { status: 500 }
    );
  }
}
