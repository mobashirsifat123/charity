"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

import { useAuth } from '@/context/AuthContext';
import { getDefaultAdminPath } from '@/lib/admin-navigation';

export default function AdminIndex() {
    const router = useRouter();
    const { user, loading } = useAuth();

    useEffect(() => {
        if (loading) return;
        router.replace(getDefaultAdminPath(user?.role));
    }, [loading, router, user?.role]);

    return (
        <div className="min-vh-100 d-flex align-items-center justify-content-center">
            <div className="text-center">
                <div className="spinner-border text-primary mb-3" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
                <p className="text-muted mb-0">Opening your workspace...</p>
            </div>
        </div>
    );
}
