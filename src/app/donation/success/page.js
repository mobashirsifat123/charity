"use client";
import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import HeaderOne from '@/components/HeaderOne';
import FooterOne from '@/components/FooterOne';

function DonationSuccessContent() {
    const { locale, t } = useLanguage();
    const [status, setStatus] = useState('verifying'); // verifying, success, error
    const [donation, setDonation] = useState(null);
    const [error, setError] = useState('');
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const searchParams = useSearchParams();
    const sessionId = searchParams.get('session_id');
    const currency = (searchParams.get('currency') || 'USD').toUpperCase();
    const donationType = searchParams.get('type') || 'donation';

    useEffect(() => {
        const verifyDonation = async () => {
            try {
                const response = await fetch('/api/stripe/verify-donation', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ sessionId: sessionId })
                });
                const data = await response.json();

                if (data.success) {
                    setStatus('success');
                    setDonation(data.data);
                } else {
                    setStatus('error');
                    setError(data.message || 'Verification failed');
                }
            } catch (err) {
                setStatus('error');
                setError(err.message || 'Failed to verify donation');
            }
        };

        // Redirect to home if no session ID
        if (!sessionId) {
            router.push('/');
            return;
        }

        // Wait for auth to load
        if (authLoading) return;

        // Redirect to login if not authenticated
        if (!user) {
            router.push('/login');
            return;
        }

        // Verify the donation
        verifyDonation();
    }, [sessionId, user, authLoading, router]);

    // Format currency
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat(locale === 'ar' ? 'ar' : 'en-US', {
            style: 'currency',
            currency,
        }).format(amount || 0);
    };

    return (
        <section className="page-wrapper">
            <HeaderOne />

            <div className="container py-5">
                <div className="row justify-content-center">
                    <div className="col-lg-6 col-md-8">
                        <div className="content-panel text-center overflow-hidden">
                            <div className="card-body p-5">
                                {status === 'verifying' && (
                                    <>
                                        <div className="mb-4">
                                            <div className="spinner-border text-primary" style={{ width: '4rem', height: '4rem' }} role="status">
                                                <span className="visually-hidden">{t('verifyingPayment', 'Verifying Payment')}</span>
                                            </div>
                                        </div>
                                        <h3 className="fw-bold">{t('verifyingPayment', 'Verifying Payment')}</h3>
                                        <p className="text-muted">{t('pleaseWaitConfirmDonation', 'Please wait while we confirm your donation...')}</p>
                                    </>
                                )}

                                {status === 'success' && (
                                    <>
                                        <div className="mb-4">
                                            <div className="rounded-circle d-inline-flex align-items-center justify-content-center" style={{ width: '100px', height: '100px', background: 'rgba(20, 90, 50, 0.12)' }}>
                                                <i className="fa-solid fa-check text-success" style={{ fontSize: '3rem' }}></i>
                                            </div>
                                        </div>
                                        <h2 className="fw-bold text-success mb-3">{t('thankYou', 'Thank You!')}</h2>
                                        <p className="lead mb-4">
                                            {(donationType === 'zakat'
                                                ? 'Your zakat payment of {amount} has been received.'
                                                : t('donationReceived', 'Your donation of {amount} has been received.')
                                            ).replace('{amount}', formatCurrency(donation?.amount))}
                                        </p>

                                        <div className="rounded-4 p-4 mb-4" style={{ background: 'var(--surface-alt)' }}>
                                            <p className="mb-2 text-muted small">{t('donationDetails', 'Donation Details')}</p>
                                            <p className="mb-1">
                                                <strong>{t('amount', 'Amount')}:</strong> {formatCurrency(donation?.amount)}
                                            </p>
                                            <p className="mb-1">
                                                <strong>{t('statusLabel', 'Status')}:</strong>{' '}
                                                <span className="badge bg-success">{t('completed', 'Completed')}</span>
                                            </p>
                                            <p className="mb-0">
                                                <strong>{t('reference', 'Reference')}:</strong>{' '}
                                                <code className="small">#{donation?.id}</code>
                                            </p>
                                        </div>

                                        <p className="text-muted mb-4">
                                            {t('reviewDonationDashboard', 'You can review this donation any time from your dashboard.')}
                                        </p>

                                        <div className="d-flex gap-3 justify-content-center flex-wrap">
                                            <Link href="/dashboard" className="btn btn-primary btn-ripple btn-lg px-4">
                                                <i className="fa-solid fa-chart-line me-2"></i>
                                                {t('viewDashboard', 'View Dashboard')}
                                            </Link>
                                            <Link href="/" className="btn btn-outline-secondary btn-ripple btn-lg px-4">
                                                <i className="fa-solid fa-home me-2"></i>
                                                {t('backToHome', 'Back to Home')}
                                            </Link>
                                        </div>
                                    </>
                                )}

                                {status === 'error' && (
                                    <>
                                        <div className="mb-4">
                                            <div className="rounded-circle d-inline-flex align-items-center justify-content-center" style={{ width: '100px', height: '100px', background: 'rgba(173, 76, 61, 0.12)' }}>
                                                <i className="fa-solid fa-times text-danger" style={{ fontSize: '3rem' }}></i>
                                            </div>
                                        </div>
                                        <h2 className="fw-bold text-danger mb-3">{t('verificationFailed', 'Verification Failed')}</h2>
                                        <p className="text-muted mb-4">{error}</p>

                                        <div className="d-flex gap-3 justify-content-center flex-wrap">
                                            <Link href="/" className="btn btn-primary btn-ripple btn-lg px-4">
                                                <i className="fa-solid fa-redo me-2"></i>
                                                {t('tryAgain', 'Try Again')}
                                            </Link>
                                            <Link href="/dashboard" className="btn btn-outline-secondary btn-ripple btn-lg px-4">
                                                <i className="fa-solid fa-chart-line me-2"></i>
                                                {t('viewDashboard', 'View Dashboard')}
                                            </Link>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <FooterOne />
        </section>
    );
}

export default function DonationSuccessPage() {
    return (
        <Suspense fallback={
            <section className="page-wrapper">
                <div className="d-flex align-items-center justify-content-center min-vh-100">
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                </div>
            </section>
        }>
            <DonationSuccessContent />
        </Suspense>
    );
}
