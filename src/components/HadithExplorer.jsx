"use client";

import { useEffect, useMemo, useState } from "react";
import { useSiteSettings } from "@/context/SiteSettingsContext";

const QUICK_TOPICS = [
  { label: "Intentions", query: "intentions", icon: "fa-bullseye" },
  { label: "Quran", query: "quran", icon: "fa-book-quran" },
  { label: "Mercy", query: "mercy", icon: "fa-hand-holding-heart" },
  { label: "Manners", query: "speak good", icon: "fa-comments" },
];

const FEATURE_CARDS = [
  {
    title: "Hadith Search",
    description: "Find narrations by text, narrator, source, or topic.",
    icon: "fa-magnifying-glass",
  },
  {
    title: "Authenticity Grades",
    description: "Show grading, scholar attribution, and source details.",
    icon: "fa-certificate",
  },
  {
    title: "Similar Narrations",
    description: "Prepare paths for similar, alternate, and usul lookups.",
    icon: "fa-code-branch",
  },
  {
    title: "Sharh Support",
    description: "Ready for hadith explanation endpoints when enabled.",
    icon: "fa-book-open-reader",
  },
  {
    title: "Topic Categories",
    description: "Surface thematic tags so visitors can browse faster.",
    icon: "fa-tags",
  },
  {
    title: "Arabic Library Style",
    description: "A compact, Dorar-inspired utility grid for daily use.",
    icon: "fa-table-cells-large",
  },
];

function getShortText(value = "", length = 190) {
  const text = String(value || "")
    .replace(/\s+/g, " ")
    .trim();
  if (text.length <= length) return text;
  return `${text.slice(0, length).trim()}...`;
}

export default function HadithExplorer() {
  const { settings } = useSiteSettings();
  const [query, setQuery] = useState("intentions");
  const [inputValue, setInputValue] = useState("intentions");
  const [results, setResults] = useState([]);
  const [source, setSource] = useState("fallback");
  const [loading, setLoading] = useState(false);

  const activeTopic = useMemo(
    () => QUICK_TOPICS.find((topic) => topic.query === query),
    [query],
  );

  useEffect(() => {
    let active = true;

    async function fetchHadith() {
      setLoading(true);

      try {
        const response = await fetch(
          `/api/hadith/search?value=${encodeURIComponent(query)}`,
          { cache: "no-store" },
        );
        const payload = await response.json();

        if (!active) return;

        setResults(payload.data || []);
        setSource(payload.source || "fallback");
      } catch (error) {
        console.error("Unable to load hadith results:", error);
        if (active) {
          setResults([]);
          setSource("fallback");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    fetchHadith();

    return () => {
      active = false;
    };
  }, [query]);

  const handleSubmit = (event) => {
    event.preventDefault();
    const nextQuery = inputValue.trim() || "intentions";
    setQuery(nextQuery);
  };

  const primaryHadith = results[0] || null;

  return (
    <section className="hadith-explorer-section section-shell py-5">
      <div className="container py-4">
        <div className="row align-items-end g-4 mb-4">
          <div className="col-lg-7">
            <span className="section-header-rail mb-3">
              {settings.hadith_explorer_badge || "Hadith Utility"}
            </span>
            <h2 className="fw-bold mb-3">
              {settings.hadith_explorer_title ||
                "Search Hadith and Explore Knowledge Faster"}
            </h2>
            <p className="text-muted fs-5 mb-0">
              {settings.hadith_explorer_description ||
                "A Dorar-inspired research panel for quick hadith lookup, authenticity notes, sources, and related learning paths."}
            </p>
          </div>
          <div className="col-lg-5">
            <form className="hadith-mini-search" onSubmit={handleSubmit}>
              <i className="fa-solid fa-magnifying-glass" aria-hidden="true" />
              <input
                type="search"
                value={inputValue}
                onChange={(event) => setInputValue(event.target.value)}
                placeholder="Search hadith text, topic, or narrator..."
              />
              <button type="submit">Search</button>
            </form>
          </div>
        </div>

        <div className="hadith-feature-grid mb-4">
          {FEATURE_CARDS.map((card) => (
            <article
              className="hadith-feature-card hover-lift"
              key={card.title}
            >
              <span className="hadith-feature-card__icon">
                <i className={`fa-solid ${card.icon}`} />
              </span>
              <h3>{card.title}</h3>
              <p>{card.description}</p>
            </article>
          ))}
        </div>

        <div className="row g-4 align-items-stretch">
          <div className="col-lg-4">
            <div className="hadith-topic-panel h-100">
              <h3>Quick Hadith Topics</h3>
              <p>
                Tap a subject to load a useful starting search. Live Dorar-style
                results activate when the proxy URL is configured.
              </p>
              <div className="hadith-topic-list">
                {QUICK_TOPICS.map((topic) => (
                  <button
                    key={topic.query}
                    type="button"
                    className={`hadith-topic-button ${query === topic.query ? "is-active" : ""}`}
                    onClick={() => {
                      setInputValue(topic.query);
                      setQuery(topic.query);
                    }}
                  >
                    <i className={`fa-solid ${topic.icon}`} />
                    <span>{topic.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="col-lg-8">
            <div className="hadith-result-panel h-100">
              <div className="d-flex justify-content-between align-items-center gap-3 mb-3 flex-wrap">
                <div>
                  <span className="hadith-result-panel__eyebrow">
                    {activeTopic?.label || "Search Result"}
                  </span>
                  <h3 className="mb-0">Hadith Preview</h3>
                </div>
                <span className="hadith-source-pill">
                  {source === "dorar-proxy" ? "Live API" : "Fallback Ready"}
                </span>
              </div>

              {loading ? (
                <div className="hadith-loading">Loading hadith results...</div>
              ) : primaryHadith ? (
                <article className="hadith-result-card">
                  <p className="hadith-result-card__text">
                    {getShortText(primaryHadith.hadith)}
                  </p>
                  <div className="hadith-result-card__meta">
                    <span>
                      <strong>Narrator:</strong> {primaryHadith.rawi || "N/A"}
                    </span>
                    <span>
                      <strong>Scholar:</strong> {primaryHadith.mohdith || "N/A"}
                    </span>
                    <span>
                      <strong>Book:</strong> {primaryHadith.book || "N/A"}
                    </span>
                    <span>
                      <strong>Grade:</strong> {primaryHadith.grade || "N/A"}
                    </span>
                  </div>
                  {primaryHadith.categories?.length ? (
                    <div className="hadith-category-row">
                      {primaryHadith.categories.slice(0, 4).map((category) => (
                        <span key={category.id || category.name}>
                          {category.name}
                        </span>
                      ))}
                    </div>
                  ) : null}
                </article>
              ) : (
                <div className="hadith-loading">No hadith results found.</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
