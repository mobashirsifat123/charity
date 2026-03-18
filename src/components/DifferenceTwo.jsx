"use client";

import { useSiteSettings } from '@/context/SiteSettingsContext';

const DifferenceTwo = () => {
    const { settings } = useSiteSettings();
    const steps = [
        {
            step: '01',
            title: settings.journey_step_1_title || 'Choose a Cause',
            desc: settings.journey_step_1_description || 'Browse our verified campaigns and find a mission that speaks to your heart.',
            icon: 'fa-magnifying-glass',
        },
        {
            step: '02',
            title: settings.journey_step_2_title || 'Make a Donation',
            desc: settings.journey_step_2_description || 'Contribute safely and securely using our Stripe-powered payment system.',
            icon: 'fa-credit-card',
        },
        {
            step: '03',
            title: settings.journey_step_3_title || 'Track the Impact',
            desc: settings.journey_step_3_description || 'Receive updates as the campaign reaches its goals and changes lives.',
            icon: 'fa-chart-pie',
        },
    ];

    return (
        <section className="py-5" style={{ background: '#f8f9fa' }}>
            <div className="container py-4">
                <div className="row justify-content-center text-center mb-5" data-aos="fade-up">
                    <div className="col-lg-7">
                        <span className="badge bg-danger bg-opacity-10 text-danger px-3 py-2 rounded-pill mb-3 fw-semibold">
                            {settings.journey_badge || 'How It Works'}
                        </span>
                        <h2 className="fw-bold">{settings.journey_title || 'Your Journey of Giving'}</h2>
                        <p className="text-muted">{settings.journey_description || 'A simple, transparent process ensures your donation makes the maximum possible impact.'}</p>
                    </div>
                </div>

                <div className="row g-4 position-relative">
                    {/* Connecting line for desktop */}
                    <div className="d-none d-lg-block position-absolute" style={{ top: 40, left: '10%', right: '10%', height: 2, borderTop: '2px dashed #dee2e6', zIndex: 0 }} />
                    
                    {steps.map((item, i) => (
                        <div key={item.step} className="col-lg-4 text-center position-relative" data-aos="fade-up" data-aos-delay={i * 100}>
                            <div className="bg-white rounded-circle shadow-sm mx-auto d-flex align-items-center justify-content-center mb-4 position-relative" style={{ width: 80, height: 80, zIndex: 1 }}>
                                <i className={`fa-solid ${item.icon} fs-3 text-danger`} />
                                <span className="position-absolute bg-danger text-white rounded-circle d-flex align-items-center justify-content-center fw-bold shadow" 
                                    style={{ width: 32, height: 32, top: -5, right: -5, fontSize: '0.8rem' }}>
                                    {item.step}
                                </span>
                            </div>
                            <h4 className="fw-bold mb-3">{item.title}</h4>
                            <p className="text-muted px-lg-3">{item.desc}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default DifferenceTwo;
