"use client";
import { useState, Suspense } from 'react';
import Link from 'next/link';
import useCampaigns from '@/hooks/useCampaigns';
import SearchBar from '@/components/SearchBar';
import CategoryFilter from '@/components/CategoryFilter';
import Pagination from '@/components/Pagination';
import DonateModal from '@/components/DonateModal';

// Campaign Card Component
const CampaignCard = ({ campaign, onDonate }) => {
    const progress = campaign.goal_amount > 0
        ? Math.min((campaign.raised_amount / campaign.goal_amount) * 100, 100)
        : 0;

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(amount || 0);
    };

    const getImageUrl = (url) => {
        if (!url) return '/assets/img/cause/default-cause.jpg';
        if (url.startsWith('http')) return url;
        return `${process.env.NEXT_PUBLIC_API_URL}${url}`;
    };

    return (
        <div className="col-lg-4 col-md-6 mb-4">
            <div className="card campaign-card h-100 border-0 shadow-sm rounded-4 overflow-hidden">
                <div className="position-relative">
                    <img
                        src={getImageUrl(campaign.image_url)}
                        alt={campaign.title}
                        className="card-img-top"
                        style={{ height: '200px', objectFit: 'cover' }}
                        onError={(e) => {
                            e.target.src = '/assets/img/cause/default-cause.jpg';
                        }}
                    />
                    {campaign.category && (
                        <span className="badge bg-primary position-absolute top-0 end-0 m-3">
                            {campaign.category}
                        </span>
                    )}
                </div>

                <div className="card-body p-4">
                    <h5 className="card-title fw-bold mb-2 text-truncate">
                        {campaign.title}
                    </h5>
                    <p className="card-text text-muted small mb-3" style={{
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                    }}>
                        {campaign.description || 'Support this campaign and make a difference.'}
                    </p>

                    {/* Progress Bar */}
                    <div className="mb-3">
                        <div className="progress" style={{ height: '8px' }}>
                            <div
                                className="progress-bar bg-primary"
                                role="progressbar"
                                style={{ width: `${progress}%` }}
                                aria-valuenow={progress}
                                aria-valuemin="0"
                                aria-valuemax="100"
                            ></div>
                        </div>
                        <div className="d-flex justify-content-between mt-2 small">
                            <span className="fw-semibold text-primary">
                                {formatCurrency(campaign.raised_amount)}
                            </span>
                            <span className="text-muted">
                                of {formatCurrency(campaign.goal_amount)}
                            </span>
                        </div>
                    </div>

                    <button
                        className="btn btn-primary w-100 rounded-pill"
                        onClick={() => onDonate(campaign)}
                    >
                        <i className="fa-solid fa-heart me-2"></i>
                        Donate Now
                    </button>
                </div>
            </div>

            <style jsx>{`
                .campaign-card {
                    transition: transform 0.3s ease, box-shadow 0.3s ease;
                }
                .campaign-card:hover {
                    transform: translateY(-8px);
                    box-shadow: 0 12px 40px rgba(0,0,0,0.15) !important;
                }
            `}</style>
        </div>
    );
};

// Main Discovery Component
function CampaignDiscoveryContent() {
    const {
        campaigns,
        loading,
        error,
        totalPages,
        currentPage,
        total,
        search,
        category,
        setSearch,
        setCategory,
        setPage,
        refetch,
    } = useCampaigns();

    // Modal state
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedCampaign, setSelectedCampaign] = useState(null);

    const handleDonate = (campaign) => {
        setSelectedCampaign(campaign);
        setModalOpen(true);
    };

    const handleCloseModal = () => {
        setModalOpen(false);
        setSelectedCampaign(null);
    };

    return (
        <section className="campaign-discovery py-5">
            <div className="container">
                {/* Header */}
                <div className="text-center mb-5">
                    <span className="badge bg-primary bg-opacity-10 text-primary px-3 py-2 mb-3">
                        <i className="fa-solid fa-handshake-angle me-2"></i>
                        Support a Cause
                    </span>
                    <h2 className="display-5 fw-bold mb-3">
                        Discover Campaigns
                    </h2>
                    <p className="lead text-muted">
                        Find and support causes that matter to you
                    </p>
                </div>

                {/* Search Bar */}
                <div className="row justify-content-center mb-4">
                    <div className="col-lg-8">
                        <SearchBar
                            value={search}
                            onChange={setSearch}
                            placeholder="Search campaigns by title or description..."
                        />
                    </div>
                </div>

                {/* Category Filter */}
                <div className="mb-5">
                    <CategoryFilter
                        value={category}
                        onChange={setCategory}
                    />
                </div>

                {/* Results Info */}
                {(search || category) && (
                    <div className="text-center mb-4">
                        <span className="text-muted">
                            {total} campaign{total !== 1 ? 's' : ''} found
                            {search && <span> for "{search}"</span>}
                            {category && category !== 'all' && <span> in {category}</span>}
                        </span>
                        {(search || category) && (
                            <button
                                type="button"
                                className="btn btn-link text-primary ms-2 small"
                                onClick={() => {
                                    setSearch('');
                                    setCategory('all');
                                }}
                            >
                                Clear filters
                            </button>
                        )}
                    </div>
                )}

                {/* Loading State */}
                {loading && (
                    <div className="text-center py-5">
                        <div className="spinner-border text-primary" style={{ width: '3rem', height: '3rem' }} role="status">
                            <span className="visually-hidden">Loading...</span>
                        </div>
                        <p className="text-muted mt-3">Loading campaigns...</p>
                    </div>
                )}

                {/* Error State */}
                {error && !loading && (
                    <div className="text-center py-5">
                        <div className="text-danger mb-3">
                            <i className="fa-solid fa-circle-exclamation" style={{ fontSize: '3rem' }}></i>
                        </div>
                        <h4 className="text-danger">Error loading campaigns</h4>
                        <p className="text-muted">{error}</p>
                        <button className="btn btn-primary" onClick={refetch}>
                            <i className="fa-solid fa-redo me-2"></i>
                            Try Again
                        </button>
                    </div>
                )}

                {/* Empty State */}
                {!loading && !error && campaigns.length === 0 && (
                    <div className="text-center py-5">
                        <div className="text-muted mb-3">
                            <i className="fa-solid fa-folder-open" style={{ fontSize: '4rem' }}></i>
                        </div>
                        <h4>No campaigns found</h4>
                        <p className="text-muted">
                            {search || category
                                ? 'Try adjusting your search or filters'
                                : 'Check back later for new campaigns'}
                        </p>
                    </div>
                )}

                {/* Campaign Grid */}
                {!loading && !error && campaigns.length > 0 && (
                    <>
                        <div className="row">
                            {campaigns.map((campaign) => (
                                <CampaignCard
                                    key={campaign.id}
                                    campaign={campaign}
                                    onDonate={handleDonate}
                                />
                            ))}
                        </div>

                        {/* Pagination */}
                        <Pagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={setPage}
                            total={total}
                        />
                    </>
                )}
            </div>

            {/* Donate Modal */}
            {selectedCampaign && (
                <DonateModal
                    isOpen={modalOpen}
                    onClose={handleCloseModal}
                    campaignId={selectedCampaign.id}
                    campaignTitle={selectedCampaign.title}
                    onSuccess={refetch}
                />
            )}
        </section>
    );
}

// Wrapper with Suspense for useSearchParams
export default function CampaignDiscovery() {
    return (
        <Suspense fallback={
            <section className="campaign-discovery py-5">
                <div className="container">
                    <div className="text-center py-5">
                        <div className="spinner-border text-primary" role="status">
                            <span className="visually-hidden">Loading...</span>
                        </div>
                    </div>
                </div>
            </section>
        }>
            <CampaignDiscoveryContent />
        </Suspense>
    );
}
