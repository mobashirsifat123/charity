"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { adminFetchJson } from "@/lib/adminApi";

export default function AdminScholarsManager() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ type: "", text: "" });

  async function loadScholars() {
    try {
      setLoading(true);
      const result = await adminFetchJson("/api/admin/resources/scholars");
      setItems(result.data || []);
    } catch (error) {
      setMessage({ type: "danger", text: error.message || "Unable to load scholars." });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadScholars();
  }, []);

  const scholars = useMemo(
    () => [...items].sort((a, b) => String(a.name || "").localeCompare(String(b.name || ""))),
    [items]
  );

  async function handleDelete(id) {
    if (!window.confirm("Delete this scholar profile?")) return;

    try {
      await adminFetchJson(`/api/admin/resources/scholars/${id}`, { method: "DELETE" });
      setItems((prev) => prev.filter((item) => item.id !== id));
      setMessage({ type: "success", text: "Scholar profile deleted." });
    } catch (error) {
      setMessage({ type: "danger", text: error.message || "Unable to delete scholar profile." });
    }
  }

  return (
    <div className="d-flex flex-column gap-4">
      <div className="card border-0 shadow-sm rounded-4">
        <div className="card-body p-4 d-flex flex-column flex-lg-row justify-content-between align-items-lg-center gap-3">
          <div>
            <h2 className="fw-bold mb-2">Scholar Profiles</h2>
            <p className="text-muted mb-0">Manage scholar cards used across articles, fatwas, and courses.</p>
          </div>
          <Link href="/admin/scholars/new" className="btn btn-primary rounded-pill px-4">
            Create Scholar
          </Link>
        </div>
      </div>

      {message.text ? <div className={`alert alert-${message.type}`}>{message.text}</div> : null}

      <div className="card border-0 shadow-sm rounded-4">
        <div className="card-body p-0">
          {loading ? (
            <div className="p-4 text-muted">Loading scholars...</div>
          ) : (
            <div className="table-responsive">
              <table className="table mb-0 align-middle">
                <thead className="table-light">
                  <tr>
                    <th className="px-4 py-3">Scholar</th>
                    <th className="py-3">Credentials</th>
                    <th className="py-3">Bio</th>
                    <th className="py-3 text-end px-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {scholars.map((scholar) => (
                    <tr key={scholar.id}>
                      <td className="px-4 py-3">
                        <div className="d-flex align-items-center gap-3">
                          {scholar.avatar_url ? (
                            <img
                              src={scholar.avatar_url}
                              alt={scholar.name || "Scholar avatar"}
                              className="rounded-circle object-fit-cover"
                              style={{ width: 40, height: 40 }}
                            />
                          ) : (
                            <div
                              className="rounded-circle bg-light d-flex align-items-center justify-content-center text-muted"
                              style={{ width: 40, height: 40 }}
                            >
                              <i className="fa-solid fa-user"></i>
                            </div>
                          )}
                          <span className="fw-semibold">{scholar.name || "Unnamed Scholar"}</span>
                        </div>
                      </td>
                      <td className="py-3 text-muted">{scholar.credentials || "—"}</td>
                      <td className="py-3 text-muted">
                        {scholar.bio ? `${String(scholar.bio).slice(0, 120)}${String(scholar.bio).length > 120 ? "..." : ""}` : "—"}
                      </td>
                      <td className="py-3 text-end px-4">
                        <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(scholar.id)}>
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                  {!scholars.length ? (
                    <tr>
                      <td colSpan={4} className="text-center text-muted py-4">
                        No scholar profiles found.
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
