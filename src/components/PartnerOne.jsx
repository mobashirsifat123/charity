"use client";

import { useSiteSettings } from '@/context/SiteSettingsContext';

const PartnerOne = () => {
    const { settings } = useSiteSettings();

    const renderPartner = (partnerValue, fallbackText, fontFamily) => {
        if (!partnerValue) {
            return <div className="fs-5 fw-bold text-center" style={{ fontFamily }}>{fallbackText}</div>;
        }
        if (partnerValue.startsWith('http') || partnerValue.startsWith('/')) {
            return <img src={partnerValue} alt="Partner Logo" />;
        }
        return <div className="fs-5 fw-bold text-center" style={{ fontFamily }}>{partnerValue}</div>;
    };

    return (
        <section className="py-5 page-surface-alt section-shell">
            <div className="container">
                <div className="row align-items-center g-4" data-aos="fade-in">
                    <div className="col-lg-4 text-center text-lg-start">
                        <span className="section-header-rail mb-3">{settings.partners_heading || 'Trusted By Global Partners'}</span>
                        <h3 className="fw-bold mb-2">Built to earn trust before asking for support</h3>
                        <p className="text-muted mb-0">A calmer, more structured partner area helps the platform feel established, credible, and cared for.</p>
                    </div>
                    <div className="col-lg-8">
                        <div className="partner-cloud">
                            <div className="partner-cloud__item">{renderPartner(settings.partner_logo_1, 'LOGO IPSUM', 'monospace')}</div>
                            <div className="partner-cloud__item">{renderPartner(settings.partner_logo_2, 'PartnerOrg', 'sans-serif')}</div>
                            <div className="partner-cloud__item">{renderPartner(settings.partner_logo_3, 'GlobalAid', 'serif')}</div>
                            <div className="partner-cloud__item">{renderPartner(settings.partner_logo_4, 'UNICEF partner', 'cursive')}</div>
                            <div className="partner-cloud__item">{renderPartner(settings.partner_logo_5, 'TECHFORGOOD', 'inherit')}</div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default PartnerOne;
