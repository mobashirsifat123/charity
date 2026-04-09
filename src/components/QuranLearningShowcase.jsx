"use client";

import Link from "next/link";
import { useSiteSettings } from "@/context/SiteSettingsContext";
import { parseJsonArraySetting } from "@/lib/siteSettings";

const FALLBACK_VIDEOS = [
  {
    title: "Daily Quran Reflection",
    description: "A short reminder connecting one ayah to everyday life and worship.",
    duration: "04:12",
    videoUrl: "https://www.youtube.com/embed/4mM7Yz0vVJg",
    category: "Reflection",
  },
  {
    title: "Tajweed Focus Session",
    description: "A quick guided lesson on pronunciation and recitation improvement.",
    duration: "06:35",
    videoUrl: "https://www.youtube.com/embed/X8K1r5M2d4A",
    category: "Tajweed",
  },
  {
    title: "Memorization Routine",
    description: "A bite-sized method for reviewing and retaining Quran consistently.",
    duration: "05:28",
    videoUrl: "https://www.youtube.com/embed/y8Q4G0FhK0I",
    category: "Hifz",
  },
];

export default function QuranLearningShowcase() {
  const { settings } = useSiteSettings();
  const videos = parseJsonArraySetting(settings.quran_learning_videos_json, FALLBACK_VIDEOS).filter(
    (item) => item && typeof item.title === "string" && typeof item.videoUrl === "string"
  );

  return (
    <section className="py-5 page-surface-alt section-shell quran-learning-showcase">
      <div className="container py-4">
        <div className="row align-items-end g-4 mb-5">
          <div className="col-lg-7">
            <span className="theme-badge-soft mb-3">
              {settings.quran_learning_badge || "Learn Quran"}
            </span>
            <h2 className="fw-bold">{settings.quran_learning_title || "A Dedicated Space to Learn Quran"}</h2>
            <p className="text-muted mb-0">
              {settings.quran_learning_description ||
                "Build a steady Quran routine through short guided lessons, recitation-focused videos, and clear next steps for reading and reflection."}
            </p>
          </div>
          <div className="col-lg-5">
            <div className="quran-learning-shell">
              <div className="quran-learning-shell__metric">
                <span className="quran-learning-shell__value">{videos.length}</span>
                <span className="quran-learning-shell__label">Short lessons ready</span>
              </div>
              <div className="quran-learning-shell__metric">
                <span className="quran-learning-shell__value">30</span>
                <span className="quran-learning-shell__label">Juz learning path</span>
              </div>
              <div className="quran-learning-shell__metric">
                <span className="quran-learning-shell__value">114</span>
                <span className="quran-learning-shell__label">Surahs to explore</span>
              </div>
            </div>
          </div>
        </div>

        <div className="row g-4">
          {videos.map((video, index) => (
            <div className="col-lg-4" key={`${video.title}-${index}`}>
              <article className="quran-video-card h-100">
                <div className="quran-video-card__frame">
                  <iframe
                    src={video.videoUrl}
                    title={video.title}
                    loading="lazy"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
                <div className="quran-video-card__body">
                  <div className="d-flex justify-content-between align-items-center gap-3 mb-3">
                    <span className="theme-badge-soft mb-0">{video.category || "Quran"}</span>
                    <span className="quran-video-card__duration">{video.duration || "Short video"}</span>
                  </div>
                  <h3 className="quran-video-card__title">{video.title}</h3>
                  <p className="quran-video-card__description">{video.description}</p>
                </div>
              </article>
            </div>
          ))}
        </div>

        <div className="text-center mt-5">
          <Link
            href={settings.quran_learning_cta_link || "/quran"}
            className="btn btn-primary btn-lg rounded-pill px-5 btn-ripple"
          >
            {settings.quran_learning_cta_text || "Open Quran Hub"} <i className="fa-solid fa-arrow-right ms-2" />
          </Link>
        </div>
      </div>
    </section>
  );
}
