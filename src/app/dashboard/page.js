"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import api from '@/utils/api';
import HeaderOne from '@/components/HeaderOne';
import FooterOne from '@/components/FooterOne';
import BreadcrumbOne from '@/components/BreadcrumbOne';

export default function DashboardPage() {
    const [donations, setDonations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        // Redirect to login if not authenticated
        if (!authLoading && !user) {
            router.push('/login');
            return;
        }

        // Fetch donations when authenticated
        if (user) {
            fetchDonations();
        }
    }, [user, authLoading, router]);

    const fetchDonations = async () => {
        try {
            const response = await api.get('/donations/my-donations');
            if (response.data.success) {
                setDonations(response.data.data);
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to load donation history');
        } finally {
            setLoading(false);
        }
    };

    // Format date
    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    // Format currency
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
        }).format(amount);
    };

    // Get status badge class
    const getStatusBadge = (status) => {
        switch (status?.toLowerCase()) {
            case 'completed':
                return 'bg-success';
            case 'pending':
                return 'bg-warning';
            case 'failed':
                return 'bg-danger';
            default:
                return 'bg-secondary';
        }
    };

    // Calculate total donations
    const totalDonated = donations.reduce((sum, d) => {
        if (d.payment_status === 'completed') {
            return sum + parseFloat(d.amount);
        }
        return sum;
    }, 0);

    // Show loading while checking auth
    if (authLoading) {
        return (
            <section className="page-wrapper">
                <HeaderOne />
                <div className="container py-5">
                    <div className="text-center py-5">
                        <div className="spinner-border text-primary" role="status">
                            <span className="visually-hidden">Loading...</span>
                        </div>
                    </div>
                </div>
                <FooterOne />
            </section>
        );
    }

    // Redirect handled in useEffect
    if (!user) {
        return null;
    }

    return (
        <section className="page-wrapper">
            <HeaderOne />
            <BreadcrumbOne
                title="My Dashboard"
                links={[
                    { name: "Home", link: "/" },
                    { name: "Dashboard", link: "/dashboard" }
                ]}
            />

            <div className="container py-5">
                {/* Welcome Card */}
                <div className="row mb-4">
                    <div className="col-12">
                        <div className="card border-0 shadow-sm rounded-4 bg-primary text-white">
                            <div className="card-body p-4">
                                <div className="row align-items-center">
                                    <div className="col-md-8">
                                        <h2 className="fw-bold mb-2">
                                            <i className="fa-solid fa-hand-wave me-2"></i>
                                            Welcome back, {user.name}!
                                        </h2>
                                        <p className="mb-0 opacity-75">
                                            Thank you for your generous contributions to our causes.
                                        </p>
                                    </div>
                                    <div className="col-md-4 text-md-end mt-3 mt-md-0">
                                        <div className="bg-white bg-opacity-25 rounded-3 p-3 d-inline-block">
                                            <small className="d-block mb-1">Total Donated</small>
                                            <h3 className="fw-bold mb-0">{formatCurrency(totalDonated)}</h3>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Stats Row */}
                <div className="row mb-4">
                    <div className="col-md-4 mb-3 mb-md-0">
                        <div className="card border-0 shadow-sm rounded-3 h-100">
                            <div className="card-body text-center p-4">
                                <div className="rounded-circle bg-primary bg-opacity-10 d-inline-flex align-items-center justify-content-center mb-3" style={{ width: '60px', height: '60px' }}>
                                    <i className="fa-solid fa-heart text-primary" style={{ fontSize: '1.5rem' }}></i>
                                </div>
                                <h4 className="fw-bold">{donations.length}</h4>
                                <p className="text-muted mb-0">Total Donations</p>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-4 mb-3 mb-md-0">
                        <div className="card border-0 shadow-sm rounded-3 h-100">
                            <div className="card-body text-center p-4">
                                <div className="rounded-circle bg-success bg-opacity-10 d-inline-flex align-items-center justify-content-center mb-3" style={{ width: '60px', height: '60px' }}>
                                    <i className="fa-solid fa-check text-success" style={{ fontSize: '1.5rem' }}></i>
                                </div>
                                <h4 className="fw-bold">
                                    {donations.filter(d => d.payment_status === 'completed').length}
                                </h4>
                                <p className="text-muted mb-0">Completed</p>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-4">
                        <div className="card border-0 shadow-sm rounded-3 h-100">
                            <div className="card-body text-center p-4">
                                <div className="rounded-circle bg-info bg-opacity-10 d-inline-flex align-items-center justify-content-center mb-3" style={{ width: '60px', height: '60px' }}>
                                    <i className="fa-solid fa-calendar text-info" style={{ fontSize: '1.5rem' }}></i>
                                </div>
                                <h4 className="fw-bold">
                                    {user.created_at ? formatDate(user.created_at) : 'N/A'}
                                </h4>
                                <p className="text-muted mb-0">Member Since</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Donation History Table */}
                <div className="card border-0 shadow-sm rounded-4">
                    <div className="card-header bg-white border-0 p-4">
                        <h5 className="mb-0 fw-bold">
                            <i className="fa-solid fa-history me-2 text-primary"></i>
                            Donation History
                        </h5>
                    </div>
                    <div className="card-body p-4 pt-0">
                        {loading ? (
                            <div className="text-center py-5">
                                <div className="spinner-border text-primary" role="status">
                                    <span className="visually-hidden">Loading...</span>
                                </div>
                            </div>
                        ) : error ? (
                            <div className="alert alert-danger">{error}</div>
                        ) : donations.length === 0 ? (
                            <div className="text-center py-5">
                                <i className="fa-solid fa-hand-holding-heart text-muted mb-3" style={{ fontSize: '4rem' }}></i>
                                <h5>No donations yet</h5>
                                <p className="text-muted mb-4">
                                    Be the change! Start making a difference today.
                                </p>
                                <Link href="/" className="btn btn-primary">
                                    <i className="fa-solid fa-heart me-2"></i>
                                    Browse Campaigns
                                </Link>
                            </div>
                        ) : (
                            <div className="table-responsive">
                                <table className="table table-hover align-middle mb-0">
                                    <thead className="table-light">
                                        <tr>
                                            <th>Date</th>
                                            <th>Campaign</th>
                                            <th>Amount</th>
                                            <th>Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {donations.map((donation) => (
                                            <tr key={donation.id}>
                                                <td>
                                                    <span className="text-muted">
                                                        {formatDate(donation.created_at)}
                                                    </span>
                                                </td>
                                                <td>
                                                    <strong>
                                                        {donation.campaign_title || `Campaign #${donation.campaign_id}`}
                                                    </strong>
                                                </td>
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
