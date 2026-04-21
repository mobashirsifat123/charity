"use client";

import Link from "next/link";
import { useSiteSettings } from "@/context/SiteSettingsContext";

const TopBarOne = () => {
  const { settings } = useSiteSettings();
  const quickLinks = [
    {
      href: "/blog-grid",
      icon: "fa-book-open-reader",
      label: settings.top_bar_articles_label || "Articles & Research",
    },
    {
      href: "/fatwa",
      icon: "fa-scale-balanced",
      label: settings.top_bar_fatwa_label || "Trusted Fatwas",
    },
    {
      href: "/search",
      icon: "fa-magnifying-glass",
      label: settings.top_bar_search_label || "Knowledge Search",
    },
  ];
  const socialLinks = [
    {
      href: settings.social_facebook || "https://www.facebook.com/",
      icon: "fa-facebook-f",
      label: "Facebook",
    },
    {
      href: settings.social_twitter || "https://x.com/",
      icon: "fa-twitter",
      label: "Twitter / X",
    },
    {
      href: settings.social_linkedin || "https://www.linkedin.com/",
      icon: "fa-linkedin-in",
      label: "LinkedIn",
    },
  ];

  return (
    <div
      className="top-bar bg-primary text-white py-2 d-none d-lg-block"
      style={{ fontSize: "0.85rem" }}
    >
      <div className="container">
        <div className="row align-items-center">
          <div className="col-md-6">
            <div className="d-flex gap-4 flex-wrap">
              <span>
                <i className="fa-solid fa-envelope me-2 opacity-75" />
                {settings.contact_email || "info@irwa.org"}
              </span>
              <span>
                <i className="fa-solid fa-phone me-2 opacity-75" />
                {settings.contact_phone || "(+01)-793-7938"}
              </span>
            </div>
          </div>
          <div className="col-md-6 text-end">
            <div className="d-flex align-items-center justify-content-end gap-3">
              {quickLinks.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="top-bar-icon-link"
                  aria-label={item.label}
                  title={item.label}
                >
                  <i className={`fa-solid ${item.icon}`} />
                </Link>
              ))}
              <div className="d-flex gap-2 ms-4 border-start border-light border-opacity-25 ps-4">
                {socialLinks.map((item) => (
                  <Link
                    key={item.label}
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="top-bar-icon-link"
                    aria-label={item.label}
                    title={item.label}
                  >
                    <i className={`fa-brands ${item.icon}`} />
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TopBarOne;
