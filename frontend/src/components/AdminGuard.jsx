"use client";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

/**
 * AdminGuard - Protects routes that require admin role
 * Shows "Not authorized" message for non-admin users before redirect
 */
const AdminGuard = ({ children }) => {
    const { user, loading } = useAuth();
    const router = useRouter();
    const [authState, setAuthState] = useState('checking'); // 'checking' | 'authorized' | 'not-logged-in' | 'not-admin'

    useEffect(() => {
        if (loading) return;

        // Check if user is logged in
        if (!user) {
            setAuthState('not-logged-in');
            setTimeout(() => router.push('/login'), 1500);
            return;
        }

        // Check if user is admin
        if (user.role !== 'admin') {
            setAuthState('not-admin');
            setTimeout(() => router.push('/'), 2000);
            return;
        }

        // User is authorized
        setAuthState('authorized');
    }, [user, loading, router]);

    // Show loading state while checking
    if (loading || authState === 'checking') {
        return (
            <div className="min-vh-100 d-flex align-items-center justify-content-center">
                <div className="text-center">
                    <div className="spinner-border text-primary mb-3" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                    <p className="text-muted">Verifying access...</p>
                </div>
            </div>
        );
    }

    // Not logged in - redirect to login
    if (authState === 'not-logged-in') {
        return (
            <div className="min-vh-100 d-flex align-items-center justify-content-center">
                <div className="text-center">
                    <i className="fa-solid fa-lock text-warning mb-3" style={{ fontSize: '4rem' }}></i>
                    <h3 className="mb-2">Authentication Required</h3>
                    <p className="text-muted">Please log in to access this page.</p>
                    <p className="text-muted small">Redirecting to login...</p>
                </div>
            </div>
        );
    }

    // Not admin - show unauthorized message
    if (authState === 'not-admin') {
        return (
            <div className="min-vh-100 d-flex align-items-center justify-content-center">
                <div className="text-center">
                    <i className="fa-solid fa-shield-xmark text-danger mb-3" style={{ fontSize: '4rem' }}></i>
                    <h3 className="mb-2">Not Authorized</h3>
                    <p className="text-muted">You don't have permission to access this page.</p>
                    <p className="text-muted small">Redirecting to homepage...</p>
                </div>
            </div>
        );
    }

    return children;
};

export default AdminGuard;
