"use client";

import { useSiteSettings } from '@/context/SiteSettingsContext';

const TestimonialOne = () => {
    const { settings } = useSiteSettings();
    return (
        <section className="py-5 page-surface-alt section-shell" style={{ position: 'relative', overflow: 'hidden' }}>
            <div className="container py-4">
                <div className="row justify-content-center text-center mb-5" data-aos="fade-up">
                    <div className="col-lg-6">
                        <span className="section-header-rail mb-3">Community Trust</span>
                        <h2 className="fw-bold mb-3">
                            {settings.testimonial_title_prefix || 'Words From Our'} <span className="text-primary">{settings.testimonial_title_highlight || 'Donors'}</span>
                        </h2>
                        <p className="text-muted">{settings.testimonial_description || 'Hear from the people who are making a real impact through our platform.'}</p>
                    </div>
                </div>

                <div className="row justify-content-center g-4">
                    <div className="col-lg-4" data-aos="fade-up">
                        <div className="system-panel glass-surface--light p-4 h-100">
                            <div className="system-list">
                                <div className="system-list__item">
                                    <span className="system-list__icon">
                                        <i className="fa-solid fa-eye" />
                                    </span>
                                    <div>
                                        <span className="system-list__title">Clear visibility</span>
                                        <span className="system-list__meta">Users should feel where the money goes and what the impact is.</span>
                                    </div>
                                </div>
                                <div className="system-list__item">
                                    <span className="system-list__icon">
                                        <i className="fa-solid fa-comments" />
                                    </span>
                                    <div>
                                        <span className="system-list__title">Human updates</span>
                                        <span className="system-list__meta">A more personal presentation makes the platform feel alive and accountable.</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="col-lg-8">
                        <div className="card border-0 shadow-lg rounded-4 p-5 text-center bg-white hover-lift system-panel glass-surface--light quote-panel" data-aos="zoom-in">
                            <i className="fa-solid fa-quote-right fs-1 text-primary opacity-25 mb-3" />
                            <h4 className="fw-normal fst-italic text-dark mb-4" style={{ lineHeight: 1.6, fontFamily: 'var(--font-merriweather)' }}>
                                "{settings.testimonial_quote || 'I was looking for a way to give back to education initiatives, and IRWA made the process incredibly transparent. Being able to see exactly where my money went and receiving updates from the campaign leaders is truly rewarding.'}"
                            </h4>
                            <div className="d-flex align-items-center justify-content-center mt-4">
                                <img src={settings.testimonial_avatar_url || "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=150&auto=format&fit=crop"} 
                                    alt="Reviewer" className="rounded-circle object-fit-cover me-3 shadow-sm" style={{ width: 60, height: 60 }} />
                                <div className="text-start">
                                    <h6 className="fw-bold mb-0">{settings.testimonial_name || 'Emily Thompson'}</h6>
                                    <small className="text-muted">{settings.testimonial_role || 'Monthly Donor'}</small>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default TestimonialOne;
