"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { usePersonalization } from "@/context/PersonalizationContext";

function isRouteActive(pathname, item) {
  if (item.exact) return pathname === item.href;
  return item.matches.some(
    (match) => pathname === match || pathname.startsWith(`${match}/`),
  );
}

export default function MobileBottomNav({ user, loading, labels }) {
  const pathname = usePathname();
  const { trackFeature } = usePersonalization();
  const profileHref = !loading && user ? "/dashboard" : "/login";
  const items = [
    {
      key: "home",
      href: "/",
      label: labels.home,
      icon: "fa-solid fa-house",
      exact: true,
      matches: ["/"],
    },
    {
      key: "quran",
      href: "/quran",
      label: labels.quran,
      icon: "fa-solid fa-book-quran",
      matches: ["/quran"],
    },
    {
      key: "search",
      href: "/search",
      label: labels.search,
      icon: "fa-solid fa-magnifying-glass",
      matches: ["/search"],
    },
    {
      key: "articles",
      href: "/blog-grid",
      label: labels.articles,
      icon: "fa-regular fa-newspaper",
      matches: ["/blog-grid", "/blog-details"],
    },
    {
      key: "profile",
      href: profileHref,
      label: labels.profile,
      icon: "fa-regular fa-user",
      matches: ["/dashboard", "/login", "/register", "/reset-password"],
    },
  ];

  return (
    <nav className="mobile-bottom-nav" aria-label="Mobile primary navigation">
      <div className="mobile-bottom-nav__items">
        {items.map((item) => {
          const active = isRouteActive(pathname, item);

          return (
            <Link
              key={item.key}
              href={item.href}
              className={`mobile-bottom-nav__item ${active ? "is-active" : ""}`}
              aria-current={active ? "page" : undefined}
              onClick={() =>
                trackFeature({
                  href: item.href,
                  label: item.label,
                  icon: item.icon.replace(/^fa-(solid|regular)\s+/, ""),
                })
              }
            >
              <i className={item.icon} aria-hidden="true" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
