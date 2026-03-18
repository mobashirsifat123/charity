"use client";
import Link from 'next/link';
import { useSiteSettings } from '@/context/SiteSettingsContext';

const FooterOne = () => {
    const { settings } = useSiteSettings();
    return (
        <footer className="footer">
            <div className="container">
                <div className="row gy-4 pt-5 pb-4">
                    <div className="col-lg-4 col-md-6">
                        <div className="footer__about">
                            <Link href="/" className="text-decoration-none">
                                {settings.site_logo_url ? (
                                    <img src={settings.site_logo_url} alt={settings.site_name || 'Site Logo'} style={{ maxHeight: '45px' }} />
                                ) : (
                                    <h3 className="text-white m-0">{settings.site_name || 'IRWA'}</h3>
                                )}
                            </Link>
                            <p className="mt-3 text-light opacity-75">
                                {settings.footer_description || 'Connecting donors with meaningful causes. Empowering change, one donation at a time.'}
                            </p>
                            <div className="social mt-3 d-flex gap-3">
                                <Link href={settings.social_facebook || 'https://www.facebook.com/'} target="_blank" aria-label="facebook" className="text-light opacity-75"><i className="fa-brands fa-facebook-f" /></Link>
                                <Link href={settings.social_twitter || 'https://x.com/'} target="_blank" aria-label="twitter" className="text-light opacity-75"><i className="fa-brands fa-twitter" /></Link>
                                <Link href={settings.social_instagram || 'https://www.instagram.com/'} target="_blank" aria-label="instagram" className="text-light opacity-75"><i className="fa-brands fa-instagram" /></Link>
                            </div>
                        </div>
                    </div>
                    <div className="col-lg-2 col-md-6">
                        <h6 className="text-white fw-semibold mb-3">Quick Links</h6>
                        <ul className="list-unstyled">
                            <li className="mb-2"><Link href="/" className="text-light opacity-75 text-decoration-none">Home</Link></li>
                            <li className="mb-2"><Link href="/about-us" className="text-light opacity-75 text-decoration-none">About Us</Link></li>
                            <li className="mb-2"><Link href="/#campaigns" className="text-light opacity-75 text-decoration-none">Our Causes</Link></li>
                            <li className="mb-2"><Link href="/donation" className="text-light opacity-75 text-decoration-none">Donate</Link></li>
                            <li className="mb-2"><Link href="/contact-us" className="text-light opacity-75 text-decoration-none">Contact</Link></li>
                        </ul>
                    </div>
                    <div className="col-lg-3 col-md-6">
                        <h6 className="text-white fw-semibold mb-3">Causes</h6>
                        <ul className="list-unstyled">
                            {['Education', 'Medical', 'Environment', 'Community', 'Crisis'].map(cat => (
                                <li key={cat} className="mb-2">
                                    <Link href={`/#campaigns?category=${cat}`} className="text-light opacity-75 text-decoration-none">{cat}</Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div className="col-lg-3 col-md-6">
                        <h6 className="text-white fw-semibold mb-3">Contact</h6>
                        <ul className="list-unstyled text-light opacity-75">
                            <li className="mb-2"><i className="fa-solid fa-location-dot me-2" />123 Charity Lane, NY 10001</li>
                            <li className="mb-2"><i className="fa-solid fa-phone me-2" />{settings.contact_phone || '(+01)-793-7938'}</li>
                            <li className="mb-2"><i className="fa-solid fa-envelope me-2" />{settings.contact_email || 'info@irwa.org'}</li>
                        </ul>
                    </div>
                </div>
                <div className="border-top border-secondary pt-3 pb-3 text-center">
                    <p className="text-light opacity-50 mb-0 small">
                        &copy; {new Date().getFullYear()} {settings.site_name || 'IRWA'}. All rights reserved. Made with <span className="text-danger">❤️</span> for a better world.
                    </p>
                </div>
            </div>
        </footer>
    );
};

export default FooterOne;
