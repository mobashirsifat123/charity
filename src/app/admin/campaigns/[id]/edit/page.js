"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { adminFetchJson } from '@/lib/adminApi';
import ImageUploader from '@/components/ImageUploader';

const CATEGORIES = ['Education', 'Medical', 'Crisis', 'Environment', 'Community'];

function EditCampaignForm() {
    const params = useParams();
    const router = useRouter();
    const campaignId = params.id;

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        goal_amount: '',
        image_url: '',
        category: '',
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [notFound, setNotFound] = useState(false);

    useEffect(() => {
        const fetchCampaign = async () => {
            try {
                setLoading(true);
                setError('');

                const result = await adminFetchJson(`/api/admin/resources/campaigns/${campaignId}`);
                const campaign = result.data;

                if (campaign) {
                    setFormData({
                        title: campaign.title || '',
                        description: campaign.description || '',
                        goal_amount: campaign.goal_amount?.toString() || '',
                        image_url: campaign.image_url || '',
                        category: campaign.category || '',
                    });
                }
            } catch (err) {
                if (String(err.message || '').toLowerCase().includes('not found')) {
                    setNotFound(true);
                } else {
                    setError(err.message || 'Failed to load campaign');
                }
            } finally {
                setLoading(false);
            }
        };

        if (campaignId) {
            fetchCampaign();
        }
    }, [campaignId]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSaving(true);

        if (!formData.title.trim()) {
            setError('Title is required');
            setSaving(false);
            return;
        }

        if (!formData.goal_amount || parseFloat(formData.goal_amount) <= 0) {
            setError('Please enter a valid goal amount');
            setSaving(false);
            return;
        }

        try {
            await adminFetchJson(`/api/admin/resources/campaigns/${campaignId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    payload: {
                        title: formData.title.trim(),
                        description: formData.description.trim(),
                        goal_amount: parseFloat(formData.goal_amount),
                        image_url: formData.image_url.trim() || null,
                        category: formData.category || null,
                    },
                }),
            });

            setSuccess(true);
            setTimeout(() => {
                router.push('/admin/campaigns');
            }, 1200);
        } catch (err) {
            setError(err.message || 'An error occurred while updating the campaign');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="py-5 text-center">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
                <p className="text-muted mt-3 mb-0">Loading campaign...</p>
            </div>
        );
    }

    if (notFound) {
        return (
            <div className="card border-0 shadow-sm rounded-4">
                <div className="card-body text-center py-5">
                    <i className="fa-solid fa-circle-exclamation text-danger mb-3" style={{ fontSize: '4rem' }}></i>
                    <h3 className="fw-bold">Campaign Not Found</h3>
                    <p className="text-muted">The campaign you are looking for does not exist.</p>
                    <Link href="/admin/campaigns" className="btn btn-primary rounded-pill px-4">
                        Back to Campaigns
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="d-flex flex-column gap-4">
            <div className="d-flex flex-column flex-lg-row justify-content-between align-items-lg-center gap-3">
                <div>
                    <h2 className="fw-bold mb-1">
                        <i className="fa-solid fa-pencil text-primary me-2"></i>
                        Edit Campaign
                    </h2>
                    <p className="text-muted mb-0">Update the public details, funding goal, and media for this campaign.</p>
                </div>
                <Link href="/admin/campaigns" className="btn btn-outline-secondary rounded-pill px-4 align-self-start align-self-lg-center">
                    Back to Campaigns
                </Link>
            </div>

            <div className="card border-0 shadow-sm rounded-4">
                <div className="card-body p-4 p-md-5">
                    {success ? (
                        <div className="text-center py-5">
                            <i className="fa-solid fa-circle-check text-success mb-4" style={{ fontSize: '5rem' }}></i>
                            <h3 className="text-success fw-bold">Campaign Updated!</h3>
                            <p className="text-muted mb-0">Redirecting to the campaign manager...</p>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit}>
                            {error ? (
                                <div className="alert alert-danger" role="alert">
                                    <i className="fa-solid fa-circle-exclamation me-2"></i>
                                    {error}
                                </div>
                            ) : null}

                            <div className="mb-4">
                                <label htmlFor="title" className="form-label fw-semibold">
                                    Campaign Title <span className="text-danger">*</span>
                                </label>
                                <input
                                    type="text"
                                    className="form-control form-control-lg"
                                    id="title"
                                    name="title"
                                    placeholder="e.g., Help Children Access Education"
                                    value={formData.title}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="mb-4">
                                <label htmlFor="description" className="form-label fw-semibold">Description</label>
                                <textarea
                                    className="form-control"
                                    id="description"
                                    name="description"
                                    rows="4"
                                    placeholder="Describe the campaign's mission..."
                                    value={formData.description}
                                    onChange={handleChange}
                                ></textarea>
                            </div>

                            <div className="row">
                                <div className="col-md-6 mb-4">
                                    <label htmlFor="goal_amount" className="form-label fw-semibold">
                                        Fundraising Goal ($) <span className="text-danger">*</span>
                                    </label>
                                    <div className="input-group input-group-lg">
                                        <span className="input-group-text">$</span>
                                        <input
                                            type="number"
                                            className="form-control"
                                            id="goal_amount"
                                            name="goal_amount"
                                            placeholder="10000"
                                            min="1"
                                            step="0.01"
                                            value={formData.goal_amount}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="col-md-6 mb-4">
                                    <label htmlFor="category" className="form-label fw-semibold">Category</label>
                                    <select
                                        className="form-select form-select-lg"
                                        id="category"
                                        name="category"
                                        value={formData.category}
                                        onChange={handleChange}
                                    >
                                        <option value="">Select a category</option>
                                        {CATEGORIES.map((category) => (
                                            <option key={category} value={category}>{category}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="mb-4">
                                <label className="form-label fw-semibold">Campaign Image</label>
                                <ImageUploader
                                    value={formData.image_url}
                                    onChange={(url) => setFormData((prev) => ({ ...prev, image_url: url }))}
                                    placeholder="Click or drag to upload image"
                                />
                            </div>

                            <div className="d-flex gap-3 mt-4">
                                <button type="submit" className="btn btn-primary btn-lg px-5 rounded-pill" disabled={saving}>
                                    {saving ? (
                                        <>
                                            <span className="spinner-border spinner-border-sm me-2"></span>
                                            Saving...
                                        </>
                                    ) : (
                                        <>
                                            <i className="fa-solid fa-save me-2"></i>
                                            Save Changes
                                        </>
                                    )}
                                </button>
                                <Link href="/admin/campaigns" className="btn btn-outline-secondary btn-lg rounded-pill px-4">
                                    Cancel
                                </Link>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}

export default function EditCampaignPage() {
    return <EditCampaignForm />;
}
