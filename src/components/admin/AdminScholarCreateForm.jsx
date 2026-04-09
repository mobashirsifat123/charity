"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { createScholarProfile } from "@/app/admin/editor-actions";
import { supabase } from "@/lib/supabaseClient";

export default function AdminScholarCreateForm() {
  const router = useRouter();
  const [accessToken, setAccessToken] = useState("");
  const [message, setMessage] = useState({ type: "", text: "" });
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    let active = true;

    async function loadSession() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (active) {
        setAccessToken(session?.access_token || "");
      }
    }

    loadSession();

    return () => {
      active = false;
    };
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    formData.set("accessToken", accessToken);

    setMessage({ type: "", text: "" });

    startTransition(async () => {
      try {
        const result = await createScholarProfile(formData);

        if (!result?.success) {
          setMessage({ type: "danger", text: result?.error || "Unable to create scholar profile." });
          return;
        }

        setMessage({ type: "success", text: "Scholar profile created successfully." });
        window.setTimeout(() => router.push("/admin/scholars"), 1000);
      } catch (error) {
        setMessage({ type: "danger", text: error.message || "Unable to create scholar profile." });
      }
    });
  };

  return (
    <div className="card border-0 shadow-sm rounded-4">
      <div className="card-body p-4 p-lg-5">
        <div className="d-flex justify-content-between align-items-start gap-3 mb-4">
          <div>
            <span className="badge bg-primary bg-opacity-10 text-primary rounded-pill mb-3">Scholar Profile</span>
            <h1 className="fw-bold mb-2">Create New Scholar</h1>
            <p className="text-muted mb-0">Add a scholar profile with a short biography and avatar image for the dawah and learning sections.</p>
          </div>
        </div>

        {message.text ? (
          <div className={`alert alert-${message.type} border-0 rounded-4`} role="alert">
            {message.text}
          </div>
        ) : null}

        <form onSubmit={handleSubmit} className="row g-4">
          <div className="col-md-6">
            <label className="form-label fw-semibold">Scholar Name</label>
            <input type="text" name="name" className="form-control form-control-lg bg-light border-0" placeholder="Shaykh Ahmad Example" required />
          </div>
          <div className="col-md-6">
            <label className="form-label fw-semibold">Credentials</label>
            <input type="text" name="credentials" className="form-control form-control-lg bg-light border-0" placeholder="Scholar / Teacher / Instructor" />
          </div>
          <div className="col-12">
            <label className="form-label fw-semibold">Bio</label>
            <textarea name="bio" rows="5" className="form-control bg-light border-0" placeholder="A short introduction to the scholar, their background, and teaching focus." />
          </div>
          <div className="col-12">
            <label className="form-label fw-semibold">Avatar Image</label>
            <input type="file" name="avatar" accept="image/*" className="form-control bg-light border-0" />
            <div className="form-text">Upload JPG, PNG, WEBP, GIF, or SVG up to 5MB.</div>
          </div>
          <div className="col-12">
            <button type="submit" className="btn btn-primary btn-lg rounded-pill px-5" disabled={isPending || !accessToken}>
              {isPending ? "Saving scholar..." : "Create Scholar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
