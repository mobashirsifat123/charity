"use client";
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import api from '@/utils/api';
import HeaderOne from '@/components/HeaderOne';
import FooterOne from '@/components/FooterOne';
import BreadcrumbOne from '@/components/BreadcrumbOne';

export default function CauseDetailPage() {
    const params = useParams();
    const campaignId = params.id;

    const [campaign, setCampaign] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchCampaign = async () => {
            try {
                setLoading(true);
                setError(null);
                const response = await api.get(`/campaigns/${campaignId}`);
                if (response.data.success) {
                    setCampaign(response.data.data);
                } else {
                    setError('Campaign not found');
                }
            } catch (err) {
                if (err.response?.status === 404) {
                    setError('Campaign not found');
                } else {
                    setError(err.response?.data?.message || 'Failed to load campaign');
                }
            } finally {
                setLoading(false);
            }
        };

        if (campaignId) {
            fetchCampaign();
        }
    }, [campaignId]);

    // Calculate progress percentage
    const getProgressPercentage = () => {
        if (!campaign || !campaign.goal_amount) return 0;
        const percentage = (parseFloat(campaign.raised_amount || 0) / parseFloat(campaign.goal_amount)) * 100;
        return Math.min(percentage, 100).toFixed(1);
    };

    // Format currency
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(amount || 0);
    };

    // Loading state
    if (loading) {
        return (
            <section className="page-wrapper">
                <HeaderOne />
                <BreadcrumbOne title="Loading..." />
                <div className="container py-5">
                    <div className="text-center py-5">
                        <div className="spinner-border text-primary" role="status" style={{ width: '3rem', height: '3rem' }}>
                            <span className="visually-hidden">Loading...</span>
                        </div>
                        <p className="mt-3 text-muted">Loading campaign details...</p>
                    </div>
                </div>
                <FooterOne />
            </section>
        );
    }

    // Error state (404 or other error)
    if (error) {
        return (
            <section className="page-wrapper">
                <HeaderOne />
                <BreadcrumbOne title="Campaign Not Found" />
                <div className="container py-5">
                    <div className="text-center py-5">
                        <i className="fa-solid fa-circle-exclamation text-danger mb-4" style={{ fontSize: '4rem' }}></i>
                        <h3 className="mb-3">{error}</h3>
                        <p className="text-muted mb-4">
                            The campaign you're looking for doesn't exist or has been removed.
                        </p>
                        <Link href="/our-causes" className="btn btn-primary">
                            <i className="fa-solid fa-arrow-left me-2"></i>
                            Browse All Campaigns
                        </Link>
                    </div>
                </div>
                <FooterOne />
            </section>
        );
    }

    // Success state - display campaign
    return (
        <section className="page-wrapper">
            <HeaderOne />
            <BreadcrumbOne
                title={campaign.title || 'Campaign Details'}
                links={[
                    { name: "Home", link: "/" },
                    { name: "Causes", link: "/our-causes" },
                    { name: campaign.title || 'Details', link: "#" }
                ]}
            />

            <div className="cm-details">
                <div className="container py-5">
                    <div className="row gutter-60">
                        {/* Main Content */}
                        <div className="col-12 col-xl-8">
                            <div className="cm-details__content">
                                {/* Campaign Image */}
                                {campaign.image_url && (
                                    <div className="cm-details__poster mb-4" data-aos="fade-up">
                                        <img
                                            src={campaign.image_url.startsWith('http')
                                                ? campaign.image_url
                                                : `${process.env.NEXT_PUBLIC_API_URL}${campaign.image_url}`}
                                            alt={campaign.title}
                                            className="w-100 rounded-4"
                                            style={{ maxHeight: '500px', objectFit: 'cover' }}
                                        />
                                    </div>
                                )}

                                {/* Category Badge */}
                                {campaign.category && (
                                    <span className="badge bg-primary mb-3 px-3 py-2">
                                        <i className="fa-solid fa-tag me-1"></i>
                                        {campaign.category}
                                    </span>
                                )}

                                {/* Title */}
                                <h2 className="fw-bold mb-4">{campaign.title}</h2>

                                {/* Progress Section */}
                                <div className="card border-0 shadow-sm rounded-4 mb-4">
                                    <div className="card-body p-4">
                                        <div className="d-flex justify-content-between align-items-center mb-3">
                                            <div>
                                                <span className="text-muted">Raised</span>
                                                <h4 className="mb-0 text-success fw-bold">
                                                    {formatCurrency(campaign.raised_amount)}
                                                </h4>
                                            </div>
                                            <div className="text-end">
                                                <span className="text-muted">Goal</span>
                                                <h4 className="mb-0 fw-bold">
                                                    {formatCurrency(campaign.goal_amount)}
                                                </h4>
                                            </div>
                                        </div>

                                        {/* Progress Bar */}
                                        <div className="progress mb-2" style={{ height: '12px' }}>
                                            <div
                                                className="progress-bar bg-success"
                                                role="progressbar"
                                                style={{ width: `${getProgressPercentage()}%` }}
                                                aria-valuenow={getProgressPercentage()}
                                                aria-valuemin="0"
                                                aria-valuemax="100"
                                            ></div>
                                        </div>
                                        <p className="text-muted mb-0 text-center">
                                            <strong>{getProgressPercentage()}%</strong> of goal reached
                                        </p>
                                    </div>
                                </div>

                                {/* Description */}
                                <div className="cm-group mb-4">
                                    <h4 className="fw-bold mb-3">About This Campaign</h4>
                                    <p className="text-muted" style={{ lineHeight: '1.8' }}>
                                        {campaign.description || 'No description available for this campaign.'}
                                    </p>
                                </div>

                                {/* Campaign Meta */}
                                <div className="cm-details-meta mb-4">
                                    <p className="text-muted">
                                        <i className="fa-solid fa-calendar-days me-2"></i>
                                        Created: {new Date(campaign.created_at).toLocaleDateString('en-US', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric'
                                        })}
                                    </p>
                                    {campaign.status && (
                                        <p className="text-muted">
                                            <i className="fa-solid fa-circle-info me-2"></i>
                                            Status: <span className={`badge ${campaign.status === 'active' ? 'bg-success' : 'bg-secondary'}`}>
                                                {campaign.status}
                                            </span>
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Sidebar */}
                        <div className="col-12 col-xl-4">
                            <div className="cm-details__sidebar">
                                {/* Donate Card */}
                                <div className="card border-0 shadow-lg rounded-4 mb-4" data-aos="fade-up">
                                    <div className="card-body p-4 text-center">
                                        <i className="fa-solid fa-hand-holding-heart text-primary mb-3" style={{ fontSize: '3rem' }}></i>
                                        <h5 className="fw-bold mb-3">Support This Cause</h5>
                                        <p className="text-muted mb-4">
                                            Your donation can make a real difference in someone's life.
                                        </p>
                                        <Link
                                            href={`/donate-us?campaign=${campaignId}`}
                                            className="btn btn-primary btn-lg w-100 py-3"
                                        >
                                            <i className="fa-solid fa-heart me-2"></i>
                                            Donate Now
                                        </Link>
                                    </div>
                                </div>

                                {/* Quick Stats */}
                                <div className="card border-0 shadow-sm rounded-4 mb-4" data-aos="fade-up" data-aos-delay="100">
                                    <div className="card-body p-4">
                                        <h6 className="fw-bold mb-3">Campaign Stats</h6>
                                        <ul className="list-unstyled mb-0">
                                            <li className="d-flex justify-content-between py-2 border-bottom">
                                                <span className="text-muted">Goal</span>
                                                <strong>{formatCurrency(campaign.goal_amount)}</strong>
                                            </li>
                                            <li className="d-flex justify-content-between py-2 border-bottom">
                                                <span className="text-muted">Raised</span>
                                                <strong className="text-success">{formatCurrency(campaign.raised_amount)}</strong>
                                            </li>
                                            <li className="d-flex justify-content-between py-2 border-bottom">
                                                <span className="text-muted">Remaining</span>
                                                <strong>{formatCurrency(Math.max(0, campaign.goal_amount - (campaign.raised_amount || 0)))}</strong>
                                            </li>
                                            <li className="d-flex justify-content-between py-2">
                                                <span className="text-muted">Progress</span>
                                                <strong>{getProgressPercentage()}%</strong>
                                            </li>
                                        </ul>
                                    </div>
                                </div>

                                {/* Share */}
                                <div className="card border-0 shadow-sm rounded-4" data-aos="fade-up" data-aos-delay="200">
                                    <div className="card-body p-4 text-center">
                                        <h6 className="fw-bold mb-3">Share This Campaign</h6>
                                        <div className="d-flex justify-content-center gap-2">
                                            <button className="btn btn-outline-primary btn-sm" title="Share on Facebook">
                                                <i className="fa-brands fa-facebook-f"></i>
                                            </button>
                                            <button className="btn btn-outline-info btn-sm" title="Share on Twitter">
                                                <i className="fa-brands fa-twitter"></i>
                                            </button>
                                            <button className="btn btn-outline-success btn-sm" title="Share on WhatsApp">
                                                <i className="fa-brands fa-whatsapp"></i>
                                            </button>
                                            <button className="btn btn-outline-secondary btn-sm" title="Copy Link">
                                                <i className="fa-solid fa-link"></i>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <FooterOne />
        </section>
    );
}
