"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';
import HeaderOne from '@/components/HeaderOne';
import FooterOne from '@/components/FooterOne';
import BreadcrumbOne from '@/components/BreadcrumbOne';
import AdminGuard from '@/components/AdminGuard';

function AdminTeamContent() {
    const [team, setTeam] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchTeam();
    }, []);

    const fetchTeam = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('team_members')
                .select('*')
                .order('sort_order', { ascending: true })
                .order('created_at', { ascending: false });

            if (error) throw error;
            setTeam(data || []);
        } catch (error) {
            console.error('Error fetching team:', error);
        } finally {
            setLoading(false);
        }
    };

    const deleteMember = async (id) => {
        if (!window.confirm('Are you sure you want to remove this team member?')) return;
        
        try {
            const { error } = await supabase.from('team_members').delete().eq('id', id);
            if (error) throw error;
            
            setTeam(team.filter(member => member.id !== id));
        } catch (error) {
            console.error('Error deleting member:', error);
            alert('Failed to remove the team member.');
        }
    };

    return (
        <section className="page-wrapper bg-light min-vh-100">
            <HeaderOne />
            <BreadcrumbOne
                title="Manage Team Members"
                links={[
                    { name: "Admin Dashboard", link: "/admin/dashboard" },
                    { name: "Team", link: "/admin/team" }
                ]}
            />

            <div className="container py-5">
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <h3 className="mb-0 fw-bold">Changemakers Roster</h3>
                    <Link href="/admin/team/new" className="btn btn-primary fw-bold">
                        <i className="fa-solid fa-plus me-2"></i> Add Team Member
                    </Link>
                </div>

                <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
                    <div className="card-body p-0">
                        {loading ? (
                            <div className="text-center py-5">
                                <div className="spinner-border text-primary" role="status"></div>
                                <p className="mt-2 text-muted">Loading team...</p>
                            </div>
                        ) : team.length === 0 ? (
                            <div className="text-center py-5">
                                <i className="fa-solid fa-users-viewfinder text-muted mb-3" style={{ fontSize: '3rem' }}></i>
                                <h5 className="fw-bold">No Team Members Found</h5>
                                <p className="text-muted">You haven't added any team members yet.</p>
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
                                                            <img src={member.image_url} alt={member.name} className="w-100 h-100 object-fit-cover" />
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
                                                        <button 
                                                            onClick={() => deleteMember(member.id)}
                                                            className="btn btn-sm btn-light border" 
                                                            title="Delete"
                                                        >
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
            <FooterOne />
        </section>
    );
}

export default function AdminTeamPage() {
    return (
        <AdminGuard>
            <AdminTeamContent />
        </AdminGuard>
    );
}
