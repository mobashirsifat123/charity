"use client";
import React, { useState, useEffect } from 'react';
import { adminFetch } from '@/lib/adminApi';

export default function DonationsManagement() {
    const [donations, setDonations] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchDonations() {
            try {
                const res = await adminFetch('/api/admin/donations');
                const result = await res.json();
                if (!res.ok || !result.success) throw new Error(result.error || 'Failed to load donations.');

                setDonations(result.data);
            } catch (err) {
                console.error(err);
            }
            setLoading(false);
        }
        fetchDonations();
    }, []);

    const handleExport = () => {
        if (!donations.length) return;
        const csvContent = [
            ["ID", "Donor Name", "Email", "Amount", "Campaign", "Status", "Date"],
            ...donations.map(d => [
                d.id,
                `"${d.donor_name || 'Anonymous'}"`,
                `"${d.donor_email || ''}"`,
                d.amount,
                `"${d.campaigns?.title || 'Unknown'}"`,
                d.payment_status,
                new Date(d.created_at).toLocaleDateString()
            ])
        ].map(e => e.join(",")).join("\n");

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", "irwa_donations.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    if (loading) return <div>Loading donations...</div>;

    return (
        <div>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2>Donations</h2>
                <button onClick={handleExport} className="btn btn-success">
                    <i className="fa-solid fa-file-csv me-2"></i> Export to CSV
                </button>
            </div>

            <div className="card shadow-sm">
                <div className="card-body p-0">
                    <div className="table-responsive">
                        <table className="table table-hover mb-0">
                            <thead className="table-light">
                                <tr>
                                    <th>Date</th>
                                    <th>Donor Name</th>
                                    <th>Email</th>
                                    <th>Campaign</th>
                                    <th>Amount</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {donations.map(d => (
                                    <tr key={d.id}>
                                        <td>{new Date(d.created_at).toLocaleDateString()}</td>
                                        <td>{d.donor_name || 'Anonymous'}</td>
                                        <td>{d.donor_email || '-'}</td>
                                        <td className="text-truncate" style={{maxWidth: '200px'}}>{d.campaigns?.title || 'General'}</td>
                                        <td className="fw-bold text-success">${parseFloat(d.amount).toFixed(2)}</td>
                                        <td>
                                            <span className={`badge bg-${d.payment_status === 'completed' ? 'success' : 'warning'}`}>
                                                {d.payment_status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                                {donations.length === 0 && (
                                    <tr>
                                        <td colSpan="6" className="text-center py-4">No donations found.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
