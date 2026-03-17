"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';
import HeaderOne from '@/components/HeaderOne';
import FooterOne from '@/components/FooterOne';
import BreadcrumbOne from '@/components/BreadcrumbOne';
import AdminGuard from '@/components/AdminGuard';

function AdminBlogsContent() {
    const [blogs, setBlogs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchBlogs();
    }, []);

    const fetchBlogs = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('blogs')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setBlogs(data || []);
        } catch (error) {
            console.error('Error fetching blogs:', error);
        } finally {
            setLoading(false);
        }
    };

    const deleteBlog = async (id) => {
        if (!window.confirm('Are you sure you want to delete this blog post?')) return;
        
        try {
            const { error } = await supabase.from('blogs').delete().eq('id', id);
            if (error) throw error;
            
            // Remove from state
            setBlogs(blogs.filter(blog => blog.id !== id));
        } catch (error) {
            console.error('Error deleting blog:', error);
            alert('Failed to delete the blog post.');
        }
    };

    return (
        <section className="page-wrapper bg-light min-vh-100">
            <HeaderOne />
            <BreadcrumbOne
                title="Manage Blogs"
                links={[
                    { name: "Admin Dashboard", link: "/admin/dashboard" },
                    { name: "Blogs", link: "/admin/blogs" }
                ]}
            />

            <div className="container py-5">
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <h3 className="mb-0 fw-bold">All Blog Posts</h3>
                    <Link href="/admin/blogs/new" className="btn btn-primary fw-bold">
                        <i className="fa-solid fa-plus me-2"></i> Write New Blog
                    </Link>
                </div>

                <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
                    <div className="card-body p-0">
                        {loading ? (
                            <div className="text-center py-5">
                                <div className="spinner-border text-primary" role="status"></div>
                                <p className="mt-2 text-muted">Loading posts...</p>
                            </div>
                        ) : blogs.length === 0 ? (
                            <div className="text-center py-5">
                                <i className="fa-regular fa-folder-open text-muted mb-3" style={{ fontSize: '3rem' }}></i>
                                <h5 className="fw-bold">No Blogs Found</h5>
                                <p className="text-muted">You haven't written any blog posts yet. Click the button above to start.</p>
                            </div>
                        ) : (
                            <div className="table-responsive">
                                <table className="table table-hover align-middle mb-0">
                                    <thead className="table-light">
                                        <tr>
                                            <th className="px-4 py-3">Title</th>
                                            <th className="py-3">Status</th>
                                            <th className="py-3">Date Created</th>
                                            <th className="px-4 py-3 text-end">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {blogs.map((blog) => (
                                            <tr key={blog.id}>
                                                <td className="px-4 py-3 fw-medium">{blog.title}</td>
                                                <td className="py-3">
                                                    <span className={`badge bg-${blog.status === 'published' ? 'success' : 'warning text-dark'} bg-opacity-10 text-${blog.status === 'published' ? 'success' : 'warning text-dark'} rounded-pill px-3`}>
                                                        {blog.status}
                                                    </span>
                                                </td>
                                                <td className="py-3 text-muted">
                                                    {new Date(blog.created_at).toLocaleDateString()}
                                                </td>
                                                <td className="px-4 py-3 text-end">
                                                    <div className="d-flex gap-2 justify-content-end">
                                                        <Link href={`/admin/blogs/edit/${blog.id}`} className="btn btn-sm btn-light border" title="Edit">
                                                            <i className="fa-solid fa-pen text-primary"></i>
                                                        </Link>
                                                        <button 
                                                            onClick={() => deleteBlog(blog.id)}
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

export default function AdminBlogsPage() {
    return (
        <AdminGuard>
            <AdminBlogsContent />
        </AdminGuard>
    );
}
