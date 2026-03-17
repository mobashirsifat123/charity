"use client";
import Link from 'next/link';
import { useSiteSettings } from '@/context/SiteSettingsContext';

const CommunityOne = () => {
    const { settings } = useSiteSettings();
    const stats = [
        { value: '50K+', label: 'Community Members', icon: 'fa-users', color: '#4e9af1' },
        { value: '120+', label: 'Countries Reached', icon: 'fa-globe', color: '#4caf7d' },
        { value: '98%', label: 'Donor Satisfaction', icon: 'fa-star', color: '#f0a500' },
        { value: '$5M+', label: 'Total Impact', icon: 'fa-dollar-sign', color: '#9c59d1' },
    ];

    return (
        <section className="py-5" style={{ background: settings.community_bg_image ? `url(${settings.community_bg_image}) center/cover no-repeat` : 'linear-gradient(135deg, #1a3c5e 0%, #0d2137 100%)' }}>
            <div className="container py-4">
                <div className="row align-items-center gy-5">
                    <div className="col-lg-5" data-aos="fade-right">
                        <span className="badge bg-warning text-dark px-3 py-2 rounded-pill mb-3 fw-semibold">
                            Our Community
                        </span>
                        <h2 className="text-white fw-bold mb-4">
                            {settings.community_title || 'Together We Can Change the World'}
                        </h2>
                        <p className="text-white opacity-75 mb-4">
                            {settings.community_subtitle || 'Our global community of donors, volunteers, and campaign creators unites around a shared mission: making the world a better place, one act of generosity at a time.'}
                        </p>
                        <div className="d-flex gap-3 flex-wrap">
                            <Link href="/register" className="btn btn-warning btn-lg fw-bold px-5 rounded-pill">
                                Join the Community
                            </Link>
                            <Link href="/about-us" className="btn btn-outline-light btn-lg px-5 rounded-pill">
                                Learn More
                            </Link>
                        </div>
                    </div>

                    <div className="col-lg-7" data-aos="fade-left">
                        <div className="row g-4">
                            {stats.map((stat, i) => (
                                <div key={stat.label} className="col-6" data-aos="zoom-in" data-aos-delay={i * 100}>
                                    <div className="rounded-4 p-4 text-center"
                                        style={{ background: 'rgba(255,255,255,0.07)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.12)' }}>
                                        <div className="rounded-circle mx-auto mb-3 d-flex align-items-center justify-content-center"
                                            style={{ width: 60, height: 60, background: stat.color + '22' }}>
                                            <i className={`fa-solid ${stat.icon} fs-4`} style={{ color: stat.color }} />
                                        </div>
                                        <h3 className="text-white fw-bold mb-1">{stat.value}</h3>
                                        <p className="text-white opacity-60 mb-0 small">{stat.label}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default CommunityOne;
