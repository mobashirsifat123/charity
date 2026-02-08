"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { loadStripe } from '@stripe/stripe-js';
import { useAuth } from '@/context/AuthContext';
import api from '@/utils/api';

// Initialize Stripe
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_KEY);

/**
 * DonateModal - Reusable donation modal with Stripe Checkout
 * @param {boolean} isOpen - Whether modal is visible
 * @param {function} onClose - Function to close modal
 * @param {number} campaignId - Campaign ID to donate to
 * @param {string} campaignTitle - Campaign title for display
 * @param {function} onSuccess - Callback after successful donation
 */
const DonateModal = ({ isOpen, onClose, campaignId, campaignTitle, onSuccess }) => {
    const [amount, setAmount] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const { user } = useAuth();
    const router = useRouter();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        // Check if user is logged in
        if (!user) {
            router.push('/login');
            return;
        }

        // Validate amount
        const donationAmount = parseFloat(amount);
        if (isNaN(donationAmount) || donationAmount <= 0) {
            setError('Please enter a valid donation amount');
            return;
        }

        if (donationAmount < 1) {
            setError('Minimum donation is $1.00');
            return;
        }

        setLoading(true);

        try {
            // Create Stripe Checkout Session
            const response = await api.post('/stripe/create-checkout-session', {
                amount: donationAmount,
                campaignTitle: campaignTitle,
                campaignId: campaignId,
            });

            if (response.data.success) {
                // Redirect to Stripe Checkout
                const { url } = response.data.data;
                window.location.href = url;
            } else {
                setError(response.data.message || 'Failed to create checkout session');
                setLoading(false);
            }
        } catch (err) {
            setError(err.response?.data?.message || 'An error occurred while processing your request');
            setLoading(false);
        }
    };

    const handleClose = () => {
        setAmount('');
        setError('');
        onClose();
    };

    // Quick amount buttons
    const quickAmounts = [10, 25, 50, 100, 250];

    if (!isOpen) return null;

    return (
        <>
            {/* Backdrop */}
            <div
                className="modal-backdrop fade show"
                onClick={handleClose}
                style={{ zIndex: 1050 }}
            ></div>

            {/* Modal */}
            <div
                className="modal fade show d-block"
                tabIndex="-1"
                style={{ zIndex: 1055 }}
            >
                <div className="modal-dialog modal-dialog-centered">
                    <div className="modal-content border-0 shadow-lg rounded-4">
                        <div className="modal-header border-0 pb-0">
                            <div>
                                <h5 className="modal-title fw-bold text-primary">
                                    <i className="fa-solid fa-heart me-2"></i>
                                    Make a Donation
                                </h5>
                                <p className="text-muted mb-0 small">{campaignTitle}</p>
                            </div>
                            <button
                                type="button"
                                className="btn-close"
                                onClick={handleClose}
                            ></button>
                        </div>

                        <div className="modal-body pt-3">
                            <form onSubmit={handleSubmit}>
                                {error && (
                                    <div className="alert alert-danger py-2" role="alert">
                                        <i className="fa-solid fa-circle-exclamation me-2"></i>
                                        {error}
                                    </div>
                                )}

                                {!user && (
                                    <div className="alert alert-warning py-2" role="alert">
                                        <i className="fa-solid fa-triangle-exclamation me-2"></i>
                                        Please <a href="/login" className="alert-link">login</a> to make a donation.
                                    </div>
                                )}

                                {/* Stripe Badge */}
                                <div className="text-center mb-3">
                                    <span className="badge bg-light text-dark p-2">
                                        <i className="fa-brands fa-stripe fs-4 text-primary"></i>
                                        <span className="ms-2 small">Secure Payment</span>
                                    </span>
                                </div>

                                {/* Quick Amount Buttons */}
                                <div className="mb-3">
                                    <label className="form-label fw-semibold">Quick Select</label>
                                    <div className="d-flex flex-wrap gap-2">
                                        {quickAmounts.map((quickAmount) => (
                                            <button
                                                key={quickAmount}
                                                type="button"
                                                className={`btn ${amount === String(quickAmount) ? 'btn-primary' : 'btn-outline-primary'}`}
                                                onClick={() => setAmount(String(quickAmount))}
                                            >
                                                ${quickAmount}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Custom Amount Input */}
                                <div className="mb-4">
                                    <label htmlFor="amount" className="form-label fw-semibold">
                                        Enter Amount ($)
                                    </label>
                                    <div className="input-group input-group-lg">
                                        <span className="input-group-text bg-light">$</span>
                                        <input
                                            type="number"
                                            className="form-control"
                                            id="amount"
                                            placeholder="0.00"
                                            min="1"
                                            step="0.01"
                                            value={amount}
                                            onChange={(e) => setAmount(e.target.value)}
                                            required
                                        />
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    className="btn btn-primary w-100 py-3 fw-semibold"
                                    disabled={loading || !user}
                                >
                                    {loading ? (
                                        <>
                                            <span className="spinner-border spinner-border-sm me-2"></span>
                                            Redirecting to Stripe...
                                        </>
                                    ) : (
                                        <>
                                            <i className="fa-solid fa-lock me-2"></i>
                                            Pay {amount ? `$${amount}` : ''} with Stripe
                                        </>
                                    )}
                                </button>

                                <p className="text-center text-muted small mt-3 mb-0">
                                    <i className="fa-solid fa-shield-check me-1"></i>
                                    Your payment is secured by Stripe
                                </p>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default DonateModal;
