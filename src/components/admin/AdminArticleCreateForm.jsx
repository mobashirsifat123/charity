"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { createArticle } from "@/app/admin/editor-actions";
import { supabase } from "@/lib/supabaseClient";
import { CORE_ARTICLE_SUBJECTS } from "@/lib/article-subjects";
import ArticleRichTextEditor from "@/components/admin/ArticleRichTextEditor";

export default function AdminArticleCreateForm({
  categories = [],
  scholars = [],
}) {
  const categoryOptions = categories.length
    ? categories
    : CORE_ARTICLE_SUBJECTS.map((subject, index) => ({
        id: subject.name,
        name: subject.name,
        slug: subject.name.toLowerCase(),
        description: subject.description,
        icon_class: `fa-solid ${subject.icon}`,
        sort_order: index + 1,
        is_active: true,
      }));
  const router = useRouter();
  const [accessToken, setAccessToken] = useState("");
  const [content, setContent] = useState("");
  const [selectedCategorySlug, setSelectedCategorySlug] = useState("");
  const [selectedSectionSlugs, setSelectedSectionSlugs] = useState([]);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [coverPreview, setCoverPreview] = useState("");
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

  const selectedCategory = useMemo(
    () =>
      categoryOptions.find(
        (category) => category.slug === selectedCategorySlug,
      ) || null,
    [categoryOptions, selectedCategorySlug],
  );

  const handleSectionToggle = (slug) => {
    setSelectedSectionSlugs((prev) =>
      prev.includes(slug)
        ? prev.filter((item) => item !== slug)
        : [...prev, slug],
    );
  };

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
    formData.set("content", content);
    formData.set("categorySlug", selectedCategory?.slug || "");
    formData.set("categoryName", selectedCategory?.name || "");
    formData.set(
      "categorySlugs",
      JSON.stringify(
        Array.from(
          new Set(
            [selectedCategory?.slug, ...selectedSectionSlugs].filter(Boolean),
          ),
        ),
      ),
    );

    setMessage({ type: "", text: "" });

    startTransition(async () => {
      try {
        const result = await createArticle(formData);

        if (!result?.success) {
          setMessage({
            type: "danger",
            text: result?.error || "Unable to save the article.",
          });
          return;
        }

        const warningText =
          Array.isArray(result?.warnings) && result.warnings.length
            ? ` ${result.warnings.join(" ")}`
            : "";
        const schemaText = result?.optionalFieldsSaved
          ? ""
          : " Advanced article fields were skipped because Supabase still needs the content platform SQL upgrade.";

        setMessage({
          type: "success",
          text: `Article created successfully.${schemaText}${warningText}`,
        });

        window.setTimeout(() => router.push("/admin/blogs"), 1000);
      } catch (error) {
        setMessage({
          type: "danger",
          text: error.message || "Unable to save the article.",
        });
      }
    });
  };

  return (
    <div className="card border-0 shadow-sm rounded-4">
      <div className="card-body p-4 p-lg-5">
        <div className="d-flex flex-column flex-lg-row justify-content-between align-items-lg-center gap-3 mb-4">
          <div>
            <span className="badge bg-primary bg-opacity-10 text-primary rounded-pill mb-3">
              Dawah Library
            </span>
            <h1 className="fw-bold mb-2">Create New Article</h1>
            <p className="text-muted mb-0">
              Write and publish a new article with category assignment, scholar
              attribution, storage-backed cover image upload, and a rich text
              editor.
            </p>
          </div>
          <button
            type="button"
            onClick={() => router.push("/admin/blogs")}
            className="btn btn-outline-secondary rounded-pill px-4"
          >
            Back to Articles
          </button>
        </div>

        {message.text ? (
          <div
            className={`alert alert-${message.type} border-0 rounded-4`}
            role="alert"
          >
            {message.text}
          </div>
        ) : null}

        <form onSubmit={handleSubmit} className="row g-4">
          <div className="col-lg-8">
            <label className="form-label fw-semibold">Article Title</label>
            <input
              type="text"
              name="title"
              className="form-control form-control-lg bg-light border-0"
              placeholder="The Mercy of Seeking Sacred Knowledge"
              required
            />
          </div>

          <div className="col-lg-4">
            <label className="form-label fw-semibold">Status</label>
            <select
              name="status"
              className="form-select form-select-lg bg-light border-0"
              defaultValue="draft"
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </select>
          </div>

          <div className="col-md-4">
            <label className="form-label fw-semibold">Category</label>
            <select
              className="form-select bg-light border-0"
              value={selectedCategorySlug}
              onChange={(event) => setSelectedCategorySlug(event.target.value)}
            >
              <option value="">Select category</option>
              {categoryOptions.map((category) => (
                <option key={category.id} value={category.slug}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          <div className="col-12">
            <label className="form-label fw-semibold">
              Article Subsections
            </label>
            <div className="row g-3">
              {categoryOptions.map((category) => {
                const isChecked = selectedSectionSlugs.includes(category.slug);
                const iconClass =
                  category.icon_class ||
                  `fa-solid ${category.icon || "fa-book-open"}`;

                return (
                  <div className="col-md-6 col-xl-3" key={category.slug}>
                    <button
                      type="button"
                      className={`admin-article-section-picker ${isChecked ? "is-selected" : ""}`}
                      onClick={() => handleSectionToggle(category.slug)}
                    >
                      <span className="admin-article-section-picker__icon">
                        <i className={iconClass} />
                      </span>
                      <span className="admin-article-section-picker__text">
                        <strong>{category.name}</strong>
                        <small>
                          {category.description ||
                            "Show this article in this public subsection."}
                        </small>
                      </span>
                    </button>
                  </div>
                );
              })}
            </div>
            <div className="form-text">
              These match the public Article page subsections like Aqidah, Fiqh,
              History, and Seerah.
            </div>
          </div>

          <div className="col-md-4">
            <label className="form-label fw-semibold">
              Scholar Attribution
            </label>
            <select
              name="scholarId"
              className="form-select bg-light border-0"
              defaultValue=""
            >
              <option value="">IRWA Editorial Team</option>
              {scholars.map((scholar) => (
                <option key={scholar.id} value={scholar.id}>
                  {scholar.name}
                  {scholar.credentials ? ` • ${scholar.credentials}` : ""}
                </option>
              ))}
            </select>
          </div>

          <div className="col-md-4">
            <label className="form-label fw-semibold">Tags</label>
            <input
              type="text"
              name="tags"
              className="form-control bg-light border-0"
              placeholder="knowledge, dawah, tarbiyah"
            />
          </div>

          <div className="col-12">
            <div className="form-check form-switch">
              <input
                className="form-check-input"
                type="checkbox"
                role="switch"
                id="featuredArticleCreate"
                name="featured"
              />
              <label
                className="form-check-label fw-semibold ms-2"
                htmlFor="featuredArticleCreate"
              >
                Feature this article on the homepage and article directory
              </label>
            </div>
          </div>

          <div className="col-12">
            <label className="form-label fw-semibold">
              Article Directory Summary
            </label>
            <textarea
              name="summary"
              className="form-control bg-light border-0"
              rows="3"
              placeholder="A short card preview for the public article page. Leave blank to generate it from the article body."
            ></textarea>
          </div>

          <div className="col-lg-7">
            <label className="form-label fw-semibold">Cover Image</label>
            <input
              type="file"
              name="coverImage"
              accept="image/*"
              className="form-control bg-light border-0"
              onChange={handleCoverChange}
            />
            <div className="form-text">
              The image will be uploaded to Supabase Storage during save.
            </div>
          </div>

          <div className="col-lg-5">
            <div className="border rounded-4 p-3 bg-light h-100">
              <div className="fw-semibold mb-2">Cover preview</div>
              {coverPreview ? (
                <img
                  src={coverPreview}
                  alt="Cover preview"
                  className="w-100 rounded-3 object-fit-cover"
                  style={{ maxHeight: "220px" }}
                />
              ) : (
                <div
                  className="text-muted small d-flex align-items-center justify-content-center rounded-3 bg-white border"
                  style={{ minHeight: "160px" }}
                >
                  Upload an image to preview it here.
                </div>
              )}
            </div>
          </div>

          <div className="col-12">
            <label className="form-label fw-semibold">Article Body</label>
            <ArticleRichTextEditor value={content} onChange={setContent} />
          </div>

          <div className="col-12">
            <button
              type="submit"
              className="btn btn-primary btn-lg rounded-pill px-5"
              disabled={isPending || !accessToken}
            >
              {isPending ? "Saving article..." : "Create Article"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
