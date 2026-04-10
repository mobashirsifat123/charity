"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import HeaderOne from "@/components/HeaderOne";
import FooterOne from "@/components/FooterOne";
import BreadcrumbOne from "@/components/BreadcrumbOne";
import { supabase } from "@/lib/supabaseClient";

function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    const finishAuth = async () => {
      const nextPath = searchParams.get("next") || "/dashboard";
      const code = searchParams.get("code");
      const hashParams =
        typeof window !== "undefined"
          ? new URLSearchParams(window.location.hash.replace(/^#/, ""))
          : new URLSearchParams();
      const accessToken = hashParams.get("access_token");
      const refreshToken = hashParams.get("refresh_token");

      try {
        if (code) {
          const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
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
        } = await supabase.auth.getSession();

        if (!active) return;

        if (session) {
          router.refresh();
          router.replace(nextPath);
          return;
        }

        setError("We could not complete sign in. Please try again.");
      } catch (callbackError) {
        if (!active) return;
        console.error("Auth callback failed:", callbackError);
        setError(callbackError.message || "We could not complete sign in. Please try again.");
      }
    };

    finishAuth();

    return () => {
      active = false;
    };
  }, [router, searchParams]);

  return (
    <section className="page-wrapper">
      <HeaderOne />
      <BreadcrumbOne
        title="Signing You In"
        links={[
          { name: "Home", link: "/" },
          { name: "Signing You In", link: "/auth/callback" },
        ]}
      />

      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-lg-5 col-md-8">
            <div className="content-panel text-center p-5">
              {error ? (
                <>
                  <div className="alert alert-danger mb-4">{error}</div>
                  <button
                    type="button"
                    className="btn btn-primary btn-ripple rounded-pill px-4"
                    onClick={() => router.replace("/login")}
                  >
                    Back to login
                  </button>
                </>
              ) : (
                <>
                  <div className="spinner-border text-primary mb-4" role="status">
                    <span className="visually-hidden">Signing in...</span>
                  </div>
                  <h2 className="fw-bold mb-2">Completing sign in</h2>
                  <p className="text-muted mb-0">
                    Please wait while we finish your secure Google sign-in.
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <FooterOne />
    </section>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <section className="page-wrapper">
          <HeaderOne />
          <BreadcrumbOne
            title="Signing You In"
            links={[
              { name: "Home", link: "/" },
              { name: "Signing You In", link: "/auth/callback" },
            ]}
          />
          <div className="container py-5">
            <div className="row justify-content-center">
              <div className="col-lg-5 col-md-8">
                <div className="content-panel text-center p-5">
                  <div className="spinner-border text-primary mb-3" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                  <p className="text-muted mb-0">Preparing secure sign-in...</p>
                </div>
              </div>
            </div>
          </div>
          <FooterOne />
        </section>
      }
    >
      <AuthCallbackContent />
    </Suspense>
  );
}
