"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { adminFetchJson } from '@/lib/adminApi';

function formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
    }).format(amount || 0);
}

function getProgress(raised, goal) {
    if (!goal) return 0;
    return Math.min((raised / goal) * 100, 100).toFixed(1);
}

export default function CampaignListPage() {
    const [campaigns, setCampaigns] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [search, setSearch] = useState('');
    const [deleteModal, setDeleteModal] = useState({ show: false, campaign: null });
    const [deleting, setDeleting] = useState(false);

    useEffect(() => {
        fetchCampaigns();
    }, []);

    const fetchCampaigns = async (searchTerm = '') => {
        try {
            setLoading(true);
            setError('');

            const result = await adminFetchJson('/api/admin/resources/campaigns');
            const filtered = searchTerm
                ? (result.data || []).filter((campaign) =>
                    [campaign.title, campaign.description, campaign.category]
                        .filter(Boolean)
                        .some((value) => value.toLowerCase().includes(searchTerm.toLowerCase()))
                  )
                : (result.data || []);

            setCampaigns(filtered);
        } catch (err) {
            setError(err.message || 'Failed to load campaigns');
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        fetchCampaigns(search);
    };

    const handleDelete = async () => {
        if (!deleteModal.campaign) return;

        try {
            setDeleting(true);
            await adminFetchJson(`/api/admin/resources/campaigns/${deleteModal.campaign.id}`, {
                method: 'DELETE',
            });

            setCampaigns((prev) => prev.filter((campaign) => campaign.id !== deleteModal.campaign.id));
            setDeleteModal({ show: false, campaign: null });
        } catch (err) {
            setError(err.message || 'Failed to delete campaign');
        } finally {
            setDeleting(false);
        }
    };

    return (
        <div className="d-flex flex-column gap-4">
            <div className="d-flex flex-column flex-lg-row justify-content-between align-items-lg-center gap-3">
                <div>
                    <h2 className="fw-bold mb-1">
                        <i className="fa-solid fa-bullhorn text-primary me-2"></i>
                        Campaign Manager
                    </h2>
                    <p className="text-muted mb-0">Create, review, and update every public fundraising campaign.</p>
                </div>
                <div className="d-flex flex-wrap gap-2">
                    <Link href="/admin/dashboard" className="btn btn-outline-secondary rounded-pill px-4">
                        Back to Dashboard
                    </Link>
                    <Link href="/admin/campaigns/new" className="btn btn-primary rounded-pill px-4">
                        <i className="fa-solid fa-plus me-2"></i>
                        Create Campaign
                    </Link>
                </div>
            </div>

            <form onSubmit={handleSearch} className="card border-0 shadow-sm rounded-4">
                <div className="card-body p-3 p-md-4">
                    <div className="input-group input-group-lg">
                        <input
                            type="text"
                            className="form-control"
                            placeholder="Search campaigns by title, category, or description..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                        <button type="submit" className="btn btn-primary px-4">
                            <i className="fa-solid fa-search"></i>
                        </button>
                        {search ? (
                            <button
                                type="button"
                                className="btn btn-outline-secondary"
                                onClick={() => {
                                    setSearch('');
                                    fetchCampaigns();
                                }}
                            >
                                Clear
                            </button>
                        ) : null}
                    </div>
                </div>
            </form>

            {error ? (
                <div className="alert alert-danger mb-0">
                    <i className="fa-solid fa-circle-exclamation me-2"></i>
                    {error}
                </div>
            ) : null}

            <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
                <div className="card-header bg-white border-bottom p-4 d-flex justify-content-between align-items-center">
                    <div>
                        <h4 className="mb-1 fw-bold">All Campaigns</h4>
                        <p className="text-muted mb-0">{campaigns.length} campaigns found</p>
                    </div>
                </div>
                <div className="card-body p-0">
                    {loading ? (
                        <div className="text-center py-5">
                            <div className="spinner-border text-primary" role="status">
                                <span className="visually-hidden">Loading...</span>
                            </div>
                        </div>
                    ) : campaigns.length === 0 ? (
                        <div className="text-center py-5 px-4">
                            <i className="fa-solid fa-inbox text-muted mb-3" style={{ fontSize: '4rem' }}></i>
                            <h5 className="fw-bold">No campaigns found</h5>
                            <p className="text-muted">Create your first campaign to get started.</p>
                            <Link href="/admin/campaigns/new" className="btn btn-primary rounded-pill px-4">
                                <i className="fa-solid fa-plus me-2"></i>
                                Create Campaign
                            </Link>
                        </div>
                    ) : (
                        <div className="table-responsive">
                            <table className="table table-hover align-middle mb-0">
                                <thead className="table-light">
                                    <tr>
                                        <th style={{ width: '60px' }}>ID</th>
                                        <th>Campaign</th>
                                        <th>Category</th>
                                        <th>Progress</th>
                                        <th>Goal</th>
                                        <th style={{ width: '150px' }}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {campaigns.map((campaign) => (
                                        <tr key={campaign.id}>
                                            <td>
                                                <span className="badge bg-light text-dark">#{campaign.id}</span>
                                            </td>
                                            <td>
                                                <div className="d-flex align-items-center">
                                                    {campaign.image_url ? (
                                                        <Image
                                                            src={campaign.image_url.startsWith('http')
                                                                ? campaign.image_url
                                                                : `${process.env.NEXT_PUBLIC_API_URL || ""}${campaign.image_url}`}
                                                            alt={campaign.title}
                                                            width={50}
                                                            height={50}
                                                            className="rounded me-3"
                                                            style={{ width: '50px', height: '50px', objectFit: 'cover' }}
                                                            unoptimized
                                                        />
                                                    ) : null}
                                                    <div>
                                                        <strong>{campaign.title}</strong>
                                                        <br />
                                                        <small className="text-muted">
                                                            {campaign.description?.substring(0, 80)}
                                                            {campaign.description?.length > 80 ? '...' : ''}
                                                        </small>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                {campaign.category ? (
                                                    <span className="badge bg-secondary">{campaign.category}</span>
                                                ) : (
                                                    <span className="text-muted">—</span>
                                                )}
                                            </td>
                                            <td>
                                                <div style={{ minWidth: '120px' }}>
                                                    <div className="progress" style={{ height: '8px' }}>
                                                        <div
                                                            className="progress-bar bg-success"
                                                            style={{ width: `${getProgress(campaign.raised_amount, campaign.goal_amount)}%` }}
                                                        ></div>
                                                    </div>
                                                    <small className="text-muted">
                                                        {formatCurrency(campaign.raised_amount)} raised
                                                    </small>
                                                </div>
                                            </td>
                                            <td>
                                                <strong>{formatCurrency(campaign.goal_amount)}</strong>
                                            </td>
                                            <td>
                                                <div className="d-flex gap-2">
                                                    <Link href={`/cause-details/${campaign.id}`} className="btn btn-sm btn-outline-secondary" title="View">
                                                        <i className="fa-solid fa-eye"></i>
                                                    </Link>
                                                    <Link href={`/admin/campaigns/${campaign.id}/edit`} className="btn btn-sm btn-outline-primary" title="Edit">
                                                        <i className="fa-solid fa-pencil"></i>
                                                    </Link>
                                                    <button
                                                        className="btn btn-sm btn-outline-danger"
                                                        title="Delete"
                                                        onClick={() => setDeleteModal({ show: true, campaign })}
                                                    >
                                                        <i className="fa-solid fa-trash"></i>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            {deleteModal.show ? (
                <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content rounded-4">
                            <div className="modal-header border-0">
                                <h5 className="modal-title">
                                    <i className="fa-solid fa-triangle-exclamation text-danger me-2"></i>
                                    Delete Campaign
                                </h5>
                                <button
                                    type="button"
                                    className="btn-close"
                                    onClick={() => setDeleteModal({ show: false, campaign: null })}
                                    disabled={deleting}
                                ></button>
                            </div>
                            <div className="modal-body">
                                <p>Are you sure you want to delete this campaign?</p>
                                <div className="card bg-light border-0">
                                    <div className="card-body py-2">
                                        <strong>{deleteModal.campaign?.title}</strong>
                                        <br />
                                        <small className="text-muted">Goal: {formatCurrency(deleteModal.campaign?.goal_amount)}</small>
                                    </div>
                                </div>
                                <p className="text-danger small mt-3 mb-0">
                                    <i className="fa-solid fa-warning me-1"></i>
                                    This action cannot be undone.
                                </p>
                            </div>
                            <div className="modal-footer border-0">
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={() => setDeleteModal({ show: false, campaign: null })}
                                    disabled={deleting}
                                >
                                    Cancel
                                </button>
                                <button type="button" className="btn btn-danger" onClick={handleDelete} disabled={deleting}>
                                    {deleting ? (
                                        <>
                                            <span className="spinner-border spinner-border-sm me-2"></span>
                                            Deleting...
                                        </>
                                    ) : (
                                        <>
                                            <i className="fa-solid fa-trash me-2"></i>
                                            Delete
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            ) : null}
        </div>
    );
}
