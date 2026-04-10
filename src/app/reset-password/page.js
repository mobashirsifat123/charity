"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import HeaderOne from "@/components/HeaderOne";
import FooterOne from "@/components/FooterOne";
import BreadcrumbOne from "@/components/BreadcrumbOne";
import { supabase } from "@/lib/supabaseClient";

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    let active = true;

    const bootstrapRecovery = async () => {
      const code = searchParams.get("code");
      const hashParams =
        typeof window !== "undefined"
          ? new URLSearchParams(window.location.hash.replace(/^#/, ""))
          : new URLSearchParams();
      const accessToken = hashParams.get("access_token");
      const refreshToken = hashParams.get("refresh_token");

      try {
        const { data: listener } = supabase.auth.onAuthStateChange((event) => {
          if (!active) return;

          if (event === "PASSWORD_RECOVERY" || event === "SIGNED_IN") {
            setReady(true);
            setLoading(false);
          }
        });

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
          setReady(true);
        } else {
          setError("This password reset link is invalid or has expired.");
        }

        setLoading(false);

        return () => {
          listener?.subscription.unsubscribe();
        };
      } catch (recoveryError) {
        if (!active) return;
        console.error("Password recovery bootstrap failed:", recoveryError);
        setError(recoveryError.message || "This password reset link is invalid or has expired.");
        setLoading(false);
      }
    };

    const cleanupPromise = bootstrapRecovery();

    return () => {
      active = false;
      Promise.resolve(cleanupPromise).then((cleanup) => {
        if (typeof cleanup === "function") {
          cleanup();
        }
      });
    };
  }, [searchParams]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSuccessMessage("");

    if (password.length < 6) {
      setError("Your new password must be at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("The passwords do not match.");
      return;
    }

    setSaving(true);

    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password,
      });

      if (updateError) {
        throw updateError;
      }

      setSuccessMessage("Your password has been updated. Redirecting you to login...");

      window.setTimeout(() => {
        router.replace("/login");
      }, 1600);
    } catch (updateError) {
      console.error("Password update failed:", updateError);
      setError(updateError.message || "We could not update your password. Please request a new reset link.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="page-wrapper">
      <HeaderOne />
      <BreadcrumbOne
        title="Reset Password"
        links={[
          { name: "Home", link: "/" },
          { name: "Reset Password", link: "/reset-password" },
        ]}
      />

      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-lg-5 col-md-8">
            <div className="content-panel p-5">
              <div className="text-center mb-4">
                <h2 className="fw-bold text-primary mb-2">Choose a new password</h2>
                <p className="text-muted mb-0">
                  Set a fresh password for your IRWA account.
                </p>
              </div>

              {error ? <div className="alert alert-danger">{error}</div> : null}
              {successMessage ? <div className="alert alert-primary">{successMessage}</div> : null}

              {loading ? (
                <div className="text-center py-4">
                  <div className="spinner-border text-primary mb-3" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                  <p className="text-muted mb-0">Verifying your reset link...</p>
                </div>
              ) : null}

              {!loading && ready ? (
                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label htmlFor="newPassword" className="form-label fw-semibold">
                      New password
                    </label>
                    <input
                      id="newPassword"
                      type="password"
                      className="form-control"
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      placeholder="Enter your new password"
                      required
                    />
                  </div>

                  <div className="mb-4">
                    <label htmlFor="confirmNewPassword" className="form-label fw-semibold">
                      Confirm new password
                    </label>
                    <input
                      id="confirmNewPassword"
                      type="password"
                      className="form-control"
                      value={confirmPassword}
                      onChange={(event) => setConfirmPassword(event.target.value)}
                      placeholder="Re-enter your new password"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    className="btn btn-primary btn-ripple w-100 py-3 fw-semibold"
                    disabled={saving}
                  >
                    {saving ? "Updating password..." : "Save new password"}
                  </button>
                </form>
              ) : null}
            </div>
          </div>
        </div>
      </div>

      <FooterOne />
    </section>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <section className="page-wrapper">
          <HeaderOne />
          <BreadcrumbOne
            title="Reset Password"
            links={[
              { name: "Home", link: "/" },
              { name: "Reset Password", link: "/reset-password" },
            ]}
          />
          <div className="container py-5">
            <div className="row justify-content-center">
              <div className="col-lg-5 col-md-8">
                <div className="content-panel text-center p-5">
                  <div className="spinner-border text-primary mb-3" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                  <p className="text-muted mb-0">Preparing password reset...</p>
                </div>
              </div>
            </div>
          </div>
          <FooterOne />
        </section>
      }
    >
      <ResetPasswordContent />
    </Suspense>
  );
}
