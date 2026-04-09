"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";
import { useSiteSettings } from "@/context/SiteSettingsContext";
import { translateFatwaCategory } from "@/lib/i18n";
import { fetchPublishedFatwas } from "@/lib/content-data";
import { getContentPath, getExcerpt, normalizeTags } from "@/lib/content-utils";

const FALLBACK_FATWAS = [
  {
    id: "fallback-fatwa-1",
    title: "Balancing Charity Work and Seeking Knowledge",
    answer:
      "Serving people is a noble act, but it should be guided by sound knowledge, sincerity, and wisdom so that benefit is lasting and pleasing to Allah.",
    category: "Dawah",
    created_at: "2026-03-11T00:00:00.000Z",
  },
  {
    id: "fallback-fatwa-2",
    title: "How Should We Speak to People About Islam Online?",
    answer:
      "Online dawah should be rooted in truth, gentleness, and clear evidence. The goal is guidance, not argument for its own sake.",
    category: "Manners",
    created_at: "2026-03-07T00:00:00.000Z",
  },
  {
    id: "fallback-fatwa-3",
    title: "Is Community Service Part of a Strong Dawah Effort?",
    answer:
      "Yes, when it is done with sincerity and within the guidance of Islam. Good service can open hearts and support the wider mission of guidance.",
    category: "Community",
    created_at: "2026-03-01T00:00:00.000Z",
  },
];

const formatDate = (dateString, locale) =>
  new Date(dateString).toLocaleDateString(locale === "ar" ? "ar" : "en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

export default function FatwaHighlights() {
  const { locale, t } = useLanguage();
  const { settings } = useSiteSettings();
  const [fatwas, setFatwas] = useState(FALLBACK_FATWAS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const fetchFatwas = async () => {
      try {
        const data = await fetchPublishedFatwas(3);
        if (active && data?.length) {
          setFatwas(data);
        }
      } catch (error) {
        console.error("Error fetching homepage fatwas:", error.message);
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    fetchFatwas();

    return () => {
      active = false;
    };
  }, []);

  return (
    <section
      className="py-5 position-relative aurora-grid"
      style={{
        background:
          "linear-gradient(135deg, #0a281f 0%, #0b3d2e 58%, #145a32 100%)",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(circle at top right, rgba(200,169,81,0.24), transparent 32%)",
          pointerEvents: "none",
        }}
      />
      <div className="container position-relative py-4">
        <div className="row align-items-end g-4 mb-5">
          <div className="col-lg-7" data-aos="fade-up">
            <span className="signal-chip mb-3">
              <span className="signal-chip__dot" />
              {settings.fatwa_highlights_badge || "Featured Fatwas"}
            </span>
            <h2 className="fw-bold text-white mb-3">{settings.fatwa_highlights_title || "Guidance That Answers Real Questions"}</h2>
            <p className="text-white-50 fs-5 mb-0">
              {settings.fatwa_highlights_description || "Highlighting fatwas near the top helps the site feel trusted, useful, and rooted in beneficial knowledge from the first scroll."}
            </p>
          </div>
          <div className="col-lg-5" data-aos="fade-up" data-aos-delay="100">
            <div className="glass-surface rounded-4 p-4 p-xl-4">
              <div className="d-flex flex-wrap gap-2 mb-4">
                {["Public answers", "Real questions", "Knowledge-led"].map((item, index) => (
                  <span key={item} className="signal-chip">
                    <span className={`signal-chip__dot ${index === 1 ? "signal-chip__dot--green" : index === 2 ? "signal-chip__dot--soft" : ""}`} />
                    {item}
                  </span>
                ))}
              </div>
              <div className="workflow-panel">
                <div className="workflow-node ps-3 mb-3">
                  <strong className="d-block text-white">Questions arrive from the community</strong>
                  <small className="text-white-50">Relevant, public guidance stays visible and searchable.</small>
                </div>
                <div className="workflow-node ps-3">
                  <strong className="d-block text-white">Answers stay calm and readable</strong>
                  <small className="text-white-50">A cleaner format helps visitors trust and revisit the section.</small>
                </div>
              </div>
              <Link
                href="/fatwa"
                className="btn btn-lg rounded-pill px-5 btn-ripple mt-4"
                style={{
                  background: "var(--accent-color)",
                  color: "#fff",
                  border: "none",
                }}
              >
                {settings.fatwa_highlights_cta_text || "View All Fatwas"} <i className="fa-solid fa-arrow-right ms-2" />
              </Link>
            </div>
          </div>
        </div>

        <div className="row g-4">
          {fatwas.map((fatwa, index) => (
            <div
              key={fatwa.id}
              className="col-lg-4 col-md-6"
              data-aos="fade-up"
              data-aos-delay={index * 120}
            >
              <article
                className="h-100 rounded-4 p-4 p-xl-5 glass-surface"
                style={{
                  boxShadow: "0 16px 30px rgba(0,0,0,0.08)",
                }}
              >
                <div className="d-flex align-items-center justify-content-between gap-3 mb-4">
                  <span
                    className="rounded-pill px-3 py-2 small fw-semibold"
                    style={{
                      background: "rgba(200,169,81,0.16)",
                      color: "#f6deb0",
                    }}
                  >
                    {translateFatwaCategory(locale, fatwa.category || "General")}
                  </span>
                  <small className="text-white-50">{formatDate(fatwa.created_at, locale)}</small>
                </div>

                {fatwa.featured ? <span className="badge bg-warning text-dark rounded-pill mb-3 align-self-start">{t("featured", "Featured")}</span> : null}

                <div
                  className="rounded-circle d-flex align-items-center justify-content-center mb-4"
                  style={{
                    width: "56px",
                    height: "56px",
                    background: "rgba(255,255,255,0.08)",
                    color: "var(--accent-color)",
                  }}
                >
                  <i className="fa-solid fa-scale-balanced fs-4" />
                </div>

                <h4 className="fw-bold text-white mb-3" style={{ lineHeight: 1.4 }}>
                  {fatwa.title || fatwa.question}
                </h4>
                <p className="text-white-50 mb-4">
                  {getExcerpt(fatwa.answer || fatwa.content || "", 165) || t("readFullAnswer", "Read Full Answer")}
                </p>
                <div className="d-flex flex-wrap gap-2 mb-4">
                  {normalizeTags(fatwa.tags).slice(0, 3).map((tag) => (
                    <span key={tag} className="badge bg-light text-dark border">
                      {tag}
                    </span>
                  ))}
                </div>

                <Link
                  href={getContentPath("fatwa", fatwa)}
                  className="text-decoration-none fw-semibold"
                  style={{ color: "#fff" }}
                >
                  {t("readFullAnswer", "Read Full Answer")} <i className="fa-solid fa-arrow-right ms-2" />
                </Link>
              </article>
            </div>
          ))}
        </div>

        {loading ? <p className="text-white-50 small mt-4 mb-0">{t("loadingLatestFatwas", "Loading latest fatwas...")}</p> : null}
      </div>
    </section>
  );
}
