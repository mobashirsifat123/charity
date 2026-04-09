"use client";
import Link from "next/link";
import HeaderOne from "@/components/HeaderOne";
import FooterOne from "@/components/FooterOne";
import BreadcrumbOne from "@/components/BreadcrumbOne";
import TeamOne from "@/components/TeamOne";
import { useLanguage } from "@/context/LanguageContext";
import { useSiteSettings } from "@/context/SiteSettingsContext";

export default function AboutPage() {
  const { settings } = useSiteSettings();
  const { t } = useLanguage();

  return (
    <section className="page-wrapper">
      <HeaderOne />
      <BreadcrumbOne
        title={t('aboutUs', 'About Us')}
        links={[
          { name: t('home', 'Home'), link: "/" },
          { name: t('aboutUs', 'About Us'), link: "/about-us" },
        ]}
      />
      <section className="themed-photo-section themed-photo-section--desert py-5">
        <div className="container py-3 py-lg-5">
          <div className="row justify-content-center">
            <div className="col-lg-9">
              <div className="card border-0 shadow-sm rounded-4 themed-photo-card">
                <div className="card-body p-4 p-md-5">
                  <h2 className="fw-bold mb-4">{settings.about_page_heading || "About IRWA"}</h2>
                  <p className="text-muted mb-3">
                    {settings.about_page_paragraph_1 || "IRWA combines beneficial Islamic knowledge, trusted guidance, and community support in one platform."}
                  </p>
                  <p className="text-muted mb-3">
                    {settings.about_page_paragraph_2 || "We publish articles and fatwas to serve the dawah mission, while also supporting meaningful causes that help people on the ground."}
                  </p>
                  <p className="text-muted mb-4">
                    {settings.about_page_paragraph_3 || "Explore our latest articles, browse fatwas, or support an active cause through the resources below."}
                  </p>
                  <div className="d-flex flex-wrap gap-3">
                    <Link href="/blog-grid" className="btn btn-outline-primary rounded-pill px-4">{t('articles', 'Articles')}</Link>
                    <Link href="/fatwa" className="btn btn-outline-primary rounded-pill px-4">{t('fatwas', 'Fatwas')}</Link>
                    <Link href="/#campaigns" className="btn btn-primary rounded-pill px-4">{t('supportCause', 'Support a Cause')}</Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section id="contact-us" className="py-5 bg-white">
        <div className="container py-3">
          <div className="row justify-content-center">
            <div className="col-lg-10">
              <div className="card border-0 shadow-sm rounded-4">
                <div className="card-body p-4 p-md-5">
                  <h2 className="fw-bold mb-4">{settings.contact_page_heading || "Get in Touch"}</h2>
                  <p className="text-muted mb-4">
                    {settings.contact_page_description || "For general questions about articles, fatwas, campaigns, or technical help with donations, contact the IRWA team below."}
                  </p>
                  <div className="row g-4">
                    <div className="col-md-4">
                      <div className="border rounded-4 p-4 h-100">
                        <h5 className="fw-bold">{t('email', 'Email')}</h5>
                        <a href={`mailto:${settings.contact_email || "info@irwa.org"}`} className="text-decoration-none">
                          {settings.contact_email || "info@irwa.org"}
                        </a>
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="border rounded-4 p-4 h-100">
                        <h5 className="fw-bold">{t('phone', 'Phone')}</h5>
                        <a
                          href={`tel:${(settings.contact_phone || "(+01)-793-7938").replace(/[^\d+]/g, "")}`}
                          className="text-decoration-none"
                        >
                          {settings.contact_phone || "(+01)-793-7938"}
                        </a>
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="border rounded-4 p-4 h-100">
                        <h5 className="fw-bold">{t('address', 'Address')}</h5>
                        <span>{settings.contact_address || "123 Charity Lane, NY 10001"}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <TeamOne />
      <FooterOne />
    </section>
  );
}
