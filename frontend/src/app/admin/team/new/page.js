"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import AdminGuard from '@/components/AdminGuard';
import HeaderOne from '@/components/HeaderOne';
import FooterOne from '@/components/FooterOne';
import BreadcrumbOne from '@/components/BreadcrumbOne';

function TeamEditorContent({ isEdit = false, memberId = null }) {
    const router = useRouter();
    const [loading, setLoading] = useState(isEdit);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    
    const [formData, setFormData] = useState({
        name: '',
        role: '',
        image_url: '',
        twitter_url: '',
        linkedin_url: '',
        sort_order: 0
    });

    useEffect(() => {
        if (isEdit && memberId) {
            fetchMember();
        }
    }, [isEdit, memberId]);

    const fetchMember = async () => {
        try {
            const { data, error } = await supabase
                .from('team_members')
                .select('*')
                .eq('id', memberId)
                .single();

            if (error) throw error;
            if (data) {
                setFormData({
                    name: data.name || '',
                    role: data.role || '',
                    image_url: data.image_url || '',
                    twitter_url: data.twitter_url || '',
                    linkedin_url: data.linkedin_url || '',
                    sort_order: data.sort_order || 0
                });
            }
        } catch (error) {
            console.error('Error fetching member:', error);
            setMessage({ type: 'danger', text: 'Failed to load the team member.' });
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setMessage({ type: '', text: '' });

        try {
            const memberPayload = {
                name: formData.name,
                role: formData.role,
                image_url: formData.image_url,
                twitter_url: formData.twitter_url,
                linkedin_url: formData.linkedin_url,
                sort_order: parseInt(formData.sort_order) || 0
            };

            if (isEdit) {
                const { error } = await supabase
                    .from('team_members')
                    .update(memberPayload)
                    .eq('id', memberId);
                
                if (error) throw error;
                setMessage({ type: 'success', text: 'Team member updated successfully!' });
            } else {
                const { error } = await supabase
                    .from('team_members')
                    .insert([memberPayload]);
                
                if (error) throw error;
                setMessage({ type: 'success', text: 'Team member added successfully!' });
                
                setTimeout(() => {
                    router.push('/admin/team');
                }, 1500);
            }
        } catch (error) {
            console.error('Error saving member:', error);
            setMessage({ type: 'danger', text: error.message || 'Failed to save team member.' });
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <section className="page-wrapper bg-light min-vh-100 d-flex flex-column">
                <HeaderOne />
                <div className="flex-grow-1 d-flex justify-content-center align-items-center">
                    <div className="spinner-border text-primary" role="status"></div>
                </div>
                <FooterOne />
            </section>
        );
    }

    return (
        <section className="page-wrapper bg-light min-vh-100">
            <HeaderOne />
            <BreadcrumbOne
                title={isEdit ? "Edit Team Member" : "Add Team Member"}
                links={[
                    { name: "Admin Dashboard", link: "/admin/dashboard" },
                    { name: "Team", link: "/admin/team" },
                    { name: isEdit ? "Edit" : "New", link: "#" }
                ]}
            />

            <div className="container py-5">
                <div className="row justify-content-center">
                    <div className="col-lg-8">
                        <div className="card border-0 shadow-sm rounded-4">
                            <div className="card-header bg-white border-bottom p-4 d-flex justify-content-between align-items-center">
                                <h4 className="mb-0 fw-bold">
                                    <i className="fa-solid fa-user-tie text-primary me-2"></i>
                                    {isEdit ? 'Edit Member Details' : 'New Member Profile'}
                                </h4>
                                <button type="button" onClick={() => router.push('/admin/team')} className="btn btn-light btn-sm fw-bold border">
                                    <i className="fa-solid fa-arrow-left me-1"></i> Back to Roster
                                </button>
                            </div>
                            
                            <div className="card-body p-4 p-md-5">
                                {message.text && (
                                    <div className={`alert alert-${message.type} alert-dismissible fade show`} role="alert">
                                        {message.text}
                                        <button type="button" className="btn-close" onClick={() => setMessage({type: '', text: ''})}></button>
                                    </div>
                                )}

                                <form onSubmit={handleSubmit}>
                                    {/* Preview Photo */}
                                    <div className="text-center mb-5">
                                        <div 
                                            className="rounded-circle overflow-hidden shadow mx-auto mb-3" 
                                            style={{ width: '120px', height: '120px', backgroundColor: '#e9ecef', border: '4px solid white' }}
                                        >
                                            {formData.image_url ? (
                                                <img src={formData.image_url} alt="Preview" className="w-100 h-100 object-fit-cover" />
                                            ) : (
                                                <div className="w-100 h-100 d-flex align-items-center justify-content-center bg-light text-secondary">
                                                    <i className="fa-solid fa-image fa-2x"></i>
                                                </div>
                                            )}
                                        </div>
                                        <span className="badge bg-primary bg-opacity-10 text-primary px-3 py-2 rounded-pill">Profile Photo Preview</span>
                                    </div>

                                    <div className="row g-4 mb-4">
                                        <div className="col-md-6">
                                            <label className="form-label fw-bold">Full Name</label>
                                            <input 
                                                type="text" 
                                                className="form-control form-control-lg bg-light border-0" 
                                                name="name"
                                                value={formData.name}
                                                onChange={handleChange}
                                                placeholder="e.g. Sarah Jenkins"
                                                required
                                            />
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label fw-bold">Job Role / Title</label>
                                            <input 
                                                type="text" 
                                                className="form-control form-control-lg bg-light border-0" 
                                                name="role"
                                                value={formData.role}
                                                onChange={handleChange}
                                                placeholder="e.g. Executive Director"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="mb-4">
                                        <label className="form-label fw-bold">Profile Image URL</label>
                                        <input 
                                            type="url" 
                                            className="form-control form-control-lg bg-light border-0" 
                                            name="image_url"
                                            value={formData.image_url}
                                            onChange={handleChange}
                                            placeholder="https://example.com/photo.jpg"
                                        />
                                        <small className="text-muted mt-2 d-block">Provide a direct link to an image. Square images work best.</small>
                                    </div>

                                    <div className="row g-4 mb-4">
                                        <div className="col-md-6">
                                            <label className="form-label fw-bold"><i className="fa-brands fa-twitter text-info me-2"></i>Twitter URL</label>
                                            <input 
                                                type="url" 
                                                className="form-control bg-light border-0" 
                                                name="twitter_url"
                                                value={formData.twitter_url}
                                                onChange={handleChange}
                                                placeholder="https://twitter.com/username"
                                            />
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label fw-bold"><i className="fa-brands fa-linkedin text-primary me-2"></i>LinkedIn URL</label>
                                            <input 
                                                type="url" 
                                                className="form-control bg-light border-0" 
                                                name="linkedin_url"
                                                value={formData.linkedin_url}
                                                onChange={handleChange}
                                                placeholder="https://linkedin.com/in/username"
                                            />
                                        </div>
                                    </div>
                                    
                                    <div className="mb-5">
                                        <label className="form-label fw-bold">Display Priority (Sort Order)</label>
                                        <input 
                                            type="number" 
                                            className="form-control bg-light border-0 w-25" 
                                            name="sort_order"
                                            value={formData.sort_order}
                                            onChange={handleChange}
                                        />
                                        <small className="text-muted mt-2 d-block">Lower numbers appear first on the website (e.g. 1, 2, 3).</small>
                                    </div>

                                    <div className="mt-4 d-flex gap-3">
                                        <button 
                                            type="submit" 
                                            className="btn btn-primary btn-lg px-5 fw-bold w-100"
                                            disabled={saving}
                                        >
                                            {saving ? (
                                                <><span className="spinner-border spinner-border-sm me-2"></span>Saving...</>
                                            ) : (
                                                <><i className="fa-solid fa-cloud-arrow-up me-2"></i> {isEdit ? 'Save Changes' : 'Add Team Member'}</>
                                            )}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <FooterOne />
        </section>
    );
}

export default function TeamEditorPage({ params }) {
    const isEdit = !!params?.id;
    return (
        <AdminGuard>
            <TeamEditorContent isEdit={isEdit} memberId={params?.id} />
        </AdminGuard>
    );
}
