import React from 'react';
import HeaderOne from '@/components/HeaderOne';
import FooterOne from '@/components/FooterOne';
import BreadcrumbOne from '@/components/BreadcrumbOne';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';

export const revalidate = 60;

// Server Component Fetch
async function getPublishedFatwas() {
    const { data, error } = await supabase
        .from('fatwas')
        .select(`*, users:author_id(name)`)
        .eq('status', 'published')
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching public fatwas:', error);
        return [];
    }
    return data || [];
}

export default async function FatwaGridPage() {
    const fatwas = await getPublishedFatwas();

    return (
        <section className="page-wrapper bg-light min-vh-100">
            <HeaderOne />
            <BreadcrumbOne
                title="Islamic Rulings & Guidance"
                links={[
                    { name: "Home", link: "/" },
                    { name: "Fatwa", link: "/fatwa" }
                ]}
            />

            <div className="container py-5 mt-4">
                <div className="row justify-content-center">
                    <div className="col-lg-10">
                        {fatwas.length === 0 ? (
                            <div className="text-center py-5 bg-white rounded-4 shadow-sm">
                                <i className="fa-solid fa-scale-balanced text-muted mb-3" style={{ fontSize: '3rem' }}></i>
                                <h4 className="fw-bold">No Rulings Found</h4>
                                <p className="text-muted mb-0">The scholars have not published any fatwas yet. Check back soon!</p>
                            </div>
                        ) : (
                            <div className="d-flex flex-column gap-4">
                                {fatwas.map((fatwa) => (
                                    <div key={fatwa.id} className="card border-0 shadow-sm rounded-4 overflow-hidden" data-aos="fade-up">
                                        <div className="card-body p-4 p-md-5">
                                            <div className="d-flex align-items-center gap-3 mb-3 text-muted small fw-medium">
                                                <span className="badge bg-primary bg-opacity-10 text-primary rounded-pill px-3 py-1">Ruling</span>
                                                <span suppressHydrationWarning><i className="fa-regular fa-calendar me-1"></i>{new Date(fatwa.created_at).toLocaleDateString()}</span>
                                                <span><i className="fa-solid fa-user me-1"></i>{fatwa.users?.name || 'Scholar'}</span>
                                            </div>
                                            
                                            <h3 className="card-title fw-bold mb-3">
                                                <Link href={`/fatwa/${fatwa.id}`} className="text-dark text-decoration-none hover-primary">
                                                    {fatwa.title}
                                                </Link>
                                            </h3>
                                            
                                            <p className="card-text text-muted fs-5 mb-4 line-clamp-3">
                                                {(fatwa.content || "").substring(0, 200)}...
                                            </p>
                                            
                                            <Link href={`/fatwa/${fatwa.id}`} className="btn btn-outline-primary fw-bold rounded-pill px-4">
                                                Read Full Answer <i className="fa-solid fa-arrow-right ms-2"></i>
                                            </Link>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <FooterOne />
        </section>
    );
}
