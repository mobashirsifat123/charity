"use client";
import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import api from '@/utils/api';
import HeaderOne from '@/components/HeaderOne';
import FooterOne from '@/components/FooterOne';

function DonationSuccessContent() {
    const [status, setStatus] = useState('verifying'); // verifying, success, error
    const [donation, setDonation] = useState(null);
    const [error, setError] = useState('');
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const searchParams = useSearchParams();
    const sessionId = searchParams.get('session_id');

    useEffect(() => {
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

    const verifyDonation = async () => {
        try {
            const response = await api.post('/stripe/verify-donation', {
                sessionId: sessionId,
            });

            if (response.data.success) {
                setStatus('success');
                setDonation(response.data.data);
            } else {
                setStatus('error');
                setError(response.data.message || 'Verification failed');
            }
        } catch (err) {
            setStatus('error');
            setError(err.response?.data?.message || 'Failed to verify donation');
        }
    };

    // Format currency
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
        }).format(amount || 0);
    };

    return (
        <section className="page-wrapper">
            <HeaderOne />

            <div className="container py-5">
                <div className="row justify-content-center">
                    <div className="col-lg-6 col-md-8">
                        <div className="card border-0 shadow-lg rounded-4 text-center">
                            <div className="card-body p-5">
                                {status === 'verifying' && (
                                    <>
                                        <div className="mb-4">
                                            <div className="spinner-border text-primary" style={{ width: '4rem', height: '4rem' }} role="status">
                                                <span className="visually-hidden">Verifying...</span>
                                            </div>
                                        </div>
                                        <h3 className="fw-bold">Verifying Payment</h3>
                                        <p className="text-muted">Please wait while we confirm your donation...</p>
                                    </>
                                )}

                                {status === 'success' && (
                                    <>
                                        <div className="mb-4">
                                            <div className="rounded-circle bg-success bg-opacity-10 d-inline-flex align-items-center justify-content-center" style={{ width: '100px', height: '100px' }}>
                                                <i className="fa-solid fa-check text-success" style={{ fontSize: '3rem' }}></i>
                                            </div>
                                        </div>
                                        <h2 className="fw-bold text-success mb-3">Thank You!</h2>
                                        <p className="lead mb-4">
                                            Your donation of <strong>{formatCurrency(donation?.amount)}</strong> has been received.
                                        </p>

                                        <div className="bg-light rounded-3 p-4 mb-4">
                                            <p className="mb-2 text-muted small">Donation Details</p>
                                            <p className="mb-1">
                                                <strong>Amount:</strong> {formatCurrency(donation?.amount)}
                                            </p>
                                            <p className="mb-1">
                                                <strong>Status:</strong>{' '}
                                                <span className="badge bg-success">Completed</span>
                                            </p>
                                            <p className="mb-0">
                                                <strong>Reference:</strong>{' '}
                                                <code className="small">#{donation?.id}</code>
                                            </p>
                                        </div>

                                        <p className="text-muted mb-4">
                                            Your generosity will make a real difference.
                                            A confirmation email has been sent to your registered email address.
                                        </p>

                                        <div className="d-flex gap-3 justify-content-center flex-wrap">
                                            <Link href="/dashboard" className="btn btn-primary btn-lg px-4">
                                                <i className="fa-solid fa-chart-line me-2"></i>
                                                View Dashboard
                                            </Link>
                                            <Link href="/" className="btn btn-outline-secondary btn-lg px-4">
                                                <i className="fa-solid fa-home me-2"></i>
                                                Back to Home
                                            </Link>
                                        </div>
                                    </>
                                )}

                                {status === 'error' && (
                                    <>
                                        <div className="mb-4">
                                            <div className="rounded-circle bg-danger bg-opacity-10 d-inline-flex align-items-center justify-content-center" style={{ width: '100px', height: '100px' }}>
                                                <i className="fa-solid fa-times text-danger" style={{ fontSize: '3rem' }}></i>
                                            </div>
                                        </div>
                                        <h2 className="fw-bold text-danger mb-3">Verification Failed</h2>
                                        <p className="text-muted mb-4">{error}</p>

                                        <div className="d-flex gap-3 justify-content-center flex-wrap">
                                            <Link href="/" className="btn btn-primary btn-lg px-4">
                                                <i className="fa-solid fa-redo me-2"></i>
                                                Try Again
                                            </Link>
                                            <Link href="/dashboard" className="btn btn-outline-secondary btn-lg px-4">
                                                <i className="fa-solid fa-chart-line me-2"></i>
                                                View Dashboard
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
