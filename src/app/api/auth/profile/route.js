import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { isApprovedAdminEmail, normalizeEmail } from "@/lib/adminEmails";

const AUTH_CLIENT_OPTIONS = {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
};

function normalizeRole(value = "") {
  return String(value || "donor")
    .trim()
    .toLowerCase();
}

function deriveName(authUser) {
  return (
    authUser?.user_metadata?.full_name ||
    authUser?.user_metadata?.name ||
    authUser?.identities?.[0]?.identity_data?.name ||
    authUser?.email ||
    "IRWAA Member"
  );
}

function deriveAvatarUrl(authUser) {
  return (
    authUser?.user_metadata?.avatar_url ||
    authUser?.user_metadata?.picture ||
    authUser?.identities?.[0]?.identity_data?.avatar_url ||
    authUser?.identities?.[0]?.identity_data?.picture ||
    ""
  );
}

function getEnv(name) {
  return String(process.env[name] || "").trim();
}

function createClients() {
  const supabaseUrl = getEnv("NEXT_PUBLIC_SUPABASE_URL");
  const supabaseAnonKey = getEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY");
  const supabaseServiceRoleKey = getEnv("SUPABASE_SERVICE_ROLE_KEY");

  if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceRoleKey) {
    return null;
  }

  return {
    authClient: createClient(supabaseUrl, supabaseAnonKey, AUTH_CLIENT_OPTIONS),
    adminClient: createClient(
      supabaseUrl,
      supabaseServiceRoleKey,
      AUTH_CLIENT_OPTIONS,
    ),
  };
}

async function authenticateRequest(request) {
  const clients = createClients();

  if (!clients) {
    return {
      errorResponse: NextResponse.json(
        {
          success: false,
          error: "Supabase environment variables are not configured.",
        },
        { status: 503 },
      ),
    };
  }

  const authHeader = request.headers.get("authorization") || "";
  const accessToken = authHeader.startsWith("Bearer ")
    ? authHeader.slice(7).trim()
    : "";

  if (!accessToken) {
    return {
      errorResponse: NextResponse.json(
        {
          success: false,
          error: "Authentication required. Missing bearer token.",
        },
        { status: 401 },
      ),
    };
  }

  const { data, error } = await clients.authClient.auth.getUser(accessToken);

  if (error || !data?.user?.email) {
    return {
      errorResponse: NextResponse.json(
        {
          success: false,
          error: "Authentication failed. Invalid or expired session token.",
        },
        { status: 401 },
      ),
    };
  }

  return {
    authUser: data.user,
    adminClient: clients.adminClient,
  };
}

async function loadOrCreateProfile({
  adminClient,
  authUser,
  desiredName = "",
}) {
  const email = normalizeEmail(authUser.email);
  const fallbackName =
    String(desiredName || deriveName(authUser)).trim() || email;
  const safeRole = isApprovedAdminEmail(email) ? "admin" : "donor";

  let profile = null;

  const { data: existingProfile, error: readError } = await adminClient
    .from("users")
    .select("*")
    .eq("email", email)
    .maybeSingle();

  if (readError) {
    throw readError;
  }

  profile = existingProfile || null;

  if (profile && normalizeRole(profile.role) !== safeRole) {
    const { data: updatedProfile, error: updateError } = await adminClient
      .from("users")
      .update({ role: safeRole })
      .eq("email", email)
      .select("*")
      .maybeSingle();

    if (!updateError && updatedProfile) {
      profile = updatedProfile;
    }
  }

  return {
    ...(profile || {}),
    email,
    name: profile?.name || fallbackName,
    role: safeRole,
    avatar_url: profile?.avatar_url || deriveAvatarUrl(authUser),
  };
}

export async function GET(request) {
  const auth = await authenticateRequest(request);

  if (auth.errorResponse) {
    return auth.errorResponse;
  }

  try {
    const profile = await loadOrCreateProfile(auth);

    return NextResponse.json({
      success: true,
      profile,
    });
  } catch (error) {
    console.error("Unable to load authenticated profile:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Unable to load your account profile.",
      },
      { status: 500 },
    );
  }
}

export async function PATCH(request) {
  const auth = await authenticateRequest(request);

  if (auth.errorResponse) {
    return auth.errorResponse;
  }

  try {
    const body = await request.json().catch(() => ({}));
    const name = String(body?.name || "").trim();

    if (!name) {
      return NextResponse.json(
        { success: false, error: "Name is required." },
        { status: 400 },
      );
    }

    const email = normalizeEmail(auth.authUser.email);
    const safeRole = isApprovedAdminEmail(email) ? "admin" : "donor";
    const { data: existingProfile, error: readError } = await auth.adminClient
      .from("users")
      .select("*")
      .eq("email", email)
      .maybeSingle();

    if (readError) {
      throw readError;
    }

    if (existingProfile) {
      const { error: updateError } = await auth.adminClient
        .from("users")
        .update({ name, role: safeRole })
        .eq("email", email);

      if (updateError) {
        throw updateError;
      }
    }

    const profile = await loadOrCreateProfile({
      adminClient: auth.adminClient,
      authUser: auth.authUser,
      desiredName: name,
    });

    return NextResponse.json({
      success: true,
      profile,
    });
  } catch (error) {
    console.error("Unable to update authenticated profile:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Unable to update your account profile.",
      },
      { status: 500 },
    );
  }
}
