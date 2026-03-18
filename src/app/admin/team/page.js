"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { adminFetchJson } from '@/lib/adminApi';

export default function AdminTeamPage() {
    const [team, setTeam] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchTeam();
    }, []);

    const fetchTeam = async () => {
        setLoading(true);
        try {
            const result = await adminFetchJson('/api/admin/resources/team');
            setTeam(result.data || []);
        } catch (error) {
            console.error('Error fetching team:', error);
        } finally {
            setLoading(false);
        }
    };

    const deleteMember = async (id) => {
        if (!window.confirm('Are you sure you want to remove this team member?')) return;

        try {
            await adminFetchJson(`/api/admin/resources/team/${id}`, { method: 'DELETE' });
            setTeam((prev) => prev.filter((member) => member.id !== id));
        } catch (error) {
            console.error('Error deleting member:', error);
            alert('Failed to remove the team member.');
        }
    };

    return (
        <div className="d-flex flex-column gap-4">
            <div className="d-flex flex-column flex-lg-row justify-content-between align-items-lg-center gap-3">
                <div>
                    <h2 className="fw-bold mb-1">
                        <i className="fa-solid fa-users text-primary me-2"></i>
                        Team Manager
                    </h2>
                    <p className="text-muted mb-0">Control the people shown on the public team section and keep their profiles up to date.</p>
                </div>
                <Link href="/admin/team/new" className="btn btn-primary rounded-pill px-4 align-self-start align-self-lg-center">
                    <i className="fa-solid fa-plus me-2"></i>
                    Add Team Member
                </Link>
            </div>

            <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
                <div className="card-header bg-white border-bottom p-4">
                    <h4 className="mb-1 fw-bold">Changemakers Roster</h4>
                    <p className="text-muted mb-0">{team.length} team profiles available</p>
                </div>
                <div className="card-body p-0">
                    {loading ? (
                        <div className="text-center py-5">
                            <div className="spinner-border text-primary" role="status"></div>
                            <p className="mt-2 text-muted mb-0">Loading team...</p>
                        </div>
                    ) : team.length === 0 ? (
                        <div className="text-center py-5">
                            <i className="fa-solid fa-users-viewfinder text-muted mb-3" style={{ fontSize: '3rem' }}></i>
                            <h5 className="fw-bold">No Team Members Found</h5>
                            <p className="text-muted">No team members have been added yet.</p>
                        </div>
                    ) : (
                        <div className="table-responsive">
                            <table className="table table-hover align-middle mb-0">
                                <thead className="table-light">
                                    <tr>
                                        <th className="px-4 py-3" style={{ width: '80px' }}>Photo</th>
                                        <th className="py-3">Name</th>
                                        <th className="py-3">Role / Title</th>
                                        <th className="px-4 py-3 text-end">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {team.map((member) => (
                                        <tr key={member.id}>
                                            <td className="px-4 py-3">
                                                <div className="rounded-circle overflow-hidden shadow-sm" style={{ width: '45px', height: '45px', backgroundColor: '#e9ecef' }}>
                                                    {member.image_url ? (
                                                        <Image src={member.image_url} alt={member.name} width={45} height={45} className="w-100 h-100 object-fit-cover" unoptimized />
                                                    ) : (
                                                        <div className="w-100 h-100 d-flex align-items-center justify-content-center text-secondary">
                                                            <i className="fa-solid fa-user"></i>
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="py-3 fw-bold text-dark">{member.name}</td>
                                            <td className="py-3 text-muted">{member.role}</td>
                                            <td className="px-4 py-3 text-end">
                                                <div className="d-flex gap-2 justify-content-end">
                                                    <Link href={`/admin/team/edit/${member.id}`} className="btn btn-sm btn-light border" title="Edit">
                                                        <i className="fa-solid fa-pen text-primary"></i>
                                                    </Link>
                                                    <button onClick={() => deleteMember(member.id)} className="btn btn-sm btn-light border" title="Delete">
                                                        <i className="fa-solid fa-trash text-danger"></i>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
