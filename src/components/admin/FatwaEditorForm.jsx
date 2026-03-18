"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { adminFetchJson } from "@/lib/adminApi";
import {
  FATWA_CATEGORY_OPTIONS,
  normalizeStatus,
  normalizeTags,
  slugify,
  tagsToInputValue,
} from "@/lib/content-utils";

export default function FatwaEditorForm({ fatwaId = null }) {
  const router = useRouter();
  const isEdit = !!fatwaId;
  const { user } = useAuth();
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [formData, setFormData] = useState({
    title: "",
    question: "",
    answer: "",
    status: "draft",
    category: "",
    tags: "",
    featured: false,
    slug: "",
    author_name: "",
    author_role: "",
    author_bio: "",
    seo_title: "",
    seo_description: "",
    social_image: "",
  });

  useEffect(() => {
    if (isEdit && fatwaId) {
      fetchFatwa();
    }
  }, [isEdit, fatwaId]);

  const fetchFatwa = async () => {
    try {
      const result = await adminFetchJson(`/api/admin/resources/fatwas/${fatwaId}`);
      const data = result.data;
      if (data) {
        setFormData({
          title: data.title || "",
          question: data.question || data.title || "",
          answer: data.answer || data.content || "",
          status: normalizeStatus(data.status),
          category: data.category || "",
          tags: tagsToInputValue(data.tags),
          featured: !!data.featured,
          slug: data.slug || "",
          author_name: data.author_name || "",
          author_role: data.author_role || "",
          author_bio: data.author_bio || "",
          seo_title: data.seo_title || "",
          seo_description: data.seo_description || "",
          social_image: data.social_image || "",
        });
      }
    } catch (error) {
      console.error("Error fetching fatwa:", error);
      setMessage({ type: "danger", text: "Failed to load the fatwa." });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: "", text: "" });

    try {
      const resolvedSlug = formData.slug.trim() || slugify(formData.title || formData.question);
      const basePayload = {
        title: formData.title || formData.question,
        content: formData.answer,
        status: normalizeStatus(formData.status),
        author_id: user?.id || null,
      };
      const optionalPayload = {
        question: formData.question || formData.title,
        answer: formData.answer,
        category: formData.category || null,
        tags: normalizeTags(formData.tags),
        featured: !!formData.featured,
        slug: resolvedSlug || null,
        author_name: formData.author_name || user?.name || user?.email || "IRWA Scholar",
        author_role: formData.author_role || "Scholar",
        author_bio: formData.author_bio || "",
        seo_title: formData.seo_title || formData.title || formData.question,
        seo_description: formData.seo_description || "",
        social_image: formData.social_image || "",
      };

      const result = isEdit
        ? await adminFetchJson(`/api/admin/resources/fatwas/${fatwaId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ basePayload, optionalPayload }),
          })
        : await adminFetchJson("/api/admin/resources/fatwas", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ basePayload, optionalPayload }),
          });

      setMessage({
        type: "success",
        text: result.data?.optionalFieldsSaved
          ? `Fatwa ${isEdit ? "updated" : "created"} successfully.`
          : `Fatwa ${isEdit ? "updated" : "created"} successfully. Advanced fields will start saving after you run the content-platform SQL upgrade.`,
      });

      if (!isEdit) {
        setTimeout(() => router.push("/admin/fatwas"), 1200);
      }
    } catch (error) {
      console.error("Error saving fatwa:", error);
      setMessage({ type: "danger", text: error.message || "Failed to save fatwa." });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="py-5 text-center">
        <div className="spinner-border text-primary" role="status"></div>
        <p className="text-muted mt-3 mb-0">Loading fatwa...</p>
      </div>
    );
  }

  return (
    <div className="d-flex flex-column gap-4">
      <div className="d-flex flex-column flex-lg-row justify-content-between align-items-lg-center gap-3">
        <div>
          <h2 className="fw-bold mb-1">
            <i className="fa-solid fa-scale-balanced text-primary me-2"></i>
            {isEdit ? "Edit Fatwa" : "Write New Fatwa"}
          </h2>
          <p className="text-muted mb-0">Manage public rulings, scholarly metadata, publishing status, and homepage highlights.</p>
        </div>
        <button type="button" onClick={() => router.push("/admin/fatwas")} className="btn btn-outline-secondary rounded-pill px-4 align-self-start align-self-lg-center">
          Back to Fatwas
        </button>
      </div>

      <div className="card border-0 shadow-sm rounded-4">
        <div className="card-body p-4 p-md-5">
          {message.text ? (
            <div className={`alert alert-${message.type} alert-dismissible fade show`} role="alert">
              {message.text}
              <button type="button" className="btn-close" onClick={() => setMessage({ type: "", text: "" })}></button>
            </div>
          ) : null}

          <form onSubmit={handleSubmit}>
            <div className="row g-4">
              <div className="col-md-8">
                <label className="form-label fw-bold">Title</label>
                <input type="text" className="form-control form-control-lg bg-light border-0" name="title" value={formData.title} onChange={handleChange} required />
              </div>
              <div className="col-md-4">
                <label className="form-label fw-bold">Status</label>
                <select className="form-select form-select-lg bg-light border-0" name="status" value={formData.status} onChange={handleChange}>
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                </select>
              </div>
              <div className="col-12">
                <label className="form-label fw-bold">Question</label>
                <textarea className="form-control bg-light border-0" name="question" rows="4" value={formData.question} onChange={handleChange} required></textarea>
              </div>
              <div className="col-12">
                <label className="form-label fw-bold">Answer</label>
                <textarea className="form-control bg-light border-0" name="answer" rows="12" value={formData.answer} onChange={handleChange} required style={{ fontFamily: "monospace" }}></textarea>
              </div>
              <div className="col-md-4">
                <label className="form-label fw-bold">Category</label>
                <select className="form-select bg-light border-0" name="category" value={formData.category} onChange={handleChange}>
                  <option value="">Select category</option>
                  {FATWA_CATEGORY_OPTIONS.map((option) => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </div>
              <div className="col-md-4">
                <label className="form-label fw-bold">Tags</label>
                <input type="text" className="form-control bg-light border-0" name="tags" value={formData.tags} onChange={handleChange} placeholder="zakat, fasting, marriage" />
              </div>
              <div className="col-md-4 d-flex align-items-end">
                <div className="form-check form-switch">
                  <input className="form-check-input" type="checkbox" role="switch" id="featuredFatwa" name="featured" checked={formData.featured} onChange={handleChange} />
                  <label className="form-check-label fw-bold ms-2" htmlFor="featuredFatwa">Featured on homepage</label>
                </div>
              </div>
              <div className="col-md-6">
                <label className="form-label fw-bold">Slug</label>
                <input type="text" className="form-control bg-light border-0" name="slug" value={formData.slug} onChange={handleChange} />
              </div>
              <div className="col-md-6">
                <label className="form-label fw-bold">Social Preview Image</label>
                <input type="url" className="form-control bg-light border-0" name="social_image" value={formData.social_image} onChange={handleChange} />
              </div>
              <div className="col-md-4">
                <label className="form-label fw-bold">Scholar Name</label>
                <input type="text" className="form-control bg-light border-0" name="author_name" value={formData.author_name} onChange={handleChange} />
              </div>
              <div className="col-md-4">
                <label className="form-label fw-bold">Scholar Role</label>
                <input type="text" className="form-control bg-light border-0" name="author_role" value={formData.author_role} onChange={handleChange} placeholder="Scholar / Mufti / Contributor" />
              </div>
              <div className="col-md-4">
                <label className="form-label fw-bold">SEO Title</label>
                <input type="text" className="form-control bg-light border-0" name="seo_title" value={formData.seo_title} onChange={handleChange} />
              </div>
              <div className="col-12">
                <label className="form-label fw-bold">Scholar Bio</label>
                <textarea className="form-control bg-light border-0" name="author_bio" rows="3" value={formData.author_bio} onChange={handleChange}></textarea>
              </div>
              <div className="col-12">
                <label className="form-label fw-bold">SEO Description</label>
                <textarea className="form-control bg-light border-0" name="seo_description" rows="2" value={formData.seo_description} onChange={handleChange}></textarea>
              </div>
            </div>

            <div className="mt-5">
              <button type="submit" className="btn btn-primary btn-lg px-5 fw-bold rounded-pill" disabled={saving}>
                {saving ? <><span className="spinner-border spinner-border-sm me-2"></span>Saving...</> : <><i className="fa-solid fa-cloud-arrow-up me-2"></i>{isEdit ? "Save Changes" : "Publish Fatwa"}</>}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
