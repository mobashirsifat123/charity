"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';
import api from '@/utils/api';
import HeaderOne from '@/components/HeaderOne';
import FooterOne from '@/components/FooterOne';
import BreadcrumbOne from '@/components/BreadcrumbOne';
import AdminGuard from '@/components/AdminGuard';

function CampaignListContent() {
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
            const params = searchTerm ? `?search=${encodeURIComponent(searchTerm)}&limit=100` : '?limit=100';
            const response = await api.get(`/campaigns${params}`);
            if (response.data.success) {
                setCampaigns(response.data.data);
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to load campaigns');
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
            const response = await api.delete(`/campaigns/${deleteModal.campaign.id}`);
            if (response.data.success) {
                setCampaigns(prev => prev.filter(c => c.id !== deleteModal.campaign.id));
                setDeleteModal({ show: false, campaign: null });
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to delete campaign');
        } finally {
            setDeleting(false);
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
        }).format(amount || 0);
    };

    const getProgress = (raised, goal) => {
        if (!goal) return 0;
        return Math.min((raised / goal) * 100, 100).toFixed(1);
    };

    return (
        <section className="page-wrapper">
            <HeaderOne />
            <BreadcrumbOne
                title="Manage Campaigns"
                links={[
                    { name: "Home", link: "/" },
                    { name: "Admin", link: "/admin/dashboard" },
                    { name: "Campaigns", link: "/admin/campaigns" }
                ]}
            />

            <div className="container py-5">
                {/* Header */}
                <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-3">
                    <div>
                        <h2 className="fw-bold mb-1">
                            <i className="fa-solid fa-bullhorn text-primary me-2"></i>
                            All Campaigns
                        </h2>
                        <p className="text-muted mb-0">{campaigns.length} campaigns total</p>
                    </div>
                    <Link href="/admin/create-campaign" className="btn btn-primary btn-lg">
                        <i className="fa-solid fa-plus me-2"></i>
                        Create Campaign
                    </Link>
                </div>

                {/* Search */}
                <form onSubmit={handleSearch} className="mb-4">
                    <div className="input-group">
                        <input
                            type="text"
                            className="form-control form-control-lg"
                            placeholder="Search campaigns..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                        <button type="submit" className="btn btn-primary px-4">
                            <i className="fa-solid fa-search"></i>
                        </button>
                        {search && (
                            <button
                                type="button"
                                className="btn btn-outline-secondary"
                                onClick={() => { setSearch(''); fetchCampaigns(); }}
                            >
                                Clear
                            </button>
                        )}
                    </div>
                </form>

                {error && (
                    <div className="alert alert-danger">
                        <i className="fa-solid fa-circle-exclamation me-2"></i>
                        {error}
                    </div>
                )}

                {/* Campaigns Table */}
                <div className="card border-0 shadow-sm rounded-4">
                    <div className="card-body p-0">
                        {loading ? (
                            <div className="text-center py-5">
                                <div className="spinner-border text-primary" role="status">
                                    <span className="visually-hidden">Loading...</span>
                                </div>
                            </div>
                        ) : campaigns.length === 0 ? (
                            <div className="text-center py-5">
                                <i className="fa-solid fa-inbox text-muted mb-3" style={{ fontSize: '4rem' }}></i>
                                <h5>No campaigns found</h5>
                                <p className="text-muted">Create your first campaign to get started.</p>
                                <Link href="/admin/create-campaign" className="btn btn-primary">
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
                                                    <span className="badge bg-light text-dark">
                                                        #{campaign.id}
                                                    </span>
                                                </td>
                                                <td>
                                                    <div className="d-flex align-items-center">
                                                        {campaign.image_url && (
                                                            <img
                                                                src={campaign.image_url.startsWith('http')
                                                                    ? campaign.image_url
                                                                    : `${process.env.NEXT_PUBLIC_API_URL}${campaign.image_url}`}
                                                                alt={campaign.title}
                                                                className="rounded me-3"
                                                                style={{ width: '50px', height: '50px', objectFit: 'cover' }}
                                                            />
                                                        )}
                                                        <div>
                                                            <strong>{campaign.title}</strong>
                                                            <br />
                                                            <small className="text-muted">
                                                                {campaign.description?.substring(0, 50)}
                                                                {campaign.description?.length > 50 ? '...' : ''}
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
                                                    <div style={{ minWidth: '100px' }}>
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
                                                        <Link
                                                            href={`/cause-details/${campaign.id}`}
                                                            className="btn btn-sm btn-outline-secondary"
                                                            title="View"
                                                        >
                                                            <i className="fa-solid fa-eye"></i>
                                                        </Link>
                                                        <Link
                                                            href={`/admin/campaigns/${campaign.id}/edit`}
                                                            className="btn btn-sm btn-outline-primary"
                                                            title="Edit"
                                                        >
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

                {/* Back to Dashboard */}
                <div className="mt-4">
                    <Link href="/admin/dashboard" className="btn btn-outline-secondary">
                        <i className="fa-solid fa-arrow-left me-2"></i>
                        Back to Dashboard
                    </Link>
                </div>
            </div>

            {/* Delete Confirmation Modal */}
            {deleteModal.show && (
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
                                        <small className="text-muted">
                                            Goal: {formatCurrency(deleteModal.campaign?.goal_amount)}
                                        </small>
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
                                <button
                                    type="button"
                                    className="btn btn-danger"
                                    onClick={handleDelete}
                                    disabled={deleting}
                                >
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
            )}

            <FooterOne />
        </section>
    );
}

export default function CampaignListPage() {
    return (
        <AdminGuard>
            <CampaignListContent />
        </AdminGuard>
    );
}
