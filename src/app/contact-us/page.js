"use client";
import HeaderOne from "@/components/HeaderOne";
import FooterOne from "@/components/FooterOne";
import BreadcrumbOne from "@/components/BreadcrumbOne";
import { useLanguage } from "@/context/LanguageContext";
import { useSiteSettings } from "@/context/SiteSettingsContext";

export default function ContactPage() {
  const { settings } = useSiteSettings();
  const { t } = useLanguage();
  const email = settings.contact_email || "info@irwa.org";
  const phone = settings.contact_phone || "(+01)-793-7938";
  const phoneHref = phone.replace(/[^\d+]/g, "");

  return (
    <section className="page-wrapper">
      <HeaderOne />
      <BreadcrumbOne
        title={t('contactUs', 'Contact Us')}
        links={[
          { name: t('home', 'Home'), link: "/" },
          { name: t('contactUs', 'Contact Us'), link: "/contact-us" },
        ]}
      />
      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-lg-8">
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
                      <a href={`mailto:${email}`} className="text-decoration-none">{email}</a>
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className="border rounded-4 p-4 h-100">
                      <h5 className="fw-bold">{t('phone', 'Phone')}</h5>
                      <a href={`tel:${phoneHref}`} className="text-decoration-none">{phone}</a>
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className="border rounded-4 p-4 h-100">
                      <h5 className="fw-bold">{t('address', 'Address')}</h5>
                      <span className="text-decoration-none">{settings.contact_address || "123 Charity Lane, NY 10001"}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <FooterOne />
    </section>
  );
}
