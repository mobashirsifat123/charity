"use client";

import { useSiteSettings } from '@/context/SiteSettingsContext';

const PartnerOne = () => {
    const { settings } = useSiteSettings();

    const renderPartner = (partnerValue, fallbackText, fontFamily) => {
        if (!partnerValue) {
            return <div className="fs-3 fw-bold" style={{ fontFamily }}>{fallbackText}</div>;
        }
        if (partnerValue.startsWith('http') || partnerValue.startsWith('/')) {
            return <img src={partnerValue} alt="Partner Logo" style={{ maxHeight: '40px', objectFit: 'contain' }} />;
        }
        return <div className="fs-3 fw-bold" style={{ fontFamily }}>{partnerValue}</div>;
    };

    return (
        <section className="py-4 border-bottom border-top" style={{ background: '#f8f9fa' }}>
            <div className="container">
                <div className="row align-items-center" data-aos="fade-in">
                    <div className="col-lg-3 text-center text-lg-start mb-4 mb-lg-0">
                        <h6 className="fw-bold text-muted text-uppercase tracking-wider mb-0">{settings.partners_heading || 'Trusted By Global Partners'}</h6>
                    </div>
                    <div className="col-lg-9">
                        <div className="d-flex flex-wrap justify-content-center justify-content-lg-between align-items-center opacity-50 gap-4">
                            {renderPartner(settings.partner_logo_1, 'LOGO IPSUM', 'monospace')}
                            {renderPartner(settings.partner_logo_2, 'PartnerOrg', 'sans-serif')}
                            {renderPartner(settings.partner_logo_3, 'GlobalAid', 'serif')}
                            {renderPartner(settings.partner_logo_4, 'UNICEF partner', 'cursive')}
                            {renderPartner(settings.partner_logo_5, 'TECHFORGOOD', 'inherit')}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default PartnerOne;
