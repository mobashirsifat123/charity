"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useSiteSettings } from "@/context/SiteSettingsContext";
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

const formatDate = (dateString) =>
  new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

export default function FatwaHighlights() {
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
      className="py-5 position-relative"
      style={{
        background:
          "linear-gradient(135deg, #0c1f2e 0%, #113553 58%, #0f3b5f 100%)",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(circle at top right, rgba(171,125,44,0.22), transparent 32%)",
          pointerEvents: "none",
        }}
      />
      <div className="container position-relative py-4">
        <div className="row align-items-end g-4 mb-5">
          <div className="col-lg-7" data-aos="fade-up">
            <span
              className="badge px-3 py-2 rounded-pill mb-3 fw-semibold"
              style={{
                background: "rgba(255,255,255,0.12)",
                color: "#f6deb0",
              }}
            >
              {settings.fatwa_highlights_badge || "Featured Fatwas"}
            </span>
            <h2 className="fw-bold text-white mb-3">{settings.fatwa_highlights_title || "Guidance That Answers Real Questions"}</h2>
            <p className="text-white-50 fs-5 mb-0">
              {settings.fatwa_highlights_description || "Highlighting fatwas near the top helps the site feel trusted, useful, and rooted in beneficial knowledge from the first scroll."}
            </p>
          </div>
          <div className="col-lg-5 text-lg-end" data-aos="fade-up" data-aos-delay="100">
            <Link
              href="/fatwa"
              className="btn btn-lg rounded-pill px-5"
              style={{
                background: "#ab7d2c",
                color: "#fff",
                border: "none",
              }}
            >
              {settings.fatwa_highlights_cta_text || "View All Fatwas"} <i className="fa-solid fa-arrow-right ms-2" />
            </Link>
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
                className="h-100 rounded-4 p-4 p-xl-5"
                style={{
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.12)",
                  backdropFilter: "blur(10px)",
                }}
              >
                <div className="d-flex align-items-center justify-content-between gap-3 mb-4">
                  <span
                    className="rounded-pill px-3 py-2 small fw-semibold"
                    style={{
                      background: "rgba(171,125,44,0.16)",
                      color: "#f6deb0",
                    }}
                  >
                    {fatwa.category || "General"}
                  </span>
                  <small className="text-white-50">{formatDate(fatwa.created_at)}</small>
                </div>

                {fatwa.featured ? <span className="badge bg-warning text-dark rounded-pill mb-3 align-self-start">Featured</span> : null}

                <div
                  className="rounded-circle d-flex align-items-center justify-content-center mb-4"
                  style={{
                    width: "56px",
                    height: "56px",
                    background: "rgba(255,255,255,0.08)",
                    color: "#f6deb0",
                  }}
                >
                  <i className="fa-solid fa-scale-balanced fs-4" />
                </div>

                <h4 className="fw-bold text-white mb-3" style={{ lineHeight: 1.4 }}>
                  {fatwa.title || fatwa.question}
                </h4>
                <p className="text-white-50 mb-4">
                  {getExcerpt(fatwa.answer || fatwa.content || "", 165) || "Read the full answer and evidence for this ruling."}
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
                  Read full answer <i className="fa-solid fa-arrow-right ms-2" />
                </Link>
              </article>
            </div>
          ))}
        </div>

        {loading ? <p className="text-white-50 small mt-4 mb-0">Loading latest fatwas...</p> : null}
      </div>
    </section>
  );
}
