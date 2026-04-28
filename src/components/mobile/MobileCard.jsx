"use client";

import Image from "next/image";
import Link from "next/link";

export function MobileArticleCard({
  href,
  title,
  excerpt,
  image,
  meta = [],
  label,
}) {
  return (
    <article className="mobile-card mobile-card--article">
      <Link href={href} className="mobile-card__link">
        {image ? (
          <span className="mobile-card__media">
            <Image src={image} alt={title} width={420} height={260} />
          </span>
        ) : null}
        <span className="mobile-card__body">
          {label ? <span className="mobile-card__label">{label}</span> : null}
          <strong>{title}</strong>
          {excerpt ? (
            <span className="mobile-card__excerpt">{excerpt}</span>
          ) : null}
          {meta.length ? (
            <span className="mobile-card__meta">
              {meta.filter(Boolean).join(" • ")}
            </span>
          ) : null}
        </span>
      </Link>
    </article>
  );
}

export function MobileTextCard({ href, title, excerpt, meta = [], icon }) {
  return (
    <article className="mobile-card mobile-card--text">
      <Link href={href} className="mobile-card__link">
        <span className="mobile-card__icon">
          <i className={`fa-solid ${icon || "fa-book-open"}`} />
        </span>
        <span className="mobile-card__body">
          <strong>{title}</strong>
          {excerpt ? (
            <span className="mobile-card__excerpt">{excerpt}</span>
          ) : null}
          {meta.length ? (
            <span className="mobile-card__meta">
              {meta.filter(Boolean).join(" • ")}
            </span>
          ) : null}
        </span>
      </Link>
    </article>
  );
}

export function MobileBookCard({ href, title, author, category, pages }) {
  return (
    <article className="mobile-book-card">
      <Link href={href}>
        <span className="mobile-book-card__cover">
          <i className="fa-solid fa-book" />
          <small>{category}</small>
        </span>
        <span className="mobile-book-card__body">
          <strong>{title}</strong>
          <small>{author}</small>
          <em>{pages} pages</em>
        </span>
      </Link>
    </article>
  );
}
