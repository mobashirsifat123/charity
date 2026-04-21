"use client";

import { useEffect, useMemo, useState } from "react";
import { adminFetchJson } from "@/lib/adminApi";

function slugify(value = "") {
  return String(value)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export default function AdminCategoriesManager() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [form, setForm] = useState({
    id: "",
    name: "",
    slug: "",
    description: "",
    icon_class: "fa-solid fa-book-open",
    sort_order: 0,
    is_active: true,
  });

  async function loadCategories() {
    try {
      setLoading(true);
      const result = await adminFetchJson(
        "/api/admin/resources/article-categories",
      );
      setItems(result.data || []);
    } catch (error) {
      setMessage({
        type: "danger",
        text: error.message || "Unable to load categories.",
      });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCategories();
  }, []);

  const isEditing = Boolean(form.id);
  const sortedItems = useMemo(
    () =>
      [...items].sort(
        (a, b) =>
          Number(a.sort_order || 0) - Number(b.sort_order || 0) ||
          String(a.name || "").localeCompare(String(b.name || "")),
      ),
    [items],
  );

  function startEdit(item) {
    setForm({
      id: item.id,
      name: item.name || "",
      slug: item.slug || "",
      description: item.description || "",
      icon_class: item.icon_class || "fa-solid fa-book-open",
      sort_order: Number(item.sort_order || 0),
      is_active: item.is_active !== false,
    });
    setMessage({ type: "", text: "" });
  }

  function resetForm() {
    setForm({
      id: "",
      name: "",
      slug: "",
      description: "",
      icon_class: "fa-solid fa-book-open",
      sort_order: 0,
      is_active: true,
    });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSaving(true);
    setMessage({ type: "", text: "" });

    try {
      const name = form.name.trim();
      const slug = (form.slug.trim() || slugify(name)).toLowerCase();
      const payload = {
        name,
        slug,
        description: form.description.trim(),
        icon_class: form.icon_class.trim() || "fa-solid fa-book-open",
        sort_order: Number(form.sort_order || 0),
        is_active: !!form.is_active,
      };

      if (!name) {
        throw new Error("Category name is required.");
      }

      if (!slug) {
        throw new Error("Category slug is required.");
      }

      if (isEditing) {
        await adminFetchJson(
          `/api/admin/resources/article-categories/${form.id}`,
          {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ payload }),
          },
        );
        setMessage({ type: "success", text: "Category updated." });
      } else {
        await adminFetchJson("/api/admin/resources/article-categories", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ payload }),
        });
        setMessage({ type: "success", text: "Category created." });
      }

      resetForm();
      await loadCategories();
    } catch (error) {
      setMessage({
        type: "danger",
        text: error.message || "Unable to save category.",
      });
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    if (!window.confirm("Delete this category?")) return;

    try {
      await adminFetchJson(`/api/admin/resources/article-categories/${id}`, {
        method: "DELETE",
      });
      setItems((prev) => prev.filter((item) => item.id !== id));
      if (form.id === id) resetForm();
      setMessage({ type: "success", text: "Category deleted." });
    } catch (error) {
      setMessage({
        type: "danger",
        text: error.message || "Unable to delete category.",
      });
    }
  }

  return (
    <div className="d-flex flex-column gap-4">
      <div className="card border-0 shadow-sm rounded-4">
        <div className="card-body p-4">
          <h2 className="fw-bold mb-2">Article Categories</h2>
          <p className="text-muted mb-0">
            Manage the public Article page subsections, cards, icons, and
            filtering taxonomy.
          </p>
        </div>
      </div>

      <div className="card border-0 shadow-sm rounded-4">
        <div className="card-body p-4">
          <h5 className="fw-bold mb-3">
            {isEditing ? "Edit Category" : "Create Category"}
          </h5>
          {message.text ? (
            <div className={`alert alert-${message.type}`}>{message.text}</div>
          ) : null}
          <form className="row g-3" onSubmit={handleSubmit}>
            <div className="col-md-4">
              <label className="form-label fw-semibold">Name</label>
              <input
                className="form-control bg-light border-0"
                value={form.name}
                onChange={(event) => {
                  const name = event.target.value;
                  setForm((prev) => ({
                    ...prev,
                    name,
                    slug: prev.slug || slugify(name),
                  }));
                }}
                placeholder="Aqeeda"
                required
              />
            </div>
            <div className="col-md-4">
              <label className="form-label fw-semibold">Slug</label>
              <input
                className="form-control bg-light border-0"
                value={form.slug}
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    slug: slugify(event.target.value),
                  }))
                }
                placeholder="aqeeda"
                required
              />
            </div>
            <div className="col-md-4">
              <label className="form-label fw-semibold">
                Font Awesome Icon Class
              </label>
              <input
                className="form-control bg-light border-0"
                value={form.icon_class}
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    icon_class: event.target.value,
                  }))
                }
                placeholder="fa-solid fa-scale-balanced"
              />
            </div>
            <div className="col-12">
              <label className="form-label fw-semibold">Description</label>
              <textarea
                className="form-control bg-light border-0"
                rows={3}
                value={form.description}
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    description: event.target.value,
                  }))
                }
                placeholder="Short text shown on the public Article subsection card."
              />
            </div>
            <div className="col-md-4">
              <label className="form-label fw-semibold">Sort Order</label>
              <input
                type="number"
                className="form-control bg-light border-0"
                value={form.sort_order}
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    sort_order: event.target.value,
                  }))
                }
              />
            </div>
            <div className="col-md-4 d-flex align-items-end">
              <div className="form-check form-switch">
                <input
                  className="form-check-input"
                  id="articleCategoryActive"
                  type="checkbox"
                  checked={form.is_active}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      is_active: event.target.checked,
                    }))
                  }
                />
                <label
                  className="form-check-label fw-semibold ms-2"
                  htmlFor="articleCategoryActive"
                >
                  Show this subsection publicly
                </label>
              </div>
            </div>
            <div className="col-md-4 d-flex align-items-end gap-2">
              <button
                className="btn btn-primary w-100"
                type="submit"
                disabled={saving}
              >
                {saving ? "Saving..." : isEditing ? "Update" : "Create"}
              </button>
              {isEditing ? (
                <button
                  className="btn btn-outline-secondary"
                  type="button"
                  onClick={resetForm}
                >
                  Reset
                </button>
              ) : null}
            </div>
          </form>
        </div>
      </div>

      <div className="card border-0 shadow-sm rounded-4">
        <div className="card-body p-0">
          {loading ? (
            <div className="p-4 text-muted">Loading categories...</div>
          ) : (
            <div className="table-responsive">
              <table className="table mb-0 align-middle">
                <thead className="table-light">
                  <tr>
                    <th className="px-4 py-3">Name</th>
                    <th className="py-3">Slug</th>
                    <th className="py-3">Icon</th>
                    <th className="py-3">Order</th>
                    <th className="py-3">Visible</th>
                    <th className="py-3 text-end px-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedItems.map((item) => (
                    <tr key={item.id}>
                      <td className="px-4 py-3 fw-semibold">{item.name}</td>
                      <td className="py-3 text-muted">{item.slug}</td>
                      <td className="py-3">
                        <i
                          className={item.icon_class || "fa-solid fa-book-open"}
                        />
                        <span className="text-muted small ms-2">
                          {item.icon_class || "fa-solid fa-book-open"}
                        </span>
                      </td>
                      <td className="py-3">{item.sort_order || 0}</td>
                      <td className="py-3">
                        <span
                          className={`badge rounded-pill ${item.is_active === false ? "bg-secondary" : "bg-success"}`}
                        >
                          {item.is_active === false ? "Hidden" : "Visible"}
                        </span>
                      </td>
                      <td className="py-3 text-end px-4">
                        <div className="btn-group">
                          <button
                            className="btn btn-sm btn-outline-primary"
                            onClick={() => startEdit(item)}
                          >
                            Edit
                          </button>
                          <button
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => handleDelete(item.id)}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {!sortedItems.length ? (
                    <tr>
                      <td colSpan={6} className="text-center text-muted py-4">
                        No categories found yet.
                      </td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
