"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { supabase } from "@/lib/supabaseClient";
import { isApprovedAdminEmail } from "@/lib/adminEmails";

const AuthContext = createContext(null);

function normalizeRole(role) {
  return String(role || "donor")
    .trim()
    .toLowerCase();
}

function buildHydratedUser(sessionUser, profileData = null) {
  if (!sessionUser) return null;

  const fallbackEmail = sessionUser.email || "";
  const fallbackName =
    sessionUser.user_metadata?.full_name ||
    sessionUser.user_metadata?.name ||
    sessionUser.identities?.[0]?.identity_data?.name ||
    fallbackEmail;

  const email = profileData?.email || fallbackEmail;
  const safeRole = isApprovedAdminEmail(email) ? "admin" : "donor";

  return {
    ...sessionUser,
    ...(profileData || {}),
    auth_user_id: sessionUser.id,
    name: profileData?.name || fallbackName,
    email,
    role: safeRole,
    avatar_url:
      profileData?.avatar_url ||
      sessionUser.user_metadata?.avatar_url ||
      sessionUser.user_metadata?.picture ||
      sessionUser.identities?.[0]?.identity_data?.avatar_url ||
      sessionUser.identities?.[0]?.identity_data?.picture ||
      "",
    created_at: profileData?.created_at || sessionUser.created_at || null,
  };
}

async function fetchServerProfile(accessToken) {
  if (!accessToken) return null;

  try {
    const response = await fetch("/api/auth/profile", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      cache: "no-store",
    });

    const result = await response.json().catch(() => null);

    if (!response.ok || result?.success === false) {
      throw new Error(result?.error || "Unable to load your account profile.");
    }

    return result?.profile || null;
  } catch (error) {
    console.warn(
      "Server-backed profile hydration failed. Falling back to browser read.",
      error,
    );
    return null;
  }
}

async function fetchBrowserProfile(sessionUser) {
  if (!sessionUser?.email) return null;

  try {
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("email", sessionUser.email)
      .maybeSingle();

    if (error) {
      throw error;
    }

    return data || null;
  } catch (error) {
    console.warn(
      "Unable to read public.users profile during auth hydration. Falling back to Supabase auth user only.",
      error,
    );
    return null;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const hydrateUser = async (sessionUser, accessToken = "") => {
    if (!sessionUser) return null;

    const serverProfile = await fetchServerProfile(accessToken);
    const browserProfile = serverProfile
      ? null
      : await fetchBrowserProfile(sessionUser);

    return buildHydratedUser(sessionUser, serverProfile || browserProfile);
  };

  const refreshUser = async () => {
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession();

    if (error) {
      throw error;
    }

    if (!session?.user) {
      setUser(null);
      return null;
    }

    const hydratedUser = await hydrateUser(session.user, session.access_token);
    setUser(hydratedUser);
    return hydratedUser;
  };

  useEffect(() => {
    let active = true;

    const initializeAuth = async () => {
      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        if (error) throw error;

        if (!active) return;

        if (session?.user) {
          const hydratedUser = await hydrateUser(
            session.user,
            session.access_token,
          );
          if (active) {
            setUser(hydratedUser);
          }
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error("Error fetching Supabase session:", error);
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    initializeAuth();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (!active) return;

        if (session?.user) {
          const hydratedUser = await hydrateUser(
            session.user,
            session.access_token,
          );
          if (active) {
            setUser(hydratedUser);
          }
        } else if (active) {
          setUser(null);
        }

        if (active) {
          setLoading(false);
        }
      },
    );

    return () => {
      active = false;
      authListener?.subscription.unsubscribe();
    };
  }, []);

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    router.push("/");
  };

  const updateProfile = async ({ name }) => {
    const trimmedName = String(name || "").trim();

    if (!trimmedName) {
      throw new Error("Name is required.");
    }

    const { error: authError } = await supabase.auth.updateUser({
      data: {
        full_name: trimmedName,
        name: trimmedName,
      },
    });

    if (authError) {
      throw authError;
    }

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      const accessToken = session?.access_token;

      if (accessToken) {
        const response = await fetch("/api/auth/profile", {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({ name: trimmedName }),
        });

        const result = await response.json().catch(() => null);

        if (!response.ok || result?.success === false) {
          throw new Error(result?.error || "Unable to update your profile.");
        }
      } else if (user?.email) {
        await supabase
          .from("users")
          .update({ name: trimmedName })
          .eq("email", user.email);
      }
    } catch (error) {
      console.warn(
        "Unable to sync public.users profile name from dashboard.",
        error,
      );
    }

    return refreshUser();
  };

  const changePassword = async ({ password }) => {
    const normalizedPassword = String(password || "");

    if (normalizedPassword.length < 6) {
      throw new Error("Password must be at least 6 characters.");
    }

    const { error } = await supabase.auth.updateUser({
      password: normalizedPassword,
    });

    if (error) {
      throw error;
    }

    return true;
  };

  const isAuthenticated = () => !!user;
  const isAdmin = () => normalizeRole(user?.role) === "admin";

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        logout,
        refreshUser,
        updateProfile,
        changePassword,
        isAuthenticated,
        isAdmin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
}

export default AuthContext;
