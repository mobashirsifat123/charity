"use client";

import Link from 'next/link';
import { useSiteSettings } from '@/context/SiteSettingsContext';

const CtaSectionOne = () => {
    const { settings } = useSiteSettings();
    return (
        <section
            className="py-5"
            style={{
                background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                position: 'relative',
                overflow: 'hidden',
            }}
        >
            {/* Decorative elements */}
            <div style={{ position: 'absolute', top: -60, right: -60, width: 220, height: 220, borderRadius: '50%', background: 'rgba(255,255,255,0.1)', pointerEvents: 'none' }} />
            <div style={{ position: 'absolute', bottom: -40, left: -40, width: 160, height: 160, borderRadius: '50%', background: 'rgba(255,255,255,0.08)', pointerEvents: 'none' }} />

            <div className="container py-4" style={{ position: 'relative', zIndex: 1 }}>
                <div className="row align-items-center gy-4">
                    <div className="col-lg-8" data-aos="fade-right">
                        <h2 className="text-white fw-bold mb-2" style={{ fontSize: 'clamp(1.5rem, 3vw, 2.5rem)' }}>
                            {settings.cta_title || 'Ready to Make a Difference?'}
                        </h2>
                        <p className="text-white opacity-85 mb-0" style={{ fontSize: '1.1rem' }}>
                            {settings.cta_subtitle || 'Join thousands of donors who are already changing lives. Start your giving journey today — every donation, big or small, creates real impact.'}
                        </p>
                    </div>
                    <div className="col-lg-4 text-lg-end" data-aos="fade-left">
                        <div className="d-flex flex-wrap gap-3 justify-content-lg-end">
                            <Link href={settings.cta_primary_cta_link || '/donation'} className="btn btn-dark btn-lg fw-bold px-5 rounded-pill">
                                {settings.cta_primary_cta_text || 'Donate Now'} <i className="fa-solid fa-heart ms-2" />
                            </Link>
                            <Link href={settings.cta_secondary_cta_link || '/#campaigns'} className="btn btn-outline-light btn-lg px-4 rounded-pill">
                                {settings.cta_secondary_cta_text || 'Browse Causes'}
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default CtaSectionOne;
