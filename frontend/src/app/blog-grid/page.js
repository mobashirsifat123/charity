import React from 'react';
import HeaderOne from '@/components/HeaderOne';
import FooterOne from '@/components/FooterOne';
import BreadcrumbOne from '@/components/BreadcrumbOne';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';

// Server Component Fetch
async function getPublishedBlogs() {
    const { data, error } = await supabase
        .from('blogs')
        .select('*')
        .eq('status', 'published')
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching public blogs:', error);
        return [];
    }
    return data || [];
}

export default async function BlogGridPage() {
    const blogs = await getPublishedBlogs();

    return (
        <section className="page-wrapper bg-light min-vh-100">
            <HeaderOne />
            <BreadcrumbOne
                title="Our Blogs & Essays"
                links={[
                    { name: "Home", link: "/" },
                    { name: "Blogs", link: "/blog-grid" }
                ]}
            />

            <div className="container py-5 mt-4">
                <div className="row g-4 justify-content-center">
                    {blogs.length === 0 ? (
                        <div className="col-12 text-center py-5">
                            <i className="fa-solid fa-folder-open text-muted mb-3" style={{ fontSize: '3rem' }}></i>
                            <h4 className="fw-bold">No Blogs Found</h4>
                            <p className="text-muted">The administrators have not published any blogs yet. Check back soon!</p>
                        </div>
                    ) : (
                        blogs.map((blog) => (
                            <div key={blog.id} className="col-lg-4 col-md-6" data-aos="fade-up">
                                <div className="card border-0 shadow-sm rounded-4 h-100 overflow-hidden text-decoration-none">
                                    <div className="position-relative" style={{ height: '240px', backgroundColor: '#e9ecef' }}>
                                        {blog.image_url ? (
                                            <img 
                                                src={blog.image_url} 
                                                alt={blog.title} 
                                                className="w-100 h-100 object-fit-cover"
                                            />
                                        ) : (
                                            <div className="w-100 h-100 d-flex align-items-center justify-content-center bg-primary bg-opacity-10 text-primary">
                                                <i className="fa-solid fa-image" style={{ fontSize: '3rem' }}></i>
                                            </div>
                                        )}
                                        <div className="position-absolute top-0 end-0 m-3">
                                            <span className="badge bg-white text-primary rounded-pill shadow-sm px-3 py-2 fw-bold" suppressHydrationWarning>
                                                <i className="fa-regular fa-calendar me-1"></i>
                                                {new Date(blog.created_at).toLocaleDateString()}
                                            </span>
                                        </div>
                                    </div>
                                    
                                    <div className="card-body p-4 d-flex flex-column">
                                        <h4 className="card-title fw-bold mb-3 line-clamp-2">
                                            <Link href={`/blog-details/${blog.id}`} className="text-dark text-decoration-none hover-primary">
                                                {blog.title}
                                            </Link>
                                        </h4>
                                        <p className="card-text text-muted line-clamp-3 mb-4 flex-grow-1">
                                            {/* Extract first 150 chars of content as an excerpt safely */}
                                            {(blog.content || "").substring(0, 150)}...
                                        </p>
                                        <div className="mt-auto">
                                            <Link href={`/blog-details/${blog.id}`} className="btn btn-outline-primary rounded-pill fw-bold">
                                                Read More <i className="fa-solid fa-arrow-right ms-1"></i>
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            <FooterOne />
        </section>
    );
}
