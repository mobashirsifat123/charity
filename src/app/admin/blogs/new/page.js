"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import AdminGuard from '@/components/AdminGuard';
import HeaderOne from '@/components/HeaderOne';
import FooterOne from '@/components/FooterOne';
import BreadcrumbOne from '@/components/BreadcrumbOne';

function BlogEditorContent({ isEdit = false, blogId = null }) {
    const router = useRouter();
    const [loading, setLoading] = useState(isEdit);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    
    const [formData, setFormData] = useState({
        title: '',
        content: '',
        status: 'drafted',
        image_url: ''
    });

    useEffect(() => {
        if (isEdit && blogId) {
            fetchBlog();
        }
    }, [isEdit, blogId]);

    const fetchBlog = async () => {
        try {
            const { data, error } = await supabase
                .from('blogs')
                .select('*')
                .eq('id', blogId)
                .single();

            if (error) throw error;
            if (data) {
                setFormData({
                    title: data.title || '',
                    content: data.content || '',
                    status: data.status || 'drafted',
                    image_url: data.image_url || ''
                });
            }
        } catch (error) {
            console.error('Error fetching blog:', error);
            setMessage({ type: 'danger', text: 'Failed to load the blog post.' });
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
            // Get current user to set as author
            const { data: { user }, error: userError } = await supabase.auth.getUser();
            if (userError) throw userError;

            const blogPayload = {
                title: formData.title,
                content: formData.content,
                status: formData.status,
                image_url: formData.image_url,
                author_id: user.id
            };

            if (isEdit) {
                // Update
                const { error } = await supabase
                    .from('blogs')
                    .update(blogPayload)
                    .eq('id', blogId);
                
                if (error) throw error;
                setMessage({ type: 'success', text: 'Blog updated successfully!' });
            } else {
                // Insert
                const { error } = await supabase
                    .from('blogs')
                    .insert([blogPayload]);
                
                if (error) throw error;
                setMessage({ type: 'success', text: 'Blog created successfully!' });
                
                // Redirect back to list after short delay on create
                setTimeout(() => {
                    router.push('/admin/blogs');
                }, 1500);
            }
        } catch (error) {
            console.error('Error saving blog:', error);
            setMessage({ type: 'danger', text: error.message || 'Failed to save blog post.' });
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
                title={isEdit ? "Edit Blog Post" : "Write New Blog"}
                links={[
                    { name: "Admin Dashboard", link: "/admin/dashboard" },
                    { name: "Blogs", link: "/admin/blogs" },
                    { name: isEdit ? "Edit" : "New", link: "#" }
                ]}
            />

            <div className="container py-5">
                <div className="row justify-content-center">
                    <div className="col-lg-10">
                        <div className="card border-0 shadow-sm rounded-4">
                            <div className="card-header bg-white border-bottom p-4 d-flex justify-content-between align-items-center">
                                <h4 className="mb-0 fw-bold">
                                    <i className="fa-solid fa-pen-nib text-primary me-2"></i>
                                    {isEdit ? 'Edit Post Content' : 'Draft New Post'}
                                </h4>
                                <button type="button" onClick={() => router.push('/admin/blogs')} className="btn btn-light btn-sm fw-bold border">
                                    <i className="fa-solid fa-arrow-left me-1"></i> Back to List
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
                                    <div className="row mb-4">
                                        <div className="col-md-8 mb-3 mb-md-0">
                                            <label className="form-label fw-bold">Blog Title</label>
                                            <input 
                                                type="text" 
                                                className="form-control form-control-lg bg-light border-0" 
                                                name="title"
                                                value={formData.title}
                                                onChange={handleChange}
                                                placeholder="Enter a captivating title..."
                                                required
                                            />
                                        </div>
                                        <div className="col-md-4">
                                            <label className="form-label fw-bold">Publish Status</label>
                                            <select 
                                                className="form-select form-select-lg bg-light border-0" 
                                                name="status"
                                                value={formData.status}
                                                onChange={handleChange}
                                            >
                                                <option value="drafted">Draft (Hidden)</option>
                                                <option value="published">Published (Public)</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="mb-4">
                                        <label className="form-label fw-bold">Feature Image URL <span className="text-muted fw-normal">(Optional)</span></label>
                                        <input 
                                            type="url" 
                                            className="form-control bg-light border-0" 
                                            name="image_url"
                                            value={formData.image_url}
                                            onChange={handleChange}
                                            placeholder="https://example.com/image.jpg"
                                        />
                                        <small className="text-muted mt-1 d-block">Provide an external URL for the cover image.</small>
                                    </div>

                                    <div className="mb-4">
                                        <label className="form-label fw-bold d-flex justify-content-between">
                                            <span>Blog Content (Essays / Paragraphs)</span>
                                            <small className="text-primary fw-normal"><i className="fa-brands fa-markdown me-1"></i> Supports Markdown/HTML</small>
                                        </label>
                                        <textarea 
                                            className="form-control bg-light border-0" 
                                            name="content"
                                            rows="15"
                                            value={formData.content}
                                            onChange={handleChange}
                                            placeholder="Start writing your essay here... Separate paragraphs with a blank line."
                                            required
                                            style={{ fontFamily: 'monospace' }}
                                        ></textarea>
                                    </div>

                                    <div className="mt-5 d-flex gap-3">
                                        <button 
                                            type="submit" 
                                            className="btn btn-primary btn-lg px-5 fw-bold w-100"
                                            disabled={saving}
                                        >
                                            {saving ? (
                                                <><span className="spinner-border spinner-border-sm me-2"></span>Saving...</>
                                            ) : (
                                                <><i className="fa-solid fa-cloud-arrow-up me-2"></i> {isEdit ? 'Save Changes' : 'Publish Blog'}</>
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

export default function BlogEditorPage({ params }) {
    // If params.id exists, we are in Edit mode. Otherwise New mode.
    const isEdit = !!params?.id;
    
    return (
        <AdminGuard>
            <BlogEditorContent isEdit={isEdit} blogId={params?.id} />
        </AdminGuard>
    );
}
