"use client";

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useSiteSettings } from '@/context/SiteSettingsContext';
import { supabase } from '@/lib/supabaseClient';

const formatCurrency = (amount) =>
    new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(Number(amount) || 0);

const CauseSliderTwo = () => {
    const { settings } = useSiteSettings();
    const [causes, setCauses] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let active = true;

        const fetchFeaturedCampaigns = async () => {
            try {
                const { data, error } = await supabase
                    .from('campaigns')
                    .select('*')
                    .order('created_at', { ascending: false })
                    .limit(4);

                if (error) throw error;
                if (active) {
                    setCauses((data || []).map((cause) => ({
                        ...cause,
                        category: cause.category || 'Campaign',
                    })));
                }
            } catch (error) {
                console.error('Error fetching featured causes:', error);
            } finally {
                if (active) {
                    setLoading(false);
                }
            }
        };

        fetchFeaturedCampaigns();

        return () => {
            active = false;
        };
    }, []);

    if (!loading && causes.length === 0) {
        return (
            <section className="py-5 page-surface-alt section-shell">
                <div className="container py-4 text-center">
                    <span className="theme-badge-soft mb-3">
                        {settings.cause_slider_badge || 'Featured Causes'}
                    </span>
                    <h2 className="fw-bold mb-3">{settings.campaign_section_empty_title || 'No Campaigns Yet'}</h2>
                    <p className="text-muted mb-0">{settings.campaign_section_empty_description || 'Check back soon for new fundraising campaigns!'}</p>
                </div>
            </section>
        );
    }

    return (
        <section className="py-5 page-surface-alt section-shell">
            <div className="container position-relative py-4">
                <div className="text-center mb-5" data-aos="fade-up">
                    <span className="theme-badge-soft mb-3">
                        {settings.cause_slider_badge || 'Featured Causes'}
                    </span>
                    <h2 className="fw-bold">{settings.cause_slider_title || 'Causes That Need Your Help'}</h2>
                    <p className="text-muted">{settings.cause_slider_description || 'Every campaign is making a real difference. Be a part of it.'}</p>
                </div>

                <div className="row g-4">
                    {causes.map((cause, i) => {
                        const raised = Number(cause.raised_amount) || 0;
                        const goal = Number(cause.goal_amount) || 0;
                        const progress = goal > 0 ? Math.min(Math.round((raised / goal) * 100), 100) : 0;

                        return (
                            <div key={cause.id} className="col-lg-3 col-md-6" data-aos="fade-up" data-aos-delay={i * 80}>
                                <div className="card border-0 shadow-sm rounded-4 h-100 overflow-hidden hover-lift system-panel glass-surface--light">
                                    <div style={{ height: 8, background: 'linear-gradient(90deg, var(--primary-color) 0%, var(--secondary-color) 72%, var(--accent-color) 100%)' }} />
                                    <div className="card-body p-4 d-flex flex-column">
                                        <span className={`badge rounded-pill mb-3 px-3 py-2 small align-self-start ${i === 2 ? 'theme-badge-gold' : 'theme-badge-soft'}`}>
                                            {cause.category || 'Campaign'}
                                        </span>
                                        <h6 className="fw-bold mb-3">{cause.title}</h6>
                                        <div className="mb-2">
                                            <div className="progress rounded-pill" style={{ height: 8 }}>
                                                <div className="progress-bar rounded-pill" role="progressbar" style={{ width: `${progress}%` }} />
                                            </div>
                                        </div>
                                        <div className="d-flex justify-content-between small text-muted mb-3">
                                            <span><strong className="text-primary">{formatCurrency(raised)}</strong> raised</span>
                                            <span>Goal {formatCurrency(goal)}</span>
                                        </div>
                                        <div className="d-flex align-items-center justify-content-between mt-auto">
                                            <small className="text-muted">{progress}% funded</small>
                                            <Link href={`/cause-details/${cause.id}`} className="btn btn-sm btn-primary rounded-pill px-3 fw-semibold btn-ripple">
                                                Donate
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                <div className="text-center mt-5" data-aos="fade-up">
                    <Link href="/#campaigns" className="btn btn-primary btn-lg rounded-pill px-5 btn-ripple">
                        {settings.cause_slider_cta_text || 'View All Causes'} <i className="fa-solid fa-arrow-right ms-2" />
                    </Link>
                    {loading ? <p className="text-muted small mt-3 mb-0">Loading featured causes...</p> : null}
                </div>
            </div>
        </section>
    );
};

export default CauseSliderTwo;
