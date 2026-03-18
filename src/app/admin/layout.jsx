"use client";
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import AdminGuard from '@/components/AdminGuard';

export default function AdminLayout({ children }) {
    const pathname = usePathname();
    const { logout } = useAuth();
    const navItems = [
        { href: '/admin/dashboard', label: 'Dashboard', icon: 'fa-solid fa-chart-line' },
        { href: '/admin/campaigns', label: 'Campaigns', icon: 'fa-solid fa-bullhorn' },
        { href: '/admin/blogs', label: 'Articles', icon: 'fa-solid fa-newspaper' },
        { href: '/admin/fatwas', label: 'Fatwas', icon: 'fa-solid fa-scale-balanced' },
        { href: '/admin/team', label: 'Team', icon: 'fa-solid fa-users' },
        { href: '/admin/donations', label: 'Donations', icon: 'fa-solid fa-hand-holding-dollar' },
        { href: '/admin/images', label: 'Images & Media', icon: 'fa-regular fa-images' },
        { href: '/admin/content', label: 'Site Builder', icon: 'fa-solid fa-pen-ruler' },
        { href: '/admin/settings', label: 'Brand & Contact', icon: 'fa-solid fa-gear' },
    ];

    const isActive = (href) => pathname === href || pathname.startsWith(`${href}/`);

    return (
        <AdminGuard>
            <div
                className="d-flex flex-column flex-lg-row"
                style={{ minHeight: '100vh', background: 'linear-gradient(180deg, #f7f8fb 0%, #eef2f7 100%)' }}
            >
                <aside
                    className="bg-dark text-white p-3 p-lg-4 d-flex flex-column"
                    style={{ width: '280px', minHeight: '100vh' }}
                >
                    <div className="mb-4">
                        <span className="badge text-bg-light rounded-pill mb-3">Admin Control Center</span>
                        <h4 className="mb-2">IRWA Admin</h4>
                        <p className="text-white-50 mb-0 small">
                            Manage campaigns, scholarship content, site copy, and public-facing media from one place.
                        </p>
                    </div>

                    <nav className="nav flex-column gap-2">
                        {navItems.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`nav-link rounded-3 px-3 py-2 ${
                                    isActive(item.href) ? 'bg-white text-dark fw-bold' : 'text-white'
                                }`}
                            >
                                <i className={`${item.icon} me-2`}></i>
                                {item.label}
                            </Link>
                        ))}
                    </nav>

                    <div className="mt-auto pt-4">
                        <button onClick={logout} className="btn btn-outline-light w-100">Logout</button>
                        <Link href="/" className="btn btn-link text-white w-100 mt-2 text-decoration-none">← Back to Site</Link>
                    </div>
                </aside>
                <main className="flex-grow-1 p-4 p-xl-5">
                    <div className="container-fluid px-0">
                        {children}
                    </div>
                </main>
            </div>
        </AdminGuard>
    );
}
