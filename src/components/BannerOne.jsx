"use client";
import Link from 'next/link';
import { useSiteSettings } from '@/context/SiteSettingsContext';

const BannerOne = () => {
    const { settings } = useSiteSettings();
    const stats = [
        { value: settings.hero_stat_1_value || 'New', label: settings.hero_stat_1_label || 'Fatwas & Guidance' },
        { value: settings.hero_stat_2_value || 'Weekly', label: settings.hero_stat_2_label || 'Articles & Reminders' },
        { value: settings.hero_stat_3_value || 'Active', label: settings.hero_stat_3_label || 'Community Causes' },
    ];
    const cards = [
        { icon: 'fa-book-open', title: settings.hero_card_1_title || 'Articles', color: '#4e9af1', meta: settings.hero_card_1_meta || 'Reflections & learning' },
        { icon: 'fa-scale-balanced', title: settings.hero_card_2_title || 'Fatwas', color: '#e0b04c', meta: settings.hero_card_2_meta || 'Trusted answers' },
        { icon: 'fa-mosque', title: settings.hero_card_3_title || 'Dawah', color: '#4caf7d', meta: settings.hero_card_3_meta || 'Community benefit' },
        { icon: 'fa-hand-holding-heart', title: settings.hero_card_4_title || 'Causes', color: '#f0a500', meta: settings.hero_card_4_meta || 'Support in action' },
    ];

    return (
        <section
            className="banner"
            style={{
                background: settings.hero_bg_image ? `url(${settings.hero_bg_image}) center/cover no-repeat` : 'linear-gradient(135deg, #0a1f35 0%, #1a4a7a 60%, #2d6a9f 100%)',
                minHeight: '90vh',
                display: 'flex',
                alignItems: 'center',
                position: 'relative',
                overflow: 'hidden',
            }}
        >
            {/* Decorative circles */}
            <div style={{ position: 'absolute', top: '10%', right: '10%', width: 300, height: 300, borderRadius: '50%', background: 'rgba(255,255,255,0.03)', pointerEvents: 'none' }} />
            <div style={{ position: 'absolute', bottom: '10%', left: '5%', width: 200, height: 200, borderRadius: '50%', background: 'rgba(255,255,255,0.05)', pointerEvents: 'none' }} />

            <div className="container" style={{ position: 'relative', zIndex: 1 }}>
                <div className="row align-items-center gy-5">
                    <div className="col-lg-6" data-aos="fade-right">
                        <span className="badge bg-warning text-dark mb-3 px-3 py-2 rounded-pill fw-semibold">
                            Featured Mission: {settings.hero_subtitle || 'Dawah, Guidance, and Giving'}
                        </span>
                        <h1 className="text-white fw-bold mb-4" style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', lineHeight: 1.2 }}>
                            {settings.hero_title || 'Knowledge That Guides, Causes That Matter'}
                        </h1>
                        <p className="text-white opacity-75 mb-5" style={{ fontSize: '1.1rem', maxWidth: 520 }}>
                            {settings.hero_description || 'Build a stronger Muslim community through beneficial articles, trusted fatwas, and causes that turn faith into action.'}
                        </p>
                        <div className="d-flex flex-wrap gap-3">
                            <Link href={settings.hero_primary_cta_link || '/fatwa'} className="btn btn-warning btn-lg fw-bold px-5 rounded-pill">
                                {settings.hero_primary_cta_text || 'Explore Fatwas'} <i className="fa-solid fa-arrow-right ms-2" />
                            </Link>
                            <Link href={settings.hero_secondary_cta_link || '/blog-grid'} className="btn btn-outline-light btn-lg px-5 rounded-pill">
                                {settings.hero_secondary_cta_text || 'Read Articles'}
                            </Link>
                        </div>

                        <div className="d-flex flex-wrap gap-3 mt-4">
                            <Link href={settings.hero_support_cta_link || '/#campaigns'} className="text-white text-decoration-none fw-semibold">
                                {settings.hero_support_cta_text || 'Support our causes'} <i className="fa-solid fa-arrow-right ms-2" />
                            </Link>
                        </div>

                        {/* Stats */}
                        <div className="row mt-5 gy-3">
                            {stats.map(stat => (
                                <div key={stat.label} className="col-4">
                                    <h3 className="text-warning fw-bold mb-0">{stat.value}</h3>
                                    <small className="text-white opacity-60">{stat.label}</small>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="col-lg-6" data-aos="fade-left">
                        <div className="row g-3">
                            {cards.map(card => (
                                <div key={card.title} className="col-6">
                                    <div
                                        className="rounded-4 p-4 text-center"
                                        style={{ background: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.15)', transition: 'transform 0.3s' }}
                                        onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-5px)'}
                                        onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
                                    >
                                        <div className="rounded-circle mx-auto mb-3 d-flex align-items-center justify-content-center"
                                            style={{ width: 56, height: 56, background: card.color + '22' }}>
                                            <i className={`fa-solid ${card.icon} fs-4`} style={{ color: card.color }} />
                                        </div>
                                        <h6 className="text-white fw-bold mb-1">{card.title}</h6>
                                        <small style={{ color: card.color }}>{card.meta}</small>
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

export default BannerOne;
