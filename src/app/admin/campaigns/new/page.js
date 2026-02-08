"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/utils/api';
import HeaderOne from '@/components/HeaderOne';
import FooterOne from '@/components/FooterOne';
import BreadcrumbOne from '@/components/BreadcrumbOne';
import AdminGuard from '@/components/AdminGuard';
import ImageUploader from '@/components/ImageUploader';

const CATEGORIES = ['Education', 'Medical', 'Crisis', 'Environment', 'Community'];

function CreateCampaignForm() {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        goal_amount: '',
        image_url: '',
        category: '',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const router = useRouter();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        // Validate
        if (!formData.title.trim()) {
            setError('Title is required');
            setLoading(false);
            return;
        }

        if (!formData.goal_amount || parseFloat(formData.goal_amount) <= 0) {
            setError('Please enter a valid goal amount');
            setLoading(false);
            return;
        }

        try {
            const response = await api.post('/campaigns', {
                title: formData.title.trim(),
                description: formData.description.trim(),
                goal_amount: parseFloat(formData.goal_amount),
                image_url: formData.image_url.trim() || null,
                category: formData.category || null,
            });

            if (response.data.success) {
                setSuccess(true);
                setFormData({ title: '', description: '', goal_amount: '', image_url: '', category: '' });

                // Redirect to admin dashboard after delay
                setTimeout(() => {
                    router.push('/admin/dashboard');
                }, 2000);
            } else {
                setError(response.data.message || 'Failed to create campaign');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'An error occurred while creating the campaign');
        } finally {
            setLoading(false);
        }
    };

    return (
        <section className="page-wrapper">
            <HeaderOne />
            <BreadcrumbOne
                title="Create Campaign"
                links={[
                    { name: "Home", link: "/" },
                    { name: "Admin", link: "/admin/dashboard" },
                    { name: "Create Campaign", link: "/admin/create-campaign" }
                ]}
            />

            <div className="container py-5">
                <div className="row justify-content-center">
                    <div className="col-lg-8 col-md-10">
                        <div className="card border-0 shadow-lg rounded-4">
                            <div className="card-header bg-primary text-white p-4 rounded-top-4">
                                <h4 className="mb-0 fw-bold">
                                    <i className="fa-solid fa-plus-circle me-2"></i>
                                    Create New Campaign
                                </h4>
                                <p className="mb-0 opacity-75 small">
                                    Launch a new fundraising campaign
                                </p>
                            </div>

                            <div className="card-body p-4">
                                {success ? (
                                    <div className="text-center py-5">
                                        <div className="mb-4">
                                            <i className="fa-solid fa-circle-check text-success" style={{ fontSize: '5rem' }}></i>
                                        </div>
                                        <h3 className="text-success fw-bold">Campaign Created!</h3>
                                        <p className="text-muted">
                                            Your campaign is now live. Redirecting to dashboard...
                                        </p>
                                    </div>
                                ) : (
                                    <form onSubmit={handleSubmit}>
                                        {error && (
                                            <div className="alert alert-danger" role="alert">
                                                <i className="fa-solid fa-circle-exclamation me-2"></i>
                                                {error}
                                            </div>
                                        )}

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
                                            <label htmlFor="description" className="form-label fw-semibold">
                                                Description
                                            </label>
                                            <textarea
                                                className="form-control"
                                                id="description"
                                                name="description"
                                                rows="4"
                                                placeholder="Describe the campaign's mission, goals, and how donations will be used..."
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
                                                <label htmlFor="category" className="form-label fw-semibold">
                                                    Category
                                                </label>
                                                <select
                                                    className="form-select form-select-lg"
                                                    id="category"
                                                    name="category"
                                                    value={formData.category}
                                                    onChange={handleChange}
                                                >
                                                    <option value="">Select a category</option>
                                                    {CATEGORIES.map(cat => (
                                                        <option key={cat} value={cat}>{cat}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>

                                        <div className="mb-4">
                                            <label className="form-label fw-semibold">
                                                Campaign Image
                                            </label>
                                            <ImageUploader
                                                value={formData.image_url}
                                                onChange={(url) => setFormData(prev => ({ ...prev, image_url: url }))}
                                                placeholder="Click or drag to upload image"
                                            />
                                        </div>

                                        <div className="d-flex gap-3 mt-4">
                                            <button
                                                type="submit"
                                                className="btn btn-primary btn-lg px-5"
                                                disabled={loading}
                                            >
                                                {loading ? (
                                                    <>
                                                        <span className="spinner-border spinner-border-sm me-2"></span>
                                                        Creating...
                                                    </>
                                                ) : (
                                                    <>
                                                        <i className="fa-solid fa-rocket me-2"></i>
                                                        Launch Campaign
                                                    </>
                                                )}
                                            </button>
                                            <Link href="/admin/dashboard" className="btn btn-outline-secondary btn-lg">
                                                Cancel
                                            </Link>
                                        </div>
                                    </form>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <FooterOne />
        </section>
    );
}

export default function CreateCampaignPage() {
    return (
        <AdminGuard>
            <CreateCampaignForm />
        </AdminGuard>
    );
}
