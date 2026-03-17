import React from 'react';
import { notFound } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import HeaderOne from '@/components/HeaderOne';
import FooterOne from '@/components/FooterOne';
import BreadcrumbOne from '@/components/BreadcrumbOne';

export const revalidate = 60; // Revalidate page every 60 seconds

async function getBlogData(id) {
    const { data, error } = await supabase
        .from('blogs')
        .select(`
            *,
            users:author_id(name)
        `)
        .eq('id', id)
        .eq('status', 'published')
        .single();

    if (error || !data) {
        return null;
    }
    return data;
}

export default async function BlogDetailsPage({ params }) {
    const blog = await getBlogData(params.id);

    if (!blog) {
        notFound();
    }

    return (
        <section className="page-wrapper bg-light min-vh-100">
            <HeaderOne />
            <BreadcrumbOne
                title="Blog Details"
                links={[
                    { name: "Home", link: "/" },
                    { name: "Blogs", link: "/blog-grid" },
                    { name: "Details", link: "#" }
                ]}
            />

            <div className="container py-5 mt-4">
                <div className="row justify-content-center">
                    <div className="col-lg-8">
                        <article className="bg-white p-4 p-md-5 rounded-4 shadow-sm">
                            {/* Meta Data */}
                            <div className="d-flex align-items-center gap-3 mb-4 text-muted">
                                <span>
                                    <i className="fa-solid fa-user text-primary me-2"></i>
                                    {blog.users?.name || 'Administrator'}
                                </span>
                                <span>•</span>
                                <span>
                                    <i className="fa-regular fa-calendar text-primary me-2"></i>
                                    {new Date(blog.created_at).toLocaleDateString('en-US', {
                                        year: 'numeric', month: 'long', day: 'numeric'
                                    })}
                                </span>
                            </div>

                            {/* Title */}
                            <h1 className="fw-bold mb-4" style={{ fontSize: 'clamp(2rem, 4vw, 3rem)' }}>
                                {blog.title}
                            </h1>

                            {/* Feature Image */}
                            {blog.image_url && (
                                <div className="mb-5 rounded-4 overflow-hidden shadow-sm">
                                    <img 
                                        src={blog.image_url} 
                                        alt={blog.title} 
                                        className="w-100 img-fluid object-fit-cover"
                                        style={{ maxHeight: '500px' }}
                                    />
                                </div>
                            )}

                            {/* Content Block */}
                            <div 
                                className="blog-content fs-5" 
                                style={{ lineHeight: '1.8', color: '#4a5568' }}
                            >
                                {/* Very basic conversion from linebreaks to paragraphs since we accept text/markdown format. For a real app, use a markdown parser library like 'react-markdown' */}
                                {(blog.content || "").split('\n').map((paragraph, index) => {
                                    if (!paragraph.trim()) return <br key={index} />;
                                    return <p key={index} className="mb-4">{paragraph}</p>;
                                })}
                            </div>

                            {/* Share & Tags Bottom Row */}
                            <div className="d-flex justify-content-between align-items-center mt-5 pt-4 border-top">
                                <div className="d-flex gap-2">
                                    <span className="badge bg-light text-dark px-3 py-2 rounded-pill">Community</span>
                                    <span className="badge bg-light text-dark px-3 py-2 rounded-pill">Impact</span>
                                </div>
                                <div className="d-flex gap-3 social-share">
                                    <span className="fw-bold text-muted me-2">Share:</span>
                                    <a href="#" className="text-secondary hover-primary"><i className="fa-brands fa-facebook-f"></i></a>
                                    <a href="#" className="text-secondary hover-info"><i className="fa-brands fa-twitter"></i></a>
                                    <a href="#" className="text-secondary hover-dark"><i className="fa-brands fa-linkedin-in"></i></a>
                                </div>
                            </div>
                        </article>
                    </div>
                </div>
            </div>

            <FooterOne />
        </section>
    );
}
