"use client";

import Link from "next/link";
import MobileSectionHeader from "@/components/mobile/MobileSectionHeader";
import {
  MobileArticleCard,
  MobileTextCard,
} from "@/components/mobile/MobileCard";
import {
  getContentPath,
  getExcerpt,
  getContentCategory,
} from "@/lib/content-utils";
import { usePersonalization } from "@/context/PersonalizationContext";

const FEATURES = [
  { href: "/quran", label: "Quran", icon: "fa-book-quran" },
  { href: "/blog-grid", label: "Articles", icon: "fa-newspaper" },
  { href: "/fatwa", label: "Fatwas", icon: "fa-scale-balanced" },
  { href: "/ebooks", label: "E-books", icon: "fa-book" },
  { href: "/#prayer-qibla", label: "Prayer & Qibla", icon: "fa-compass" },
  { href: "/courses", label: "Courses", icon: "fa-graduation-cap" },
  { href: "/donation", label: "Donate", icon: "fa-hand-holding-heart" },
  { href: "/dashboard", label: "Profile", icon: "fa-user" },
];

export default function MobileHomeDashboard({
  articles = [],
  fatwas = [],
  prayerData = null,
}) {
  const { hydrated, recentlyViewed, lastFeature, trackFeature } =
    usePersonalization();
  const timings = prayerData?.timings || prayerData?.data?.timings || {};
  const nextPrayer =
    Object.entries(timings).find(([name]) =>
      ["Fajr", "Dhuhr", "Asr", "Maghrib", "Isha"].includes(name),
    ) || [];

  return (
    <section className="mobile-home-dashboard d-md-none">
      <div className="mobile-home-dashboard__header">
        <span>Today</span>
        <h1>IRWAA</h1>
      </div>

      <div className="mobile-feature-grid">
        {FEATURES.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`mobile-feature-tile ${
              lastFeature?.href === item.href ? "is-last-used" : ""
            }`}
            onClick={() => trackFeature(item)}
          >
            <i className={`fa-solid ${item.icon}`} />
            <span>{item.label}</span>
          </Link>
        ))}
      </div>

      {hydrated && recentlyViewed.length ? (
        <>
          <MobileSectionHeader title="Continue where you left off" />
          <div className="mobile-stack-list">
            {recentlyViewed.map((item) => (
              <MobileTextCard
                key={item.href}
                href={item.href}
                title={item.title}
                excerpt={item.excerpt}
                meta={[item.typeLabel || item.type]}
                icon={
                  item.type === "ebook"
                    ? "fa-book"
                    : item.type === "fatwa"
                      ? "fa-scale-balanced"
                      : "fa-newspaper"
                }
              />
            ))}
          </div>
        </>
      ) : null}

      <section className="mobile-prayer-card" id="prayer-qibla">
        <div>
          <span>Prayer & Qibla</span>
          <strong>{nextPrayer[0] || "Prayer times"}</strong>
          <small>{nextPrayer[1] || "Use location for local timing"}</small>
        </div>
        <Link href="/#prayer-qibla" aria-label="Open prayer and qibla">
          <i className="fa-solid fa-compass" />
        </Link>
      </section>

      <MobileSectionHeader title="Latest Articles" actionHref="/blog-grid" />
      <div className="mobile-stack-list">
        {articles.slice(0, 3).map((article) => (
          <MobileArticleCard
            key={article.id}
            href={getContentPath("blog", article)}
            title={article.title || "Untitled Article"}
            excerpt={getExcerpt(article.content || "", 96)}
            image={article.image_url}
            label={getContentCategory(article)}
          />
        ))}
      </div>

      <MobileSectionHeader title="Latest Fatwas" actionHref="/fatwa" />
      <div className="mobile-stack-list">
        {fatwas.slice(0, 3).map((fatwa) => (
          <MobileTextCard
            key={fatwa.id}
            href={getContentPath("fatwa", fatwa)}
            title={fatwa.title || fatwa.question || "Untitled Fatwa"}
            excerpt={getExcerpt(fatwa.answer || fatwa.content || "", 110)}
            meta={[
              getContentCategory(fatwa),
              fatwa.author_name || "IRWA Scholar",
            ]}
            icon="fa-scale-balanced"
          />
        ))}
      </div>
    </section>
  );
}
