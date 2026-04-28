"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { usePersonalization } from "@/context/PersonalizationContext";
import { useSiteSettings } from "@/context/SiteSettingsContext";

const MAIN_LINKS = [
  { label: "Quran", href: "/quran", icon: "fa-solid fa-book-quran" },
  { label: "Tafseer", href: "/quran/tafseer", icon: "fa-solid fa-book-open" },
  { label: "Articles", href: "/blog-grid", icon: "fa-regular fa-newspaper" },
  { label: "Fatwas", href: "/fatwa", icon: "fa-solid fa-scale-balanced" },
  { label: "E-Books", href: "/ebooks", icon: "fa-solid fa-book" },
  { label: "Courses", href: "/courses", icon: "fa-solid fa-graduation-cap" },
  { label: "Search", href: "/search", icon: "fa-solid fa-magnifying-glass" },
  { label: "About", href: "/about-us", icon: "fa-solid fa-circle-info" },
  {
    label: "Contact",
    href: "/about-us#contact",
    icon: "fa-regular fa-envelope",
  },
];

export default function GlobalSiteDrawer({ open, onClose }) {
  const pathname = usePathname();
  const { settings } = useSiteSettings();
  const { trackFeature } = usePersonalization();
  const [expanded, setExpanded] = useState("about");

  useEffect(() => {
    if (!open) return undefined;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event) => {
      if (event.key === "Escape") onClose();
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose, open]);

  useEffect(() => {
    if (open) onClose();
    // Close after navigation only; onClose is stable enough from parent state.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  if (!open) return null;

  return (
    <div className="global-site-drawer" aria-modal="true" role="dialog">
      <button
        type="button"
        className="global-site-drawer__overlay"
        aria-label="Close site menu"
        onClick={onClose}
      />
      <aside className="global-site-drawer__panel">
        <div className="global-site-drawer__brand">
          <Link href="/" className="site-brand text-decoration-none">
            {settings.site_logo_url ? (
              <Image
                src={settings.site_logo_url}
                alt="IRWAA"
                width={64}
                height={64}
                className="site-logo"
              />
            ) : null}
            <span className="site-brand__wordmark">IRWAA</span>
          </Link>
          <button
            type="button"
            className="global-site-drawer__close"
            onClick={onClose}
            aria-label="Close menu"
          >
            <i className="fa-solid fa-xmark" />
          </button>
        </div>

        <div className="global-site-drawer__supervision">
          <span>Knowledge, guidance, and community benefit</span>
          <strong>IRWAA Islamic Platform</strong>
        </div>

        <div className="global-site-drawer__socials" aria-label="Social links">
          <a
            href={settings.social_facebook || "https://www.facebook.com/"}
            aria-label="Facebook"
          >
            <i className="fa-brands fa-facebook-f" />
          </a>
          <a
            href={settings.social_twitter || "https://x.com/"}
            aria-label="Twitter"
          >
            <i className="fa-brands fa-x-twitter" />
          </a>
          <a
            href={settings.social_instagram || "https://www.instagram.com/"}
            aria-label="Instagram"
          >
            <i className="fa-brands fa-instagram" />
          </a>
          <a
            href={settings.social_linkedin || "https://www.linkedin.com/"}
            aria-label="LinkedIn"
          >
            <i className="fa-brands fa-linkedin-in" />
          </a>
        </div>

        <nav className="global-site-drawer__nav" aria-label="Main site menu">
          {MAIN_LINKS.map((item) => (
            <Link
              href={item.href}
              className={`global-site-drawer__link ${
                pathname === item.href || pathname.startsWith(`${item.href}/`)
                  ? "is-active"
                  : ""
              }`}
              key={item.href}
              onClick={() =>
                trackFeature({
                  href: item.href,
                  label: item.label,
                  icon: item.icon.replace(/^fa-(solid|regular)\s+/, ""),
                })
              }
            >
              <span>
                <i className={item.icon} />
                {item.label}
              </span>
              <i className="fa-solid fa-chevron-right" />
            </Link>
          ))}
        </nav>

        <div className="global-site-drawer__accordions">
          <DrawerAccordion
            id="about"
            title="About IRWAA"
            expanded={expanded}
            setExpanded={setExpanded}
          >
            <p>
              IRWAA brings Quran learning, trusted answers, beneficial articles,
              and community service into one calm Islamic platform.
            </p>
          </DrawerAccordion>
          <DrawerAccordion
            id="scholars"
            title="Scholars"
            expanded={expanded}
            setExpanded={setExpanded}
          >
            <p>
              Scholar profiles and Tafseer authors can be managed from the admin
              panel as the knowledge library grows.
            </p>
          </DrawerAccordion>
          <DrawerAccordion
            id="partners"
            title="Partners"
            expanded={expanded}
            setExpanded={setExpanded}
          >
            <p>
              Use the admin Site Builder to keep partners, supporters, and
              community information current.
            </p>
          </DrawerAccordion>
        </div>
      </aside>
    </div>
  );
}

function DrawerAccordion({ id, title, expanded, setExpanded, children }) {
  const isOpen = expanded === id;

  return (
    <section className="global-site-drawer__accordion">
      <button
        type="button"
        onClick={() => setExpanded(isOpen ? "" : id)}
        aria-expanded={isOpen}
      >
        {title}
        <i className={`fa-solid fa-chevron-${isOpen ? "down" : "right"}`} />
      </button>
      {isOpen ? <div>{children}</div> : null}
    </section>
  );
}
