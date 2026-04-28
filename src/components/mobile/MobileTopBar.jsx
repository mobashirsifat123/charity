"use client";

import Image from "next/image";
import Link from "next/link";
import { usePersonalization } from "@/context/PersonalizationContext";

function getAccountInitial(user) {
  return (user?.name || user?.email || "U").charAt(0).toUpperCase();
}

export default function MobileTopBar({ settings, user, loading, onMenuOpen }) {
  const { trackFeature } = usePersonalization();
  const profileHref = user ? "/dashboard" : "/login";
  const profileLabel = user ? "Open profile" : "Log in";
  const logoUrl = settings?.site_logo_url;
  const siteName = settings?.site_name || "IRWAA";

  return (
    <header className="mobile-app-topbar" aria-label="Mobile app header">
      <div className="mobile-app-topbar__inner">
        <Link
          href="/"
          className="mobile-app-topbar__brand"
          onClick={() =>
            trackFeature({
              href: "/",
              label: "Home",
              icon: "fa-house",
            })
          }
        >
          {logoUrl ? (
            <Image
              src={logoUrl}
              alt={siteName}
              className="mobile-app-topbar__logo"
              width={38}
              height={38}
              priority
            />
          ) : null}
          <span className="mobile-app-topbar__name">IRWAA</span>
        </Link>

        <div className="mobile-app-topbar__actions">
          <Link
            href={profileHref}
            className="mobile-app-topbar__profile"
            aria-label={profileLabel}
            title={profileLabel}
            onClick={() =>
              trackFeature({
                href: profileHref,
                label: user ? "Profile" : "Login",
                icon: "fa-user",
              })
            }
          >
            {!loading && user?.avatar_url ? (
              <Image
                src={user.avatar_url}
                alt={user.name || user.email || "IRWAA member"}
                width={36}
                height={36}
                className="mobile-app-topbar__avatar-image"
              />
            ) : !loading && user ? (
              <span className="mobile-app-topbar__avatar-initial">
                {getAccountInitial(user)}
              </span>
            ) : (
              <i className="fa-regular fa-user" aria-hidden="true" />
            )}
          </Link>

          <button
            type="button"
            className="mobile-app-topbar__menu"
            onClick={onMenuOpen}
            aria-label="Open full site menu"
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </div>
    </header>
  );
}
