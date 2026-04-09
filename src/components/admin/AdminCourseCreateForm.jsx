"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { createCourse } from "@/app/admin/course-actions";
import { supabase } from "@/lib/supabaseClient";

export default function AdminCourseCreateForm({ scholars = [] }) {
  const router = useRouter();
  const [accessToken, setAccessToken] = useState("");
  const [coverPreview, setCoverPreview] = useState("");
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

  const handleCoverChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) {
      setCoverPreview("");
      return;
    }

    setCoverPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    formData.set("accessToken", accessToken);

    setMessage({ type: "", text: "" });

    startTransition(async () => {
      try {
        const result = await createCourse(formData);

        if (!result?.success) {
          setMessage({ type: "danger", text: result?.error || "Unable to create course." });
          return;
        }

        setMessage({ type: "success", text: "Course created successfully. Opening the syllabus builder..." });
        window.setTimeout(() => router.push(`/admin/courses/${result.courseId}/modules`), 900);
      } catch (error) {
        setMessage({ type: "danger", text: error.message || "Unable to create course." });
      }
    });
  };

  return (
    <div className="card border-0 shadow-sm rounded-4">
      <div className="card-body p-4 p-lg-5">
        <div className="d-flex flex-column flex-lg-row justify-content-between align-items-lg-center gap-3 mb-4">
          <div>
            <span className="badge bg-primary bg-opacity-10 text-primary rounded-pill mb-3">Learning (LMS)</span>
            <h1 className="fw-bold mb-2">Create Course Overview</h1>
            <p className="text-muted mb-0">Set up the main course record first, then move directly into the syllabus builder to add video modules over time.</p>
          </div>
        </div>

        {message.text ? (
          <div className={`alert alert-${message.type} border-0 rounded-4`} role="alert">
            {message.text}
          </div>
        ) : null}

        <form onSubmit={handleSubmit} className="row g-4">
          <div className="col-lg-8">
            <label className="form-label fw-semibold">Course Title</label>
            <input type="text" name="title" className="form-control form-control-lg bg-light border-0" placeholder="Foundations of Islamic Character" required />
          </div>

          <div className="col-lg-4">
            <label className="form-label fw-semibold">Scholar</label>
            <select name="scholarId" className="form-select form-select-lg bg-light border-0" defaultValue="">
              <option value="">Select scholar</option>
              {scholars.map((scholar) => (
                <option key={scholar.id} value={scholar.id}>
                  {scholar.name}{scholar.credentials ? ` • ${scholar.credentials}` : ""}
                </option>
              ))}
            </select>
          </div>

          <div className="col-lg-7">
            <label className="form-label fw-semibold">Course Description</label>
            <textarea
              name="description"
              rows="7"
              className="form-control bg-light border-0"
              placeholder="Explain what the student will learn, who the course is for, and what makes the course valuable."
            />
          </div>

          <div className="col-lg-5">
            <label className="form-label fw-semibold">Course Cover Image</label>
            <input type="file" name="coverImage" accept="image/*" className="form-control bg-light border-0 mb-3" onChange={handleCoverChange} />
            <div className="border rounded-4 p-3 bg-light">
              <div className="fw-semibold mb-2">Cover preview</div>
              {coverPreview ? (
                <img src={coverPreview} alt="Course cover preview" className="w-100 rounded-3 object-fit-cover" style={{ maxHeight: "240px" }} />
              ) : (
                <div className="text-muted small d-flex align-items-center justify-content-center rounded-3 bg-white border" style={{ minHeight: "180px" }}>
                  Upload an image to preview it here.
                </div>
              )}
            </div>
          </div>

          <div className="col-12">
            <button type="submit" className="btn btn-primary btn-lg rounded-pill px-5" disabled={isPending || !accessToken}>
              {isPending ? "Creating course..." : "Create Course"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
