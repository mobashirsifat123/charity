"use client";

import { useEffect, useState } from "react";

import { supabase } from "@/lib/supabaseClient";

export default function AuthCallback() {
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    const handleCallback = async () => {
      const url = new URL(window.location.href);
      const nextPath = url.searchParams.get("next") || "/dashboard";
      const code = url.searchParams.get("code");
      const hashParams = new URLSearchParams(
        window.location.hash.replace(/^#/, ""),
      );
      const accessToken = hashParams.get("access_token");
      const refreshToken = hashParams.get("refresh_token");

      try {
        if (code) {
          const { error: exchangeError } =
            await supabase.auth.exchangeCodeForSession(code);
          if (exchangeError) {
            throw exchangeError;
          }
        } else if (accessToken && refreshToken) {
          const { error: sessionError } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });

          if (sessionError) {
            throw sessionError;
          }
        }

        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();

        if (sessionError) {
          throw sessionError;
        }

        if (!session?.user) {
          throw new Error(
            "We could not complete your sign in. Please try again.",
          );
        }

        if (active) {
          window.location.replace(nextPath);
        }
      } catch (callbackError) {
        console.error("Error during auth callback:", callbackError);
        if (active) {
          setError(
            callbackError.message || "We could not complete your sign in.",
          );
        }
      }
    };

    handleCallback();

    return () => {
      active = false;
    };
  }, []);

  return (
    <div
      className="d-flex justify-content-center align-items-center"
      style={{ minHeight: "100vh", flexDirection: "column" }}
    >
      <div
        className="spinner-border text-primary"
        role="status"
        style={{ width: "3rem", height: "3rem" }}
      >
        <span className="visually-hidden">Loading...</span>
      </div>
      <h4 className="mt-3 text-muted">Completing sign in...</h4>
      {error ? (
        <p className="mt-3 text-danger text-center px-4">{error}</p>
      ) : null}
    </div>
  );
}
