"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { adminFetchJson } from "@/lib/adminApi";
import { SURAH_LIST } from "@/lib/quran/surah-data";

const LANGUAGE_OPTIONS = [
  { value: "en", label: "English" },
  { value: "bn", label: "Bengali" },
  { value: "ar", label: "Arabic" },
];

const STATUS_OPTIONS = ["draft", "published"];

const emptyMetadataForm = {
  revelation_type: "",
  intro: "",
  objectives: "",
  topics: "",
  notes: "",
  status: "draft",
};

const emptySectionForm = {
  title: "Introduction of Surah",
  slug: "introduction",
  ayah_start: "",
  ayah_end: "",
  order_index: 1,
  status: "draft",
};

const emptyContentForm = {
  title: "",
  body: "",
  references: "",
  author_name: "",
  status: "draft",
};

function slugify(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function normalizeNullableNumber(value) {
  if (value === "" || value === null || value === undefined) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function parseReferences(value) {
  return String(value || "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

function referencesToText(value) {
  if (Array.isArray(value)) return value.filter(Boolean).join("\n");
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) return parsed.filter(Boolean).join("\n");
    } catch {
      return value;
    }
  }
  return "";
}

export default function AdminQuranTafseerManager() {
  const [language, setLanguage] = useState("en");
  const [selectedSurahId, setSelectedSurahId] = useState(1);
  const [metadata, setMetadata] = useState([]);
  const [sections, setSections] = useState([]);
  const [contents, setContents] = useState([]);
  const [metadataForm, setMetadataForm] = useState(emptyMetadataForm);
  const [sectionForm, setSectionForm] = useState(emptySectionForm);
  const [contentForm, setContentForm] = useState(emptyContentForm);
  const [editingSectionId, setEditingSectionId] = useState(null);
  const [selectedSectionId, setSelectedSectionId] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState("");
  const [message, setMessage] = useState({ type: "", text: "" });

  const selectedSurah = SURAH_LIST.find(
    (surah) => surah.number === Number(selectedSurahId),
  );

  const currentMetadata = useMemo(
    () =>
      metadata.find(
        (item) =>
          Number(item.surah_id) === Number(selectedSurahId) &&
          item.language === language,
      ) || null,
    [language, metadata, selectedSurahId],
  );

  const currentSections = useMemo(
    () =>
      sections
        .filter(
          (item) =>
            Number(item.surah_id) === Number(selectedSurahId) &&
            item.language === language,
        )
        .sort(
          (a, b) => Number(a.order_index || 0) - Number(b.order_index || 0),
        ),
    [language, sections, selectedSurahId],
  );

  const selectedSection = useMemo(
    () =>
      currentSections.find(
        (item) => String(item.id) === String(selectedSectionId),
      ) ||
      currentSections[0] ||
      null,
    [currentSections, selectedSectionId],
  );

  const currentContent = useMemo(
    () =>
      selectedSection
        ? contents.find(
            (item) =>
              String(item.section_id) === String(selectedSection.id) &&
              item.language === language,
          ) || null
        : null,
    [contents, language, selectedSection],
  );

  useEffect(() => {
    loadAll();
  }, []);

  useEffect(() => {
    if (!currentMetadata) {
      setMetadataForm({
        ...emptyMetadataForm,
        revelation_type: selectedSurah?.revelationType || "",
      });
      return;
    }

    setMetadataForm({
      revelation_type: currentMetadata.revelation_type || "",
      intro: currentMetadata.intro || "",
      objectives: currentMetadata.objectives || "",
      topics: currentMetadata.topics || "",
      notes: currentMetadata.notes || "",
      status: currentMetadata.status || "draft",
    });
  }, [currentMetadata, selectedSurah]);

  useEffect(() => {
    setEditingSectionId(null);
    setSectionForm({
      ...emptySectionForm,
      title: "Introduction of Surah",
      slug: "introduction",
      order_index: currentSections.length + 1,
    });
    setSelectedSectionId(
      currentSections[0]?.id ? String(currentSections[0].id) : "",
    );
  }, [currentSections.length, language, selectedSurahId]);

  useEffect(() => {
    if (!selectedSection) {
      setContentForm(emptyContentForm);
      return;
    }

    if (!currentContent) {
      setContentForm({
        ...emptyContentForm,
        title: selectedSection.title || "",
      });
      return;
    }

    setContentForm({
      title: currentContent.title || selectedSection.title || "",
      body: currentContent.body || "",
      references: referencesToText(currentContent.references),
      author_name: currentContent.author_name || "",
      status: currentContent.status || "draft",
    });
  }, [currentContent, selectedSection]);

  const loadAll = async () => {
    setLoading(true);
    setMessage({ type: "", text: "" });

    try {
      const [metadataResult, sectionsResult, contentResult] = await Promise.all(
        [
          adminFetchJson("/api/admin/resources/quran-surah-metadata"),
          adminFetchJson("/api/admin/resources/quran-tafseer-sections"),
          adminFetchJson("/api/admin/resources/quran-tafseer-content"),
        ],
      );

      setMetadata(metadataResult.data || []);
      setSections(sectionsResult.data || []);
      setContents(contentResult.data || []);
    } catch (error) {
      setMessage({
        type: "danger",
        text:
          error.message ||
          "Unable to load Quran admin data. Make sure the Quran Tafseer SQL migration has been run in Supabase.",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateMetadataField = (event) => {
    const { name, value } = event.target;
    setMetadataForm((current) => ({ ...current, [name]: value }));
  };

  const updateSectionField = (event) => {
    const { name, value } = event.target;
    setSectionForm((current) => {
      const next = { ...current, [name]: value };
      if (name === "title" && !editingSectionId) {
        next.slug = slugify(value) || "introduction";
      }
      return next;
    });
  };

  const updateContentField = (event) => {
    const { name, value } = event.target;
    setContentForm((current) => ({ ...current, [name]: value }));
  };

  const saveMetadata = async (event) => {
    event.preventDefault();
    setSaving("metadata");
    setMessage({ type: "", text: "" });

    try {
      const payload = {
        surah_id: Number(selectedSurahId),
        language,
        revelation_type:
          metadataForm.revelation_type || selectedSurah?.revelationType || "",
        intro: metadataForm.intro,
        objectives: metadataForm.objectives,
        topics: metadataForm.topics,
        notes: metadataForm.notes,
        status: metadataForm.status,
      };

      if (currentMetadata?.id) {
        await adminFetchJson(
          `/api/admin/resources/quran-surah-metadata/${currentMetadata.id}`,
          {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ payload }),
          },
        );
      } else {
        await adminFetchJson("/api/admin/resources/quran-surah-metadata", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ payload }),
        });
      }

      await loadAll();
      setMessage({
        type: "success",
        text: "Surah intro metadata saved permanently.",
      });
    } catch (error) {
      setMessage({
        type: "danger",
        text: error.message || "Unable to save metadata.",
      });
    } finally {
      setSaving("");
    }
  };

  const saveSection = async (event) => {
    event.preventDefault();
    setSaving("section");
    setMessage({ type: "", text: "" });

    try {
      const payload = {
        surah_id: Number(selectedSurahId),
        language,
        title: sectionForm.title,
        slug: slugify(sectionForm.slug || sectionForm.title),
        ayah_start: normalizeNullableNumber(sectionForm.ayah_start),
        ayah_end: normalizeNullableNumber(sectionForm.ayah_end),
        order_index: Number(
          sectionForm.order_index || currentSections.length + 1,
        ),
        status: sectionForm.status,
      };

      if (editingSectionId) {
        await adminFetchJson(
          `/api/admin/resources/quran-tafseer-sections/${editingSectionId}`,
          {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ payload }),
          },
        );
      } else {
        await adminFetchJson("/api/admin/resources/quran-tafseer-sections", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ payload }),
        });
      }

      await loadAll();
      setEditingSectionId(null);
      setSectionForm({
        ...emptySectionForm,
        order_index: currentSections.length + 2,
      });
      setMessage({
        type: "success",
        text: "Tafseer section saved permanently.",
      });
    } catch (error) {
      setMessage({
        type: "danger",
        text: error.message || "Unable to save section.",
      });
    } finally {
      setSaving("");
    }
  };

  const editSection = (section) => {
    setEditingSectionId(section.id);
    setSelectedSectionId(String(section.id));
    setSectionForm({
      title: section.title || "",
      slug: section.slug || "",
      ayah_start: section.ayah_start || "",
      ayah_end: section.ayah_end || "",
      order_index: section.order_index || 1,
      status: section.status || "draft",
    });
  };

  const deleteSection = async (section) => {
    const confirmed = window.confirm(
      `Delete "${section.title}" and its Tafseer content? This cannot be undone.`,
    );
    if (!confirmed) return;

    setSaving(`delete-${section.id}`);
    setMessage({ type: "", text: "" });

    try {
      await adminFetchJson(
        `/api/admin/resources/quran-tafseer-sections/${section.id}`,
        {
          method: "DELETE",
        },
      );
      await loadAll();
      setMessage({ type: "success", text: "Tafseer section deleted." });
    } catch (error) {
      setMessage({
        type: "danger",
        text: error.message || "Unable to delete section.",
      });
    } finally {
      setSaving("");
    }
  };

  const saveContent = async (event) => {
    event.preventDefault();
    if (!selectedSection) {
      setMessage({ type: "warning", text: "Create a Tafseer section first." });
      return;
    }

    setSaving("content");
    setMessage({ type: "", text: "" });

    try {
      const payload = {
        section_id: selectedSection.id,
        language,
        title: contentForm.title || selectedSection.title,
        body: contentForm.body,
        references: parseReferences(contentForm.references),
        author_name: contentForm.author_name || "IRWAA Editorial Team",
        status: contentForm.status,
      };

      if (currentContent?.id) {
        await adminFetchJson(
          `/api/admin/resources/quran-tafseer-content/${currentContent.id}`,
          {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ payload }),
          },
        );
      } else {
        await adminFetchJson("/api/admin/resources/quran-tafseer-content", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ payload }),
        });
      }

      await loadAll();
      setMessage({
        type: "success",
        text: "Tafseer body content saved permanently.",
      });
    } catch (error) {
      setMessage({
        type: "danger",
        text: error.message || "Unable to save Tafseer content.",
      });
    } finally {
      setSaving("");
    }
  };

  if (loading) {
    return (
      <div className="py-5 text-center">
        <div className="spinner-border text-primary" role="status" />
        <p className="text-muted mt-3 mb-0">Loading Quran workspace...</p>
      </div>
    );
  }

  return (
    <div className="admin-quran-workspace">
      <div className="d-flex flex-column flex-xl-row justify-content-between gap-3 mb-4">
        <div>
          <span className="theme-badge-soft mb-3">Quran & Tafseer</span>
          <h2 className="fw-bold mb-2">Manage Quran Tafseer Content</h2>
          <p className="text-muted mb-0">
            Create Surah introductions, ayah-range sections, references, and
            publish original or licensed Tafseer content for the public Quran
            pages.
          </p>
        </div>
        <div className="d-flex flex-wrap gap-2 align-self-start">
          <Link href="/quran" className="btn btn-outline-primary rounded-pill">
            View Quran Hub
          </Link>
          <Link href="/quran/tafseer" className="btn btn-primary rounded-pill">
            View Tafseer
          </Link>
        </div>
      </div>

      {message.text ? (
        <div
          className={`alert alert-${message.type} rounded-4 border-0`}
          role="alert"
        >
          {message.text}
        </div>
      ) : null}

      <div className="card border-0 shadow-sm rounded-4 mb-4">
        <div className="card-body p-4">
          <div className="row g-3 align-items-end">
            <div className="col-lg-8">
              <label className="form-label fw-bold">Choose Surah</label>
              <select
                className="form-select form-select-lg bg-light border-0"
                value={selectedSurahId}
                onChange={(event) =>
                  setSelectedSurahId(Number(event.target.value))
                }
              >
                {SURAH_LIST.map((surah) => (
                  <option value={surah.number} key={surah.number}>
                    {surah.number}. {surah.name} - {surah.arabicName}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-lg-4">
              <label className="form-label fw-bold">Language</label>
              <select
                className="form-select form-select-lg bg-light border-0"
                value={language}
                onChange={(event) => setLanguage(event.target.value)}
              >
                {LANGUAGE_OPTIONS.map((option) => (
                  <option value={option.value} key={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="row g-4">
        <div className="col-xl-5">
          <form
            className="card border-0 shadow-sm rounded-4 h-100"
            onSubmit={saveMetadata}
          >
            <div className="card-body p-4">
              <h3 className="h5 fw-bold mb-3">Surah Intro Metadata</h3>
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label fw-bold">Revelation Type</label>
                  <input
                    className="form-control bg-light border-0"
                    name="revelation_type"
                    value={metadataForm.revelation_type}
                    onChange={updateMetadataField}
                    placeholder="Makki / Madani"
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-bold">Status</label>
                  <select
                    className="form-select bg-light border-0"
                    name="status"
                    value={metadataForm.status}
                    onChange={updateMetadataField}
                  >
                    {STATUS_OPTIONS.map((status) => (
                      <option value={status} key={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-12">
                  <label className="form-label fw-bold">Intro</label>
                  <textarea
                    className="form-control bg-light border-0"
                    name="intro"
                    rows={5}
                    value={metadataForm.intro}
                    onChange={updateMetadataField}
                    placeholder="Short Surah introduction..."
                  />
                </div>
                <div className="col-12">
                  <label className="form-label fw-bold">Objectives</label>
                  <textarea
                    className="form-control bg-light border-0"
                    name="objectives"
                    rows={4}
                    value={metadataForm.objectives}
                    onChange={updateMetadataField}
                    placeholder="Main objectives or learning outcomes..."
                  />
                </div>
                <div className="col-12">
                  <label className="form-label fw-bold">Topics</label>
                  <textarea
                    className="form-control bg-light border-0"
                    name="topics"
                    rows={4}
                    value={metadataForm.topics}
                    onChange={updateMetadataField}
                    placeholder="Main topics covered by this Surah..."
                  />
                </div>
                <div className="col-12">
                  <label className="form-label fw-bold">Notes</label>
                  <textarea
                    className="form-control bg-light border-0"
                    name="notes"
                    rows={3}
                    value={metadataForm.notes}
                    onChange={updateMetadataField}
                    placeholder="Makki/Madani notes, editorial notes, or review details..."
                  />
                </div>
              </div>
              <button
                type="submit"
                className="btn btn-primary rounded-pill mt-4 px-4"
                disabled={saving === "metadata"}
              >
                {saving === "metadata" ? "Saving..." : "Save Surah Intro"}
              </button>
            </div>
          </form>
        </div>

        <div className="col-xl-7">
          <div className="card border-0 shadow-sm rounded-4 mb-4">
            <div className="card-body p-4">
              <div className="d-flex flex-wrap justify-content-between gap-3 mb-3">
                <div>
                  <h3 className="h5 fw-bold mb-1">Tafseer Sections</h3>
                  <p className="text-muted mb-0">
                    Build Dorar-style section shortcuts such as introduction,
                    1-5, or 6-7.
                  </p>
                </div>
                {editingSectionId ? (
                  <button
                    type="button"
                    className="btn btn-outline-secondary rounded-pill"
                    onClick={() => {
                      setEditingSectionId(null);
                      setSectionForm({
                        ...emptySectionForm,
                        order_index: currentSections.length + 1,
                      });
                    }}
                  >
                    New Section
                  </button>
                ) : null}
              </div>

              <form onSubmit={saveSection} className="row g-3">
                <div className="col-md-6">
                  <label className="form-label fw-bold">Title</label>
                  <input
                    className="form-control bg-light border-0"
                    name="title"
                    value={sectionForm.title}
                    onChange={updateSectionField}
                    required
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-bold">Slug</label>
                  <input
                    className="form-control bg-light border-0"
                    name="slug"
                    value={sectionForm.slug}
                    onChange={updateSectionField}
                    placeholder="introduction or 1-5"
                    required
                  />
                </div>
                <div className="col-md-3">
                  <label className="form-label fw-bold">Ayah Start</label>
                  <input
                    type="number"
                    min="1"
                    className="form-control bg-light border-0"
                    name="ayah_start"
                    value={sectionForm.ayah_start}
                    onChange={updateSectionField}
                  />
                </div>
                <div className="col-md-3">
                  <label className="form-label fw-bold">Ayah End</label>
                  <input
                    type="number"
                    min="1"
                    className="form-control bg-light border-0"
                    name="ayah_end"
                    value={sectionForm.ayah_end}
                    onChange={updateSectionField}
                  />
                </div>
                <div className="col-md-3">
                  <label className="form-label fw-bold">Order</label>
                  <input
                    type="number"
                    min="1"
                    className="form-control bg-light border-0"
                    name="order_index"
                    value={sectionForm.order_index}
                    onChange={updateSectionField}
                  />
                </div>
                <div className="col-md-3">
                  <label className="form-label fw-bold">Status</label>
                  <select
                    className="form-select bg-light border-0"
                    name="status"
                    value={sectionForm.status}
                    onChange={updateSectionField}
                  >
                    {STATUS_OPTIONS.map((status) => (
                      <option value={status} key={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-12">
                  <button
                    type="submit"
                    className="btn btn-primary rounded-pill px-4"
                    disabled={saving === "section"}
                  >
                    {saving === "section"
                      ? "Saving..."
                      : editingSectionId
                        ? "Update Section"
                        : "Add Section"}
                  </button>
                </div>
              </form>

              <div className="admin-quran-section-list mt-4">
                {currentSections.length ? (
                  currentSections.map((section) => (
                    <div className="admin-quran-section-row" key={section.id}>
                      <button
                        type="button"
                        className={`admin-quran-section-row__main ${
                          String(selectedSection?.id) === String(section.id)
                            ? "is-active"
                            : ""
                        }`}
                        onClick={() => setSelectedSectionId(String(section.id))}
                      >
                        <span>{section.title}</span>
                        <small>
                          {section.ayah_start
                            ? `${section.ayah_start}-${section.ayah_end || section.ayah_start}`
                            : section.slug}{" "}
                          • {section.status}
                        </small>
                      </button>
                      <div className="d-flex gap-2">
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-primary rounded-pill"
                          onClick={() => editSection(section)}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-danger rounded-pill"
                          onClick={() => deleteSection(section)}
                          disabled={saving === `delete-${section.id}`}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-muted small rounded-4 bg-light p-3">
                    No Tafseer sections yet. Add an introduction section first,
                    then publish the body below.
                  </div>
                )}
              </div>
            </div>
          </div>

          <form
            className="card border-0 shadow-sm rounded-4"
            onSubmit={saveContent}
          >
            <div className="card-body p-4">
              <h3 className="h5 fw-bold mb-3">Tafseer Body Content</h3>
              <div className="row g-3">
                <div className="col-md-8">
                  <label className="form-label fw-bold">Selected Section</label>
                  <select
                    className="form-select bg-light border-0"
                    value={selectedSectionId}
                    onChange={(event) =>
                      setSelectedSectionId(event.target.value)
                    }
                    disabled={!currentSections.length}
                  >
                    {currentSections.map((section) => (
                      <option value={section.id} key={section.id}>
                        {section.title} ({section.slug})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-md-4">
                  <label className="form-label fw-bold">Status</label>
                  <select
                    className="form-select bg-light border-0"
                    name="status"
                    value={contentForm.status}
                    onChange={updateContentField}
                  >
                    {STATUS_OPTIONS.map((status) => (
                      <option value={status} key={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-md-8">
                  <label className="form-label fw-bold">Title</label>
                  <input
                    className="form-control bg-light border-0"
                    name="title"
                    value={contentForm.title}
                    onChange={updateContentField}
                    required
                  />
                </div>
                <div className="col-md-4">
                  <label className="form-label fw-bold">Author / Scholar</label>
                  <input
                    className="form-control bg-light border-0"
                    name="author_name"
                    value={contentForm.author_name}
                    onChange={updateContentField}
                    placeholder="IRWAA Editorial Team"
                  />
                </div>
                <div className="col-12">
                  <label className="form-label fw-bold">
                    Body HTML / Markdown
                  </label>
                  <textarea
                    className="form-control bg-light border-0"
                    name="body"
                    rows={12}
                    value={contentForm.body}
                    onChange={updateContentField}
                    placeholder="<p>Write the Tafseer explanation here...</p>"
                    required
                  />
                  <div className="form-text">
                    You may use simple HTML paragraphs/headings/lists for
                    long-form reading. Only publish content IRWAA owns or has
                    permission to use.
                  </div>
                </div>
                <div className="col-12">
                  <label className="form-label fw-bold">References</label>
                  <textarea
                    className="form-control bg-light border-0"
                    name="references"
                    rows={4}
                    value={contentForm.references}
                    onChange={updateContentField}
                    placeholder="One reference per line"
                  />
                </div>
              </div>
              <button
                type="submit"
                className="btn btn-primary rounded-pill mt-4 px-4"
                disabled={saving === "content" || !selectedSection}
              >
                {saving === "content" ? "Saving..." : "Save Tafseer Content"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
