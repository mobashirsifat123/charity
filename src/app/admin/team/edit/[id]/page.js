"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { adminFetchJson } from '@/lib/adminApi';

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
        sort_order: 0,
    });

    useEffect(() => {
        const fetchMember = async () => {
            try {
                const result = await adminFetchJson(`/api/admin/resources/team/${memberId}`);
                const data = result.data;
                if (data) {
                    setFormData({
                        name: data.name || '',
                        role: data.role || '',
                        image_url: data.image_url || '',
                        twitter_url: data.twitter_url || '',
                        linkedin_url: data.linkedin_url || '',
                        sort_order: data.sort_order || 0,
                    });
                }
            } catch (error) {
                console.error('Error fetching member:', error);
                setMessage({ type: 'danger', text: 'Failed to load the team member.' });
            } finally {
                setLoading(false);
            }
        };

        if (isEdit && memberId) {
            fetchMember();
        }
    }, [isEdit, memberId]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
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
                sort_order: parseInt(formData.sort_order) || 0,
            };

            if (isEdit) {
                await adminFetchJson(`/api/admin/resources/team/${memberId}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ payload: memberPayload }),
                });
                setMessage({ type: 'success', text: 'Team member updated successfully!' });
            } else {
                await adminFetchJson('/api/admin/resources/team', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ payload: memberPayload }),
                });
                setMessage({ type: 'success', text: 'Team member added successfully!' });

                setTimeout(() => {
                    router.push('/admin/team');
                }, 1200);
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
            <div className="py-5 text-center">
                <div className="spinner-border text-primary" role="status"></div>
                <p className="text-muted mt-3 mb-0">Loading member details...</p>
            </div>
        );
    }

    return (
        <div className="d-flex flex-column gap-4">
            <div className="d-flex flex-column flex-lg-row justify-content-between align-items-lg-center gap-3">
                <div>
                    <h2 className="fw-bold mb-1">
                        <i className="fa-solid fa-user-tie text-primary me-2"></i>
                        {isEdit ? 'Edit Team Member' : 'Add Team Member'}
                    </h2>
                    <p className="text-muted mb-0">Update the team profile, role, links, and display priority shown on the public website.</p>
                </div>
                <button type="button" onClick={() => router.push('/admin/team')} className="btn btn-outline-secondary rounded-pill px-4 align-self-start align-self-lg-center">
                    Back to Team
                </button>
            </div>

            <div className="card border-0 shadow-sm rounded-4">
                <div className="card-body p-4 p-md-5">
                    {message.text ? (
                        <div className={`alert alert-${message.type} alert-dismissible fade show`} role="alert">
                            {message.text}
                            <button type="button" className="btn-close" onClick={() => setMessage({ type: '', text: '' })}></button>
                        </div>
                    ) : null}

                    <form onSubmit={handleSubmit}>
                        <div className="text-center mb-5">
                            <div className="rounded-circle overflow-hidden shadow mx-auto mb-3" style={{ width: '120px', height: '120px', backgroundColor: '#e9ecef', border: '4px solid white' }}>
                                {formData.image_url ? (
                                    <Image src={formData.image_url} alt="Preview" width={120} height={120} className="w-100 h-100 object-fit-cover" unoptimized />
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

                        <div className="d-flex gap-3">
                            <button type="submit" className="btn btn-primary btn-lg px-5 fw-bold rounded-pill" disabled={saving}>
                                {saving ? (
                                    <><span className="spinner-border spinner-border-sm me-2"></span>Saving...</>
                                ) : (
                                    <><i className="fa-solid fa-cloud-arrow-up me-2"></i>{isEdit ? 'Save Changes' : 'Add Team Member'}</>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default function TeamEditorPage({ params }) {
    const isEdit = !!params?.id;
    return <TeamEditorContent isEdit={isEdit} memberId={params?.id} />;
}
