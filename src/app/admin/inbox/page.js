"use client";

import { Fragment, useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { adminFetchJson } from "@/lib/adminApi";
import { useAuth } from "@/context/AuthContext";

const REQUEST_STATUSES = [
  "all",
  "new",
  "reviewing",
  "answered",
  "archived",
  "converted",
];
const SUBSCRIBER_STATUSES = [
  "all",
  "active",
  "paused",
  "unsubscribed",
  "archived",
];

const formatDate = (value) =>
  new Date(value).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

const humanizeStatus = (value = "") =>
  String(value || "")
    .replace(/[_-]+/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());

const escapeCsv = (value) => `"${String(value ?? "").replaceAll('"', '""')}"`;

const downloadCsv = (filename, rows) => {
  const csv = rows.map((row) => row.map(escapeCsv).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

const getFriendlyError = (message = "") => {
  const lower = String(message).toLowerCase();

  if (
    lower.includes("does not exist") ||
    lower.includes("relation") ||
    lower.includes("schema cache")
  ) {
    return "Inbox tables are not configured yet. Run src/lib/sql/content-platform-upgrade.sql in Supabase, then reload this page.";
  }

  return message || "Unable to load admin inbox data.";
};

export default function AdminInboxPage() {
  const router = useRouter();
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  const [activeTab, setActiveTab] = useState("requests");
  const [requests, setRequests] = useState([]);
  const [subscribers, setSubscribers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [requestStatusFilter, setRequestStatusFilter] = useState("all");
  const [subscriberStatusFilter, setSubscriberStatusFilter] = useState("all");
  const [expandedRequestId, setExpandedRequestId] = useState(null);
  const [processingKey, setProcessingKey] = useState("");
  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "success",
  });

  const showToast = useCallback((message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: "", type: "success" });
    }, 4000);
  }, []);

  const fetchInbox = useCallback(async () => {
    try {
      setLoading(true);
      setLoadError("");

      const requestResult = await adminFetchJson(
        "/api/admin/resources/fatwa-requests",
      );
      const subscriberResult = isAdmin
        ? await adminFetchJson("/api/admin/resources/newsletter")
        : { data: [] };

      setRequests(requestResult.data || []);
      setSubscribers(subscriberResult.data || []);
    } catch (error) {
      const message = getFriendlyError(error.message);
      setLoadError(message);
      showToast(message, "danger");
    } finally {
      setLoading(false);
    }
  }, [isAdmin, showToast]);

  useEffect(() => {
    fetchInbox();
  }, [fetchInbox]);

  useEffect(() => {
    if (!isAdmin && activeTab === "subscribers") {
      setActiveTab("requests");
    }
  }, [activeTab, isAdmin]);

  const requestCounts = useMemo(
    () => ({
      total: requests.length,
      new: requests.filter((item) => item.status === "new").length,
      converted: requests.filter((item) => item.status === "converted").length,
      answered: requests.filter((item) => item.status === "answered").length,
    }),
    [requests],
  );

  const subscriberCounts = useMemo(
    () => ({
      total: subscribers.length,
      active: subscribers.filter((item) => item.status === "active").length,
    }),
    [subscribers],
  );

  const filteredRequests = useMemo(() => {
    const lower = searchTerm.toLowerCase();

    return requests.filter((item) => {
      const matchesStatus =
        requestStatusFilter === "all" || item.status === requestStatusFilter;
      const matchesSearch =
        !lower ||
        [item.name, item.email, item.category, item.question, item.details]
          .filter(Boolean)
          .some((value) => String(value).toLowerCase().includes(lower));

      return matchesStatus && matchesSearch;
    });
  }, [requests, requestStatusFilter, searchTerm]);

  const filteredSubscribers = useMemo(() => {
    const lower = searchTerm.toLowerCase();

    return subscribers.filter((item) => {
      const matchesStatus =
        subscriberStatusFilter === "all" ||
        item.status === subscriberStatusFilter;
      const matchesSearch =
        !lower ||
        [item.email, item.source, item.status]
          .filter(Boolean)
          .some((value) => String(value).toLowerCase().includes(lower));

      return matchesStatus && matchesSearch;
    });
  }, [subscribers, subscriberStatusFilter, searchTerm]);

  const updateRequestStatus = async (requestId, status) => {
    try {
      setProcessingKey(`request-status-${requestId}`);
      await adminFetchJson(`/api/admin/resources/fatwa-requests/${requestId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ payload: { status } }),
      });

      setRequests((prev) =>
        prev.map((item) =>
          item.id === requestId ? { ...item, status } : item,
        ),
      );
      showToast(`Request marked as ${humanizeStatus(status)}.`);
    } catch (error) {
      showToast(error.message || "Failed to update request status.", "danger");
    } finally {
      setProcessingKey("");
    }
  };

  const deleteRequest = async (requestId) => {
    if (!window.confirm("Delete this fatwa request from the inbox?")) return;

    try {
      setProcessingKey(`request-delete-${requestId}`);
      await adminFetchJson(`/api/admin/resources/fatwa-requests/${requestId}`, {
        method: "DELETE",
      });
      setRequests((prev) => prev.filter((item) => item.id !== requestId));
      if (expandedRequestId === requestId) {
        setExpandedRequestId(null);
      }
      showToast("Fatwa request deleted.");
    } catch (error) {
      showToast(error.message || "Failed to delete request.", "danger");
    } finally {
      setProcessingKey("");
    }
  };

  const convertRequestToFatwa = async (requestItem) => {
    if (!window.confirm("Convert this request into a draft fatwa now?")) return;

    try {
      setProcessingKey(`request-convert-${requestItem.id}`);
      const result = await adminFetchJson(
        `/api/admin/fatwa-requests/${requestItem.id}/convert`,
        {
          method: "POST",
        },
      );

      setRequests((prev) =>
        prev.map((item) =>
          item.id === requestItem.id ? { ...item, status: "converted" } : item,
        ),
      );
      showToast("Draft fatwa created. Opening editor...");
      router.push(`/admin/fatwas/edit/${result.data.fatwaId}`);
    } catch (error) {
      showToast(error.message || "Failed to convert request.", "danger");
    } finally {
      setProcessingKey("");
    }
  };

  const updateSubscriberStatus = async (subscriberId, status) => {
    try {
      setProcessingKey(`subscriber-status-${subscriberId}`);
      await adminFetchJson(`/api/admin/resources/newsletter/${subscriberId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ payload: { status } }),
      });

      setSubscribers((prev) =>
        prev.map((item) =>
          item.id === subscriberId ? { ...item, status } : item,
        ),
      );
      showToast(`Subscriber marked as ${humanizeStatus(status)}.`);
    } catch (error) {
      showToast(error.message || "Failed to update subscriber.", "danger");
    } finally {
      setProcessingKey("");
    }
  };

  const deleteSubscriber = async (subscriberId) => {
    if (!window.confirm("Delete this newsletter subscriber?")) return;

    try {
      setProcessingKey(`subscriber-delete-${subscriberId}`);
      await adminFetchJson(`/api/admin/resources/newsletter/${subscriberId}`, {
        method: "DELETE",
      });
      setSubscribers((prev) => prev.filter((item) => item.id !== subscriberId));
      showToast("Subscriber deleted.");
    } catch (error) {
      showToast(error.message || "Failed to delete subscriber.", "danger");
    } finally {
      setProcessingKey("");
    }
  };

  const exportRequests = () => {
    downloadCsv("irwa-fatwa-requests.csv", [
      [
        "ID",
        "Date",
        "Name",
        "Email",
        "Category",
        "Status",
        "Question",
        "Details",
      ],
      ...filteredRequests.map((item) => [
        item.id,
        formatDate(item.created_at),
        item.name,
        item.email,
        item.category || "General",
        item.status,
        item.question,
        item.details || "",
      ]),
    ]);
  };

  const exportSubscribers = () => {
    downloadCsv("irwa-newsletter-subscribers.csv", [
      ["ID", "Date", "Email", "Status", "Source"],
      ...filteredSubscribers.map((item) => [
        item.id,
        formatDate(item.created_at),
        item.email,
        item.status,
        item.source || "website",
      ]),
    ]);
  };

  return (
    <section className="bg-light pb-5 min-vh-100 position-relative">
      <div
        className="toast-container position-fixed bottom-0 end-0 p-3"
        style={{ zIndex: 1055 }}
      >
        <div
          className={`toast align-items-center text-bg-${toast.type} border-0 ${toast.show ? "show" : "hide"}`}
          role="alert"
        >
          <div className="d-flex">
            <div className="toast-body fw-medium">{toast.message}</div>
            <button
              type="button"
              className="btn-close btn-close-white me-2 m-auto"
              onClick={() => setToast({ ...toast, show: false })}
            ></button>
          </div>
        </div>
      </div>

      <div className="container py-4">
        <div className="d-flex flex-column flex-lg-row justify-content-between align-items-lg-center mb-4 gap-3">
          <div>
            <h2 className="fw-bold mb-1">
              <i className="fa-regular fa-envelope-open text-primary me-2"></i>
              Admin Inbox
            </h2>
            <p className="text-muted mb-0">
              Review incoming fatwa requests, grow your audience, and turn good
              submissions into publishable drafts.
            </p>
          </div>
          <div className="d-flex flex-wrap gap-2">
            <Link
              href="/admin/fatwas"
              className="btn btn-outline-primary rounded-pill px-4"
            >
              Manage Fatwas
            </Link>
            <button
              type="button"
              className="btn btn-outline-secondary rounded-pill px-4"
              onClick={fetchInbox}
            >
              Refresh
            </button>
          </div>
        </div>

        <div className="row g-3 mb-4">
          <div className="col-md-6 col-xl-3">
            <div className="card border-0 shadow-sm rounded-4 h-100">
              <div className="card-body d-flex align-items-center">
                <div className="bg-primary bg-opacity-10 text-primary rounded-circle p-3 me-3">
                  <i className="fa-regular fa-envelope fs-4"></i>
                </div>
                <div>
                  <h6 className="text-muted mb-0">Total Requests</h6>
                  <h3 className="fw-bold mb-0">{requestCounts.total}</h3>
                </div>
              </div>
            </div>
          </div>
          <div className="col-md-6 col-xl-3">
            <div className="card border-0 shadow-sm rounded-4 h-100">
              <div className="card-body d-flex align-items-center">
                <div className="bg-warning bg-opacity-10 text-warning rounded-circle p-3 me-3">
                  <i className="fa-solid fa-clock fs-4"></i>
                </div>
                <div>
                  <h6 className="text-muted mb-0">New Requests</h6>
                  <h3 className="fw-bold mb-0">{requestCounts.new}</h3>
                </div>
              </div>
            </div>
          </div>
          <div className="col-md-6 col-xl-3">
            <div className="card border-0 shadow-sm rounded-4 h-100">
              <div className="card-body d-flex align-items-center">
                <div className="bg-success bg-opacity-10 text-success rounded-circle p-3 me-3">
                  <i className="fa-solid fa-check-double fs-4"></i>
                </div>
                <div>
                  <h6 className="text-muted mb-0">Answered / Converted</h6>
                  <h3 className="fw-bold mb-0">
                    {requestCounts.answered + requestCounts.converted}
                  </h3>
                </div>
              </div>
            </div>
          </div>
          {isAdmin ? (
            <div className="col-md-6 col-xl-3">
              <div className="card border-0 shadow-sm rounded-4 h-100">
                <div className="card-body d-flex align-items-center">
                  <div className="bg-info bg-opacity-10 text-info rounded-circle p-3 me-3">
                    <i className="fa-regular fa-paper-plane fs-4"></i>
                  </div>
                  <div>
                    <h6 className="text-muted mb-0">Active Subscribers</h6>
                    <h3 className="fw-bold mb-0">{subscriberCounts.active}</h3>
                  </div>
                </div>
              </div>
            </div>
          ) : null}
        </div>

        {loadError ? (
          <div className="alert alert-warning border-0 shadow-sm rounded-4 mb-4">
            <strong>Setup note:</strong> {loadError}
          </div>
        ) : null}

        <div className="card border-0 shadow-sm rounded-4 mb-4">
          <div className="card-body p-4">
            <div className="d-flex flex-column flex-lg-row justify-content-between gap-3">
              <ul className="nav nav-pills gap-2">
                <li className="nav-item">
                  <button
                    type="button"
                    className={`nav-link rounded-pill ${activeTab === "requests" ? "active" : "bg-light text-dark"}`}
                    onClick={() => setActiveTab("requests")}
                  >
                    Fatwa Requests
                  </button>
                </li>
                {isAdmin ? (
                  <li className="nav-item">
                    <button
                      type="button"
                      className={`nav-link rounded-pill ${activeTab === "subscribers" ? "active" : "bg-light text-dark"}`}
                      onClick={() => setActiveTab("subscribers")}
                    >
                      Newsletter
                    </button>
                  </li>
                ) : null}
              </ul>

              <div className="d-flex flex-column flex-lg-row gap-2">
                <div className="input-group">
                  <span className="input-group-text bg-light border-end-0 text-muted">
                    <i className="fa-solid fa-search"></i>
                  </span>
                  <input
                    type="text"
                    className="form-control bg-light border-start-0 ps-0"
                    placeholder={
                      activeTab === "requests"
                        ? "Search requests by name, email, or question..."
                        : "Search subscribers by email or source..."
                    }
                    value={searchTerm}
                    onChange={(event) => setSearchTerm(event.target.value)}
                  />
                </div>

                {activeTab === "requests" ? (
                  <>
                    <select
                      className="form-select bg-light"
                      value={requestStatusFilter}
                      onChange={(event) =>
                        setRequestStatusFilter(event.target.value)
                      }
                    >
                      {REQUEST_STATUSES.map((status) => (
                        <option key={status} value={status}>
                          {status === "all"
                            ? "All Statuses"
                            : humanizeStatus(status)}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      className="btn btn-outline-success"
                      onClick={exportRequests}
                      disabled={!filteredRequests.length}
                    >
                      <i className="fa-solid fa-file-csv me-2"></i>Export
                    </button>
                  </>
                ) : (
                  <>
                    <select
                      className="form-select bg-light"
                      value={subscriberStatusFilter}
                      onChange={(event) =>
                        setSubscriberStatusFilter(event.target.value)
                      }
                    >
                      {SUBSCRIBER_STATUSES.map((status) => (
                        <option key={status} value={status}>
                          {status === "all"
                            ? "All Statuses"
                            : humanizeStatus(status)}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      className="btn btn-outline-success"
                      onClick={exportSubscribers}
                      disabled={!filteredSubscribers.length}
                    >
                      <i className="fa-solid fa-file-csv me-2"></i>Export
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status"></div>
            <p className="text-muted mt-3 mb-0">Loading admin inbox...</p>
          </div>
        ) : activeTab === "requests" ? (
          <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
            <div className="card-header bg-white border-bottom p-4">
              <h4 className="mb-1 fw-bold">Fatwa Requests</h4>
              <p className="text-muted mb-0">
                {filteredRequests.length} request(s) match the current view.
              </p>
            </div>
            <div className="card-body p-0">
              {filteredRequests.length === 0 ? (
                <div className="text-center py-5">
                  <i
                    className="fa-regular fa-folder-open text-muted mb-3"
                    style={{ fontSize: "3rem" }}
                  ></i>
                  <h5 className="fw-bold">No matching requests</h5>
                  <p className="text-muted mb-0">
                    Try a different search or status filter.
                  </p>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover align-middle mb-0">
                    <thead className="table-light">
                      <tr>
                        <th>Date</th>
                        <th>Submitter</th>
                        <th>Question</th>
                        <th>Status</th>
                        <th className="text-end">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredRequests.map((item) => (
                        <Fragment key={item.id}>
                          <tr key={item.id}>
                            <td className="text-muted fw-medium">
                              {formatDate(item.created_at)}
                            </td>
                            <td>
                              <div className="fw-bold">{item.name}</div>
                              <a
                                href={`mailto:${item.email}`}
                                className="text-decoration-none small"
                              >
                                {item.email}
                              </a>
                            </td>
                            <td style={{ minWidth: "320px" }}>
                              <div className="fw-semibold">{item.question}</div>
                              <div className="small text-muted">
                                {item.category || "General"}
                              </div>
                            </td>
                            <td style={{ minWidth: "170px" }}>
                              <select
                                className="form-select form-select-sm bg-light"
                                value={item.status}
                                onChange={(event) =>
                                  updateRequestStatus(
                                    item.id,
                                    event.target.value,
                                  )
                                }
                                disabled={
                                  processingKey === `request-status-${item.id}`
                                }
                              >
                                {REQUEST_STATUSES.filter(
                                  (status) => status !== "all",
                                ).map((status) => (
                                  <option key={status} value={status}>
                                    {humanizeStatus(status)}
                                  </option>
                                ))}
                              </select>
                            </td>
                            <td className="text-end">
                              <div className="d-flex flex-wrap gap-2 justify-content-end">
                                <button
                                  type="button"
                                  className="btn btn-sm btn-outline-secondary"
                                  onClick={() =>
                                    setExpandedRequestId((prev) =>
                                      prev === item.id ? null : item.id,
                                    )
                                  }
                                >
                                  {expandedRequestId === item.id
                                    ? "Hide"
                                    : "View"}
                                </button>
                                <button
                                  type="button"
                                  className="btn btn-sm btn-outline-primary"
                                  onClick={() => convertRequestToFatwa(item)}
                                  disabled={
                                    processingKey ===
                                      `request-convert-${item.id}` ||
                                    item.status === "converted"
                                  }
                                >
                                  {processingKey ===
                                  `request-convert-${item.id}`
                                    ? "Converting..."
                                    : "Create Draft"}
                                </button>
                                <button
                                  type="button"
                                  className="btn btn-sm btn-outline-danger"
                                  onClick={() => deleteRequest(item.id)}
                                  disabled={
                                    processingKey ===
                                    `request-delete-${item.id}`
                                  }
                                >
                                  Delete
                                </button>
                              </div>
                            </td>
                          </tr>
                          {expandedRequestId === item.id ? (
                            <tr className="bg-light">
                              <td colSpan="5">
                                <div className="p-3">
                                  <div className="mb-3">
                                    <span className="badge bg-secondary-subtle text-dark border">
                                      {humanizeStatus(item.status)}
                                    </span>
                                  </div>
                                  <div className="row g-3">
                                    <div className="col-lg-6">
                                      <h6 className="fw-bold">Full Question</h6>
                                      <p className="mb-0 text-muted">
                                        {item.question}
                                      </p>
                                    </div>
                                    <div className="col-lg-6">
                                      <h6 className="fw-bold">
                                        Additional Details
                                      </h6>
                                      <p className="mb-0 text-muted">
                                        {item.details ||
                                          "No extra details provided."}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              </td>
                            </tr>
                          ) : null}
                        </Fragment>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
            <div className="card-header bg-white border-bottom p-4">
              <h4 className="mb-1 fw-bold">Newsletter Subscribers</h4>
              <p className="text-muted mb-0">
                {filteredSubscribers.length} subscriber(s) match the current
                view.
              </p>
            </div>
            <div className="card-body p-0">
              {filteredSubscribers.length === 0 ? (
                <div className="text-center py-5">
                  <i
                    className="fa-regular fa-folder-open text-muted mb-3"
                    style={{ fontSize: "3rem" }}
                  ></i>
                  <h5 className="fw-bold">No matching subscribers</h5>
                  <p className="text-muted mb-0">
                    Try a different search or status filter.
                  </p>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover align-middle mb-0">
                    <thead className="table-light">
                      <tr>
                        <th>Date</th>
                        <th>Email</th>
                        <th>Source</th>
                        <th>Status</th>
                        <th className="text-end">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredSubscribers.map((item) => (
                        <tr key={item.id}>
                          <td className="text-muted fw-medium">
                            {formatDate(item.created_at)}
                          </td>
                          <td>
                            <a
                              href={`mailto:${item.email}`}
                              className="fw-semibold text-decoration-none"
                            >
                              {item.email}
                            </a>
                          </td>
                          <td className="text-muted">
                            {item.source || "website"}
                          </td>
                          <td style={{ minWidth: "180px" }}>
                            <select
                              className="form-select form-select-sm bg-light"
                              value={item.status}
                              onChange={(event) =>
                                updateSubscriberStatus(
                                  item.id,
                                  event.target.value,
                                )
                              }
                              disabled={
                                processingKey === `subscriber-status-${item.id}`
                              }
                            >
                              {SUBSCRIBER_STATUSES.filter(
                                (status) => status !== "all",
                              ).map((status) => (
                                <option key={status} value={status}>
                                  {humanizeStatus(status)}
                                </option>
                              ))}
                            </select>
                          </td>
                          <td className="text-end">
                            <button
                              type="button"
                              className="btn btn-sm btn-outline-danger"
                              onClick={() => deleteSubscriber(item.id)}
                              disabled={
                                processingKey === `subscriber-delete-${item.id}`
                              }
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
