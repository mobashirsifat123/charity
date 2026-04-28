"use client";

import Link from "next/link";

export default function MobileSectionHeader({
  eyebrow,
  title,
  actionHref,
  actionLabel = "View all",
  className = "",
}) {
  return (
    <div className={`mobile-section-header ${className}`}>
      <div>
        {eyebrow ? (
          <span className="mobile-section-header__eyebrow">{eyebrow}</span>
        ) : null}
        <h2>{title}</h2>
      </div>
      {actionHref ? (
        <Link href={actionHref} className="mobile-section-header__action">
          {actionLabel}
        </Link>
      ) : null}
    </div>
  );
}
