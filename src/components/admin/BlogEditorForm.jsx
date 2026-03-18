"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { adminFetchJson } from "@/lib/adminApi";
import {
  BLOG_CATEGORY_OPTIONS,
  normalizeStatus,
  slugify,
  tagsToInputValue,
  normalizeTags,
} from "@/lib/content-utils";

export default function BlogEditorForm({ blogId = null }) {
  const router = useRouter();
  const isEdit = !!blogId;
  const { user } = useAuth();
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    status: "draft",
    image_url: "",
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
    if (isEdit && blogId) {
      fetchBlog();
    }
  }, [isEdit, blogId]);

  const fetchBlog = async () => {
    try {
      const result = await adminFetchJson(`/api/admin/resources/blogs/${blogId}`);
      const data = result.data;
      if (data) {
        setFormData({
          title: data.title || "",
          content: data.content || "",
          status: normalizeStatus(data.status),
          image_url: data.image_url || "",
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
      console.error("Error fetching blog:", error);
      setMessage({ type: "danger", text: "Failed to load the article." });
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
      const resolvedSlug = formData.slug.trim() || slugify(formData.title);
      const basePayload = {
        title: formData.title,
        content: formData.content,
        status: normalizeStatus(formData.status),
        image_url: formData.image_url || "",
        author_id: user?.id || null,
      };
      const optionalPayload = {
        category: formData.category || null,
        tags: normalizeTags(formData.tags),
        featured: !!formData.featured,
        slug: resolvedSlug || null,
        author_name: formData.author_name || user?.name || user?.email || "IRWA Team",
        author_role: formData.author_role || "Contributor",
        author_bio: formData.author_bio || "",
        seo_title: formData.seo_title || formData.title,
        seo_description: formData.seo_description || "",
        social_image: formData.social_image || formData.image_url || "",
      };

      const result = isEdit
        ? await adminFetchJson(`/api/admin/resources/blogs/${blogId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ basePayload, optionalPayload }),
          })
        : await adminFetchJson("/api/admin/resources/blogs", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ basePayload, optionalPayload }),
          });

      setMessage({
        type: "success",
        text: result.data?.optionalFieldsSaved
          ? `Article ${isEdit ? "updated" : "created"} successfully.`
          : `Article ${isEdit ? "updated" : "created"} successfully. Advanced fields will start saving after you run the content-platform SQL upgrade.`,
      });

      if (!isEdit) {
        setTimeout(() => router.push("/admin/blogs"), 1200);
      }
    } catch (error) {
      console.error("Error saving blog:", error);
      setMessage({ type: "danger", text: error.message || "Failed to save article." });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="py-5 text-center">
        <div className="spinner-border text-primary" role="status"></div>
        <p className="text-muted mt-3 mb-0">Loading article...</p>
      </div>
    );
  }

  return (
    <div className="d-flex flex-column gap-4">
      <div className="d-flex flex-column flex-lg-row justify-content-between align-items-lg-center gap-3">
        <div>
          <h2 className="fw-bold mb-1">
            <i className="fa-solid fa-pen-nib text-primary me-2"></i>
            {isEdit ? "Edit Article" : "Write New Article"}
          </h2>
          <p className="text-muted mb-0">Manage article content, publishing status, metadata, and homepage visibility.</p>
        </div>
        <button type="button" onClick={() => router.push("/admin/blogs")} className="btn btn-outline-secondary rounded-pill px-4 align-self-start align-self-lg-center">
          Back to Articles
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
                <label className="form-label fw-bold">Article Title</label>
                <input type="text" className="form-control form-control-lg bg-light border-0" name="title" value={formData.title} onChange={handleChange} required />
              </div>
              <div className="col-md-4">
                <label className="form-label fw-bold">Status</label>
                <select className="form-select form-select-lg bg-light border-0" name="status" value={formData.status} onChange={handleChange}>
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                </select>
              </div>
              <div className="col-md-4">
                <label className="form-label fw-bold">Category</label>
                <select className="form-select bg-light border-0" name="category" value={formData.category} onChange={handleChange}>
                  <option value="">Select category</option>
                  {BLOG_CATEGORY_OPTIONS.map((option) => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </div>
              <div className="col-md-4">
                <label className="form-label fw-bold">Tags</label>
                <input type="text" className="form-control bg-light border-0" name="tags" value={formData.tags} onChange={handleChange} placeholder="faith, community, family" />
              </div>
              <div className="col-md-4 d-flex align-items-end">
                <div className="form-check form-switch">
                  <input className="form-check-input" type="checkbox" role="switch" id="featuredArticle" name="featured" checked={formData.featured} onChange={handleChange} />
                  <label className="form-check-label fw-bold ms-2" htmlFor="featuredArticle">Featured on homepage</label>
                </div>
              </div>
              <div className="col-md-6">
                <label className="form-label fw-bold">Slug</label>
                <input type="text" className="form-control bg-light border-0" name="slug" value={formData.slug} onChange={handleChange} placeholder="leave blank to auto-generate" />
              </div>
              <div className="col-md-6">
                <label className="form-label fw-bold">Feature Image URL</label>
                <input type="url" className="form-control bg-light border-0" name="image_url" value={formData.image_url} onChange={handleChange} placeholder="https://example.com/image.jpg" />
              </div>
              <div className="col-12">
                <label className="form-label fw-bold">Content</label>
                <textarea className="form-control bg-light border-0" name="content" rows="14" value={formData.content} onChange={handleChange} required style={{ fontFamily: "monospace" }}></textarea>
              </div>

              <div className="col-md-4">
                <label className="form-label fw-bold">Author Name</label>
                <input type="text" className="form-control bg-light border-0" name="author_name" value={formData.author_name} onChange={handleChange} />
              </div>
              <div className="col-md-4">
                <label className="form-label fw-bold">Author Role</label>
                <input type="text" className="form-control bg-light border-0" name="author_role" value={formData.author_role} onChange={handleChange} placeholder="Contributor / Editor" />
              </div>
              <div className="col-md-4">
                <label className="form-label fw-bold">Social Preview Image</label>
                <input type="url" className="form-control bg-light border-0" name="social_image" value={formData.social_image} onChange={handleChange} />
              </div>
              <div className="col-12">
                <label className="form-label fw-bold">Author Bio</label>
                <textarea className="form-control bg-light border-0" name="author_bio" rows="3" value={formData.author_bio} onChange={handleChange}></textarea>
              </div>
              <div className="col-md-6">
                <label className="form-label fw-bold">SEO Title</label>
                <input type="text" className="form-control bg-light border-0" name="seo_title" value={formData.seo_title} onChange={handleChange} />
              </div>
              <div className="col-md-6">
                <label className="form-label fw-bold">SEO Description</label>
                <textarea className="form-control bg-light border-0" name="seo_description" rows="2" value={formData.seo_description} onChange={handleChange}></textarea>
              </div>
            </div>

            <div className="mt-5">
              <button type="submit" className="btn btn-primary btn-lg px-5 fw-bold rounded-pill" disabled={saving}>
                {saving ? <><span className="spinner-border spinner-border-sm me-2"></span>Saving...</> : <><i className="fa-solid fa-cloud-arrow-up me-2"></i>{isEdit ? "Save Changes" : "Publish Article"}</>}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
