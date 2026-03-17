import React from 'react';
import { notFound } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import HeaderOne from '@/components/HeaderOne';
import FooterOne from '@/components/FooterOne';
import BreadcrumbOne from '@/components/BreadcrumbOne';

export const revalidate = 60;

async function getFatwaData(id) {
    const { data, error } = await supabase
        .from('fatwas')
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

export default async function FatwaDetailsPage({ params }) {
    const fatwa = await getFatwaData(params.id);

    if (!fatwa) {
        notFound();
    }

    return (
        <section className="page-wrapper bg-light min-vh-100">
            <HeaderOne />
            <BreadcrumbOne
                title="Ruling Details"
                links={[
                    { name: "Home", link: "/" },
                    { name: "Fatwa", link: "/fatwa" },
                    { name: "Details", link: "#" }
                ]}
            />

            <div className="container py-5 mt-4">
                <div className="row justify-content-center">
                    <div className="col-lg-8">
                        <article className="bg-white p-4 p-md-5 rounded-4 shadow-sm">
                            {/* Meta Data */}
                            <div className="d-flex align-items-center gap-3 mb-4 text-muted border-bottom pb-4">
                                <span className="badge bg-primary bg-opacity-10 text-primary px-3 py-2 rounded-pill fw-bold">Islamic Ruling</span>
                                <span>
                                    <i className="fa-solid fa-user text-primary me-2"></i>
                                    {fatwa.users?.name || 'Scholar Panel'}
                                </span>
                                <span>•</span>
                                <span>
                                    <i className="fa-regular fa-calendar text-primary me-2"></i>
                                    {new Date(fatwa.created_at).toLocaleDateString('en-US', {
                                        year: 'numeric', month: 'long', day: 'numeric'
                                    })}
                                </span>
                            </div>

                            {/* Title / Question */}
                            <h2 className="fw-bold mb-5" style={{ color: '#2d3748', lineHeight: '1.4' }}>
                                <span className="text-primary me-3 fs-1">Q.</span>
                                {fatwa.title}
                            </h2>

                            {/* Answer Block */}
                            <div className="bg-light p-4 rounded-4 mb-4 border border-opacity-50 border-primary">
                                <h4 className="fw-bold mb-4 text-primary d-flex align-items-center">
                                    <i className="fa-solid fa-quote-left me-3 opacity-50"></i>
                                    Ruling / Answer
                                </h4>
                                <div 
                                    className="fatwa-content fs-5" 
                                    style={{ lineHeight: '1.8', color: '#4a5568' }}
                                >
                                    {/* Map linebreaks to paragraphs */}
                                    {(fatwa.content || "").split('\n').map((paragraph, index) => {
                                        if (!paragraph.trim()) return <br key={index} />;
                                        return <p key={index} className="mb-4">{paragraph}</p>;
                                    })}
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
