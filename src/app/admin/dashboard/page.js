"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';
import api from '@/utils/api';
import HeaderOne from '@/components/HeaderOne';
import FooterOne from '@/components/FooterOne';
import BreadcrumbOne from '@/components/BreadcrumbOne';
import AdminGuard from '@/components/AdminGuard';

function AdminDashboardContent() {
    const [stats, setStats] = useState({
        totalRaised: 0,
        totalDonors: 0,
        totalCampaigns: 0,
        totalDonations: 0,
    });
    const [donations, setDonations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            // Fetch stats
            const statsResponse = await api.get('/admin/stats');
            if (statsResponse.data.success) {
                setStats(statsResponse.data.data);
            }

            // Fetch all donations
            const donationsResponse = await api.get('/admin/donations');
            if (donationsResponse.data.success) {
                setDonations(donationsResponse.data.data);
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to load admin data');
        } finally {
            setLoading(false);
        }
    };

    // Format currency
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
        }).format(amount || 0);
    };

    // Format date
    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    // Get status badge class
    const getStatusBadge = (status) => {
        switch (status?.toLowerCase()) {
            case 'completed': return 'bg-success';
            case 'pending': return 'bg-warning';
            case 'failed': return 'bg-danger';
            default: return 'bg-secondary';
        }
    };

    return (
        <section className="page-wrapper">
            <HeaderOne />
            <BreadcrumbOne
                title="Admin Dashboard"
                links={[
                    { name: "Home", link: "/" },
                    { name: "Admin Dashboard", link: "/admin/dashboard" }
                ]}
            />

            <div className="container py-5">
                {/* Header with Create Button */}
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <div>
                        <h2 className="fw-bold mb-1">
                            <i className="fa-solid fa-shield-halved text-primary me-2"></i>
                            Platform Overview
                        </h2>
                        <p className="text-muted mb-0">Manage campaigns and monitor donations</p>
                    </div>
                    <div className="d-flex gap-2">
                        <Link href="/admin/campaigns" className="btn btn-outline-primary btn-lg">
                            <i className="fa-solid fa-list me-2"></i>
                            Manage Campaigns
                        </Link>
                        <Link href="/admin/create-campaign" className="btn btn-primary btn-lg">
                            <i className="fa-solid fa-plus me-2"></i>
                            Create Campaign
                        </Link>
                    </div>
                </div>

                {error && (
                    <div className="alert alert-danger">{error}</div>
                )}

                {/* Stats Cards */}
                <div className="row mb-5">
                    <div className="col-md-3 mb-3">
                        <div className="card border-0 shadow-sm rounded-4 h-100 bg-primary text-white">
                            <div className="card-body p-4">
                                <div className="d-flex align-items-center mb-3">
                                    <div className="rounded-circle bg-white bg-opacity-25 p-3 me-3">
                                        <i className="fa-solid fa-dollar-sign fs-4"></i>
                                    </div>
                                    <div>
                                        <small className="opacity-75">Total Raised</small>
                                        <h3 className="mb-0 fw-bold">
                                            {loading ? '...' : formatCurrency(stats.totalRaised)}
                                        </h3>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-3 mb-3">
                        <div className="card border-0 shadow-sm rounded-4 h-100">
                            <div className="card-body p-4">
                                <div className="d-flex align-items-center mb-3">
                                    <div className="rounded-circle bg-success bg-opacity-10 p-3 me-3">
                                        <i className="fa-solid fa-users text-success fs-4"></i>
                                    </div>
                                    <div>
                                        <small className="text-muted">Total Donors</small>
                                        <h3 className="mb-0 fw-bold text-success">
                                            {loading ? '...' : stats.totalDonors}
                                        </h3>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-3 mb-3">
                        <div className="card border-0 shadow-sm rounded-4 h-100">
                            <div className="card-body p-4">
                                <div className="d-flex align-items-center mb-3">
                                    <div className="rounded-circle bg-info bg-opacity-10 p-3 me-3">
                                        <i className="fa-solid fa-bullhorn text-info fs-4"></i>
                                    </div>
                                    <div>
                                        <small className="text-muted">Campaigns</small>
                                        <h3 className="mb-0 fw-bold text-info">
                                            {loading ? '...' : stats.totalCampaigns}
                                        </h3>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-3 mb-3">
                        <div className="card border-0 shadow-sm rounded-4 h-100">
                            <div className="card-body p-4">
                                <div className="d-flex align-items-center mb-3">
                                    <div className="rounded-circle bg-warning bg-opacity-10 p-3 me-3">
                                        <i className="fa-solid fa-heart text-warning fs-4"></i>
                                    </div>
                                    <div>
                                        <small className="text-muted">Donations</small>
                                        <h3 className="mb-0 fw-bold text-warning">
                                            {loading ? '...' : stats.totalDonations}
                                        </h3>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* All Donations Table */}
                <div className="card border-0 shadow-sm rounded-4">
                    <div className="card-header bg-white border-0 p-4">
                        <h5 className="mb-0 fw-bold">
                            <i className="fa-solid fa-list me-2 text-primary"></i>
                            All Donations
                        </h5>
                    </div>
                    <div className="card-body p-4 pt-0">
                        {loading ? (
                            <div className="text-center py-5">
                                <div className="spinner-border text-primary" role="status">
                                    <span className="visually-hidden">Loading...</span>
                                </div>
                            </div>
                        ) : donations.length === 0 ? (
                            <div className="text-center py-5">
                                <i className="fa-solid fa-inbox text-muted mb-3" style={{ fontSize: '4rem' }}></i>
                                <h5>No donations yet</h5>
                                <p className="text-muted">Donations will appear here once users start contributing.</p>
                            </div>
                        ) : (
                            <div className="table-responsive">
                                <table className="table table-hover align-middle mb-0">
                                    <thead className="table-light">
                                        <tr>
                                            <th>ID</th>
                                            <th>Donor</th>
                                            <th>Campaign</th>
                                            <th>Amount</th>
                                            <th>Status</th>
                                            <th>Date</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {donations.map((donation) => (
                                            <tr key={donation.id}>
                                                <td>
                                                    <span className="badge bg-light text-dark">
                                                        #{donation.id}
                                                    </span>
                                                </td>
                                                <td>
                                                    <div>
                                                        <strong>{donation.donor_name}</strong>
                                                        <br />
                                                        <small className="text-muted">{donation.donor_email}</small>
                                                    </div>
                                                </td>
                                                <td>{donation.campaign_title}</td>
                                                <td>
                                                    <span className="fw-bold text-success">
                                                        {formatCurrency(donation.amount)}
                                                    </span>
                                                </td>
                                                <td>
                                                    <span className={`badge ${getStatusBadge(donation.payment_status)}`}>
                                                        {donation.payment_status}
                                                    </span>
                                                </td>
                                                <td>
                                                    <small className="text-muted">
                                                        {formatDate(donation.created_at)}
                                                    </small>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <FooterOne />
        </section>
    );
}

export default function AdminDashboardPage() {
    return (
        <AdminGuard>
            <AdminDashboardContent />
        </AdminGuard>
    );
}
