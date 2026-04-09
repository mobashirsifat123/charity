"use client";

import Link from 'next/link';
import { useSiteSettings } from '@/context/SiteSettingsContext';

const HelpOne = () => {
    const { settings } = useSiteSettings();
    const items = [
        {
            title: settings.help_card_1_title || 'Make a Donation',
            desc: settings.help_card_1_description || 'Provide financial support to fund our global initiatives and immediate relief efforts.',
            icon: 'fa-hand-holding-dollar',
            color: 'var(--primary-color)',
            link: settings.help_card_1_link || '/donation',
            btnText: settings.help_card_1_button_text || 'Donate',
        },
        {
            title: settings.help_card_2_title || 'Become a Volunteer',
            desc: settings.help_card_2_description || 'Join our team on the ground or help us remotely with your skills and expertise.',
            icon: 'fa-hands-holding-child',
            color: 'var(--secondary-color)',
            link: settings.help_card_2_link || '/contact-us',
            btnText: settings.help_card_2_button_text || 'Join Us',
        },
        {
            title: settings.help_card_3_title || 'Start a Fundraiser',
            desc: settings.help_card_3_description || 'Create your own campaign and rally your friends and family for a cause you love.',
            icon: 'fa-bullhorn',
            color: 'var(--accent-color)',
            link: settings.help_card_3_link || '/#campaigns',
            btnText: settings.help_card_3_button_text || 'Start Now',
        },
    ];

    return (
        <section className="py-5 page-surface section-shell">
            <div className="container py-4">
                <div className="row justify-content-center text-center mb-5" data-aos="fade-up">
                    <div className="col-lg-7">
                        <span className="theme-badge-gold mb-3">
                            {settings.help_badge || 'Get Involved'}
                        </span>
                        <h2 className="fw-bold">{settings.help_title || 'How You Can Help'}</h2>
                        <p className="text-muted">{settings.help_description || 'There are many ways to support our mission. Whether it is your time, voice, or resources, we need you.'}</p>
                    </div>
                </div>

                <div className="row g-4">
                    {items.map((item, i) => (
                        <div key={item.title} className="col-lg-4" data-aos="fade-up" data-aos-delay={i * 100}>
                            <div className="card text-center h-100 border-0 shadow-sm rounded-4 p-4 hover-lift system-panel glass-surface--light">
                                <div className="card-body d-flex flex-column align-items-center">
                                    <div className="rounded-circle d-flex align-items-center justify-content-center mb-4"
                                        style={{ width: 72, height: 72, background: item.color === 'var(--accent-color)' ? 'rgba(200,169,81,0.14)' : 'rgba(11,61,46,0.10)' }}>
                                        <i className={`fa-solid ${item.icon} fs-2`} style={{ color: item.color }} />
                                    </div>
                                    <h4 className="fw-bold mb-3">{item.title}</h4>
                                    <p className="text-muted mb-4">{item.desc}</p>
                                    <Link href={item.link} className={`btn rounded-pill px-4 mt-auto fw-medium btn-ripple ${item.color === 'var(--accent-color)' ? 'btn-warning' : 'btn-outline-primary'}`}>
                                        {item.btnText}
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default HelpOne;
