"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { adminFetchJson } from "@/lib/adminApi";

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalRaised: 0,
    activeCampaigns: 0,
    recentDonations: [],
    totalBlogs: 0,
    totalFatwas: 0,
    totalTeamMembers: 0,
    newFatwaRequests: 0,
    activeNewsletterSubscribers: 0,
  });
  const [loading, setLoading] = useState(true);

  const getDonationDisplayName = (donation) => {
    const name = String(donation?.donor_name || "").trim();
    if (name) return name;

    const email = String(donation?.donor_email || "").trim();
    if (!email) return "Anonymous";

    return email.replace(/(.{2}).*(@.*)/, "$1***$2");
  };

  useEffect(() => {
    async function fetchStats() {
      try {
        const result = await adminFetchJson("/api/admin/dashboard");
        setStats(result.data);
      } catch (err) {
        console.error("Dashboard error:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  if (loading)
    return <div className="text-muted">Loading dashboard data...</div>;

  return (
    <div>
      <h2 className="mb-4">IRWA Dashboard</h2>

      <div className="row mb-5">
        <div className="col-md-6 col-xl-3 mb-3">
          <div className="card admin-metric-card h-100 shadow-sm border-0">
            <div className="card-body">
              <h5 className="card-title">Total Donations Raised</h5>
              <h2 className="display-4 fw-bold">
                ${stats.totalRaised.toFixed(2)}
              </h2>
            </div>
          </div>
        </div>
        <div className="col-md-6 col-xl-3 mb-3">
          <div className="card admin-metric-card h-100 shadow-sm border-0">
            <div className="card-body">
              <h5 className="card-title">Active Campaigns</h5>
              <h2 className="display-4 fw-bold">{stats.activeCampaigns}</h2>
            </div>
          </div>
        </div>
        <div className="col-md-6 col-xl-3 mb-3">
          <div className="card admin-metric-card h-100 shadow-sm border-0">
            <div className="card-body">
              <h5 className="card-title">Articles & Fatwas</h5>
              <h2 className="display-6 fw-bold">
                {stats.totalBlogs} / {stats.totalFatwas}
              </h2>
              <small>Blogs / Fatwas</small>
            </div>
          </div>
        </div>
        <div className="col-md-6 col-xl-3 mb-3">
          <div className="card admin-metric-card admin-metric-card--gold h-100 shadow-sm border-0">
            <div className="card-body">
              <h5 className="card-title">Team Members</h5>
              <h2 className="display-4 fw-bold">{stats.totalTeamMembers}</h2>
            </div>
          </div>
        </div>
      </div>

      <div className="row mb-5">
        <div className="col-md-6 col-xl-3 mb-3">
          <div className="card admin-metric-card h-100 shadow-sm border-0">
            <div className="card-body">
              <h5 className="card-title">New Fatwa Requests</h5>
              <h2 className="display-4 fw-bold">{stats.newFatwaRequests}</h2>
            </div>
          </div>
        </div>
        <div className="col-md-6 col-xl-3 mb-3">
          <div className="card admin-metric-card admin-metric-card--soft h-100 shadow-sm border-0">
            <div className="card-body">
              <h5 className="card-title">Active Subscribers</h5>
              <h2 className="display-4 fw-bold">
                {stats.activeNewsletterSubscribers}
              </h2>
            </div>
          </div>
        </div>
      </div>

      <div className="row">
        <div className="col-md-8">
          <div className="card admin-surface shadow-sm mb-4">
            <div className="card-header bg-white">
              <h5 className="mb-0 py-2">Recent Donations</h5>
            </div>
            <div className="card-body p-0">
              <table className="table table-hover mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Donor</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.recentDonations.length > 0 ? (
                    stats.recentDonations.map((d) => (
                      <tr key={d.id}>
                        <td>{getDonationDisplayName(d)}</td>
                        <td className="fw-bold">
                          ${parseFloat(d.amount).toFixed(2)}
                        </td>
                        <td>
                          <span
                            className={`badge bg-${d.payment_status === "completed" ? "success" : "warning"}`}
                          >
                            {d.payment_status}
                          </span>
                        </td>
                        <td>{new Date(d.created_at).toLocaleDateString()}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4" className="text-center py-3">
                        No recent donations found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card admin-surface shadow-sm">
            <div className="card-header bg-white">
              <h5 className="mb-0 py-2">Quick Links</h5>
            </div>
            <div className="card-body">
              <div className="d-grid gap-2">
                <Link
                  href="/admin/campaigns"
                  className="btn btn-outline-primary text-start"
                >
                  <i className="fa-solid fa-list me-2"></i> Manage Campaigns
                </Link>
                <Link
                  href="/admin/blogs"
                  className="btn btn-outline-primary text-start"
                >
                  <i className="fa-solid fa-newspaper me-2"></i> Manage Articles
                </Link>
                <Link
                  href="/admin/fatwas"
                  className="btn btn-outline-primary text-start"
                >
                  <i className="fa-solid fa-scale-balanced me-2"></i> Manage
                  Fatwas
                </Link>
                <Link
                  href="/admin/team"
                  className="btn btn-outline-primary text-start"
                >
                  <i className="fa-solid fa-users me-2"></i> Manage Team
                </Link>
                <Link
                  href="/admin/inbox"
                  className="btn btn-outline-primary text-start"
                >
                  <i className="fa-regular fa-envelope-open me-2"></i> Open
                  Admin Inbox
                </Link>
                <Link
                  href="/admin/images"
                  className="btn btn-outline-primary text-start"
                >
                  <i className="fa-regular fa-images me-2"></i> Update Images
                </Link>
                <Link
                  href="/admin/content"
                  className="btn btn-outline-primary text-start"
                >
                  <i className="fa-solid fa-pen-to-square me-2"></i> Edit Site
                  Content
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
