"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';
import api from '@/utils/api';
import DonateModal from './DonateModal';
import ProgressBar from '../helper/ProgressBar';

/**
 * CampaignSection - Displays campaigns from API with donate modal
 */
const CampaignSection = () => {
    const [campaigns, setCampaigns] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Modal state
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedCampaign, setSelectedCampaign] = useState(null);

    const fetchCampaigns = async () => {
        try {
            const response = await api.get('/campaigns');
            if (response.data.success) {
                setCampaigns(response.data.data);
            }
        } catch (err) {
            setError('Failed to load campaigns');
            console.error('Fetch campaigns error:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCampaigns();
    }, []);

    const handleDonateClick = (campaign) => {
        setSelectedCampaign(campaign);
        setModalOpen(true);
    };

    const handleModalClose = () => {
        setModalOpen(false);
        setSelectedCampaign(null);
    };

    const handleDonationSuccess = () => {
        // Refresh campaigns to show updated raised amount
        fetchCampaigns();
    };

    // Calculate progress percentage
    const getProgress = (raised, goal) => {
        const raisedNum = parseFloat(raised) || 0;
        const goalNum = parseFloat(goal) || 1;
        return Math.min(Math.round((raisedNum / goalNum) * 100), 100);
    };

    // Format currency
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
        }).format(amount);
    };

    if (loading) {
        return (
            <section className="cause py-5">
                <div className="container">
                    <div className="text-center py-5">
                        <div className="spinner-border text-primary" role="status">
                            <span className="visually-hidden">Loading...</span>
                        </div>
                        <p className="mt-3 text-muted">Loading campaigns...</p>
                    </div>
                </div>
            </section>
        );
    }

    if (error) {
        return (
            <section className="cause py-5">
                <div className="container">
                    <div className="alert alert-danger text-center">{error}</div>
                </div>
            </section>
        );
    }

    if (campaigns.length === 0) {
        return (
            <section className="cause py-5">
                <div className="container">
                    <div className="text-center py-5">
                        <i className="fa-solid fa-heart-crack text-muted" style={{ fontSize: '4rem' }}></i>
                        <h4 className="mt-3">No Campaigns Yet</h4>
                        <p className="text-muted">Check back soon for new fundraising campaigns!</p>
                    </div>
                </div>
            </section>
        );
    }

    return (
        <>
            <section
                className="cause"
                style={{
                    backgroundImage: "url(/assets/images/cause/cause-bg.png)",
                }}
            >
                <div className="container">
                    <div className="row gutter-30 align-items-center mb-4">
                        <div className="col-12 col-md-8 col-xl-7">
                            <div className="section__header">
                                <span className="sub-title">
                                    <i className="icon-donation" />
                                    Active Campaigns
                                </span>
                                <h2 className="title-animation_inner">
                                    Help &amp; <span>donate</span> to make a difference
                                </h2>
                            </div>
                        </div>
                    </div>

                    <div className="row">
                        {campaigns.map((campaign) => (
                            <div key={campaign.id} className="col-12 col-md-6 col-lg-4 col-xl-3 mb-4">
                                <div className="cause__slider-inner">
                                    <div className="cause__slider-single">
                                        <div className="thumb">
                                            <Link href={`/cause-details?id=${campaign.id}`}>
                                                <img
                                                    src={campaign.image_url || '/assets/images/cause/one.png'}
                                                    alt={campaign.title}
                                                    style={{ width: '100%', height: '200px', objectFit: 'cover' }}
                                                />
                                            </Link>
                                        </div>
                                        <div className="content">
                                            <h6>
                                                <Link href={`/cause-details?id=${campaign.id}`}>
                                                    {campaign.title}
                                                </Link>
                                            </h6>
                                            <p>
                                                {campaign.description?.substring(0, 80)}
                                                {campaign.description?.length > 80 ? '...' : ''}
                                            </p>
                                        </div>
                                        <div className="cause__slider-cta">
                                            <div className="cause__progress progress-bar-single">
                                                <ProgressBar
                                                    percent={getProgress(campaign.raised_amount, campaign.goal_amount)}
                                                />
                                                <div className="cause-progress__goal">
                                                    <p>
                                                        Raised: <span className="raised">
                                                            {formatCurrency(campaign.raised_amount)}
                                                        </span>
                                                    </p>
                                                    <p>
                                                        Goal: <span className="goal">
                                                            {formatCurrency(campaign.goal_amount)}
                                                        </span>
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="cause__cta">
                                                <button
                                                    onClick={() => handleDonateClick(campaign)}
                                                    className="btn--secondary"
                                                    style={{ cursor: 'pointer', border: 'none' }}
                                                >
                                                    Donate Now
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="spade">
                    <img src="/assets/images/help/spade.png" alt="decoration" />
                </div>
            </section>

            {/* Donate Modal */}
            <DonateModal
                isOpen={modalOpen}
                onClose={handleModalClose}
                campaignId={selectedCampaign?.id}
                campaignTitle={selectedCampaign?.title}
                onSuccess={handleDonationSuccess}
            />
        </>
    );
};

export default CampaignSection;
