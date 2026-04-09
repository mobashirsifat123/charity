"use client";
import { useEffect, useMemo, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Sidebar from '@/components/admin/Sidebar';
import {
    canAccessAdminPath,
    getDefaultAdminPath,
    isAdminRole,
} from '@/lib/admin-navigation';

export default function AdminLayout({ children }) {
    const pathname = usePathname();
    const router = useRouter();
    const { user, loading, logout } = useAuth();
    const [accessState, setAccessState] = useState('checking');
    const userRole = user?.role || null;
    const nextPath = useMemo(
        () => encodeURIComponent(pathname || '/admin/dashboard'),
        [pathname]
    );

    useEffect(() => {
        if (loading) return;

        if (!user) {
            setAccessState('not-logged-in');
            const timeout = window.setTimeout(() => {
                router.replace(`/login?next=${nextPath}`);
            }, 1200);
            return () => window.clearTimeout(timeout);
        }

        if (!isAdminRole(userRole)) {
            setAccessState('not-authorized');
            const timeout = window.setTimeout(() => {
                router.replace('/');
            }, 1500);
            return () => window.clearTimeout(timeout);
        }

        if (!canAccessAdminPath(userRole, pathname)) {
            setAccessState('blocked-route');
            const timeout = window.setTimeout(() => {
                router.replace(getDefaultAdminPath(userRole));
            }, 1200);
            return () => window.clearTimeout(timeout);
        }

        setAccessState('authorized');
        return undefined;
    }, [loading, pathname, router, nextPath, user, userRole]);

    if (loading || accessState === 'checking') {
        return (
            <div className="min-vh-100 d-flex align-items-center justify-content-center" style={{ background: 'linear-gradient(180deg, #f4f8f6 0%, #ffffff 100%)' }}>
                <div className="text-center">
                    <div className="spinner-border text-primary mb-3" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                    <p className="text-muted mb-0">Checking admin access...</p>
                </div>
            </div>
        );
    }

    if (accessState === 'not-logged-in') {
        return (
            <div className="min-vh-100 d-flex align-items-center justify-content-center" style={{ background: 'linear-gradient(180deg, #f4f8f6 0%, #ffffff 100%)' }}>
                <div className="text-center">
                    <i className="fa-solid fa-lock text-warning mb-3" style={{ fontSize: '3rem' }}></i>
                    <h3 className="mb-2">Login required</h3>
                    <p className="text-muted mb-0">Redirecting you to sign in...</p>
                </div>
            </div>
        );
    }

    if (accessState === 'not-authorized') {
        return (
            <div className="min-vh-100 d-flex align-items-center justify-content-center" style={{ background: 'linear-gradient(180deg, #f4f8f6 0%, #ffffff 100%)' }}>
                <div className="text-center">
                    <i className="fa-solid fa-shield-halved text-danger mb-3" style={{ fontSize: '3rem' }}></i>
                    <h3 className="mb-2">Access denied</h3>
                    <p className="text-muted mb-0">Only admin and scholar roles can enter this workspace.</p>
                </div>
            </div>
        );
    }

    if (accessState === 'blocked-route') {
        return (
            <div className="min-vh-100 d-flex align-items-center justify-content-center" style={{ background: 'linear-gradient(180deg, #f4f8f6 0%, #ffffff 100%)' }}>
                <div className="text-center">
                    <i className="fa-solid fa-route text-primary mb-3" style={{ fontSize: '3rem' }}></i>
                    <h3 className="mb-2">Redirecting to your workspace</h3>
                    <p className="text-muted mb-0">
                        This section is not available for your role.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div
            className="d-flex flex-column flex-lg-row"
            style={{ minHeight: '100vh', background: 'linear-gradient(180deg, #f4f8f6 0%, #ffffff 100%)' }}
        >
            <Sidebar pathname={pathname} role={userRole} onLogout={logout} />
            <main className="flex-grow-1 p-4 p-xl-5">
                <div className="container-fluid px-0">
                    <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
                        <div>
                            <span className="badge bg-white border rounded-pill mb-2" style={{ color: 'var(--primary-color)' }}>
                                {userRole === 'scholar' ? 'Scholar Access' : 'Super Admin Access'}
                            </span>
                            <h2 className="mb-1">Admin Workspace</h2>
                            <p className="text-muted mb-0">
                                {userRole === 'scholar'
                                    ? 'You can manage dawah content, learning modules, and incoming fatwa work.'
                                    : 'You have full control across charity, dawah, learning, and platform operations.'}
                            </p>
                        </div>
                        <div className="text-muted small">
                            Signed in as <strong>{user?.name || user?.email || 'IRWA user'}</strong>
                        </div>
                    </div>
                    {children}
                </div>
            </main>
        </div>
    );
}
