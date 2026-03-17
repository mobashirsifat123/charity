"use client";
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/**
 * Redirect /admin/create-campaign → /admin/campaigns/new
 * Kept for backward compatibility
 */
export default function CreateCampaignRedirect() {
    const router = useRouter();

    useEffect(() => {
        router.replace('/admin/campaigns/new');
    }, [router]);

    return (
        <div className="min-vh-100 d-flex align-items-center justify-content-center">
            <div className="text-center">
                <div className="spinner-border text-primary mb-3" role="status">
                    <span className="visually-hidden">Redirecting...</span>
                </div>
                <p className="text-muted">Redirecting...</p>
            </div>
        </div>
    );
}
