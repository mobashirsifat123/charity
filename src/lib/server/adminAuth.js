import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { isApprovedAdminEmail, normalizeEmail } from "@/lib/adminEmails";

const getRequiredEnv = (name) => {
  const value = process.env[name];

  if (!value) {
    throw new Error(`${name} is required for admin API routes.`);
  }

  return value;
};

const clientOptions = {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
};

const getAdminEnv = () => ({
  supabaseUrl: getRequiredEnv("NEXT_PUBLIC_SUPABASE_URL"),
  supabaseAnonKey: getRequiredEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY"),
  supabaseServiceRoleKey: getRequiredEnv("SUPABASE_SERVICE_ROLE_KEY"),
});

export const createAdminSupabaseClient = () =>
  createClient(
    getAdminEnv().supabaseUrl,
    getAdminEnv().supabaseServiceRoleKey,
    clientOptions,
  );

const createAuthSupabaseClient = () =>
  createClient(
    getAdminEnv().supabaseUrl,
    getAdminEnv().supabaseAnonKey,
    clientOptions,
  );

const unauthorized = (message, status = 401) =>
  NextResponse.json({ success: false, error: message }, { status });

export async function requireAdmin(request) {
  const authHeader = request.headers.get("authorization") || "";
  const token = authHeader.startsWith("Bearer ")
    ? authHeader.slice(7).trim()
    : "";

  if (!token) {
    return {
      errorResponse: unauthorized(
        "Authentication required. Missing bearer token.",
      ),
    };
  }

  const authClient = createAuthSupabaseClient();
  const { data: userData, error: authError } =
    await authClient.auth.getUser(token);

  if (authError || !userData?.user) {
    return {
      errorResponse: unauthorized(
        "Authentication failed. Invalid or expired session token.",
      ),
    };
  }

  const supabase = createAdminSupabaseClient();
  const email = normalizeEmail(userData.user.email);
  const isApprovedAdmin = isApprovedAdminEmail(email);
  const { data: profile, error: profileError } = await supabase
    .from("users")
    .select("id, email, role, name")
    .eq("email", email)
    .maybeSingle();

  if (profileError) {
    return {
      errorResponse: NextResponse.json(
        {
          success: false,
          error: profileError.message || "Failed to verify admin role.",
        },
        { status: 500 },
      ),
    };
  }

  if (!isApprovedAdmin) {
    return {
      errorResponse: unauthorized(
        "Admin privileges are required to access this resource.",
        403,
      ),
    };
  }

  let safeProfile = profile;

  if (!safeProfile) {
    const { data: insertedProfile, error: insertError } = await supabase
      .from("users")
      .insert({
        email,
        name:
          userData.user.user_metadata?.full_name ||
          userData.user.user_metadata?.name ||
          email,
        role: "admin",
      })
      .select("id, email, role, name")
      .maybeSingle();

    if (insertError) {
      return {
        errorResponse: NextResponse.json(
          {
            success: false,
            error: insertError.message || "Failed to create admin profile.",
          },
          { status: 500 },
        ),
      };
    }

    safeProfile = insertedProfile;
  } else if (safeProfile.role !== "admin") {
    const { data: updatedProfile, error: updateError } = await supabase
      .from("users")
      .update({ role: "admin" })
      .eq("email", email)
      .select("id, email, role, name")
      .maybeSingle();

    if (updateError) {
      return {
        errorResponse: NextResponse.json(
          {
            success: false,
            error: updateError.message || "Failed to update admin profile.",
          },
          { status: 500 },
        ),
      };
    }

    safeProfile = updatedProfile;
  }

  return {
    supabase,
    user: userData.user,
    profile: safeProfile,
  };
}
