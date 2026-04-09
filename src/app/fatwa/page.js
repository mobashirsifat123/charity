"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

import BreadcrumbOne from "@/components/BreadcrumbOne";
import FooterOne from "@/components/FooterOne";
import HeaderOne from "@/components/HeaderOne";
import { useLanguage } from "@/context/LanguageContext";
import { fetchPublishedFatwas } from "@/lib/content-data";
import {
  buildContentIdentifier,
  getContentCategory,
  getContentPath,
  getExcerpt,
  normalizeTags,
  sortFeaturedFirst,
} from "@/lib/content-utils";
import { translateFatwaCategory } from "@/lib/i18n";

const ITEMS_PER_PAGE = 12;

export default function FatwaList() {
  const { locale, t } = useLanguage();
  const [fatwas, setFatwas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [category, setCategory] = useState("all");
  const [author, setAuthor] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    let active = true;

    async function loadFatwas() {
      try {
        setLoading(true);
        const result = await fetchPublishedFatwas();
        if (!active) return;
        setFatwas(sortFeaturedFirst(result || []));
      } catch (error) {
        console.error("Error fetching fatwas:", error);
      } finally {
        if (active) setLoading(false);
      }
    }

    loadFatwas();
    return () => {
      active = false;
    };
  }, []);

  const categories = useMemo(
    () => ["all", ...Array.from(new Set(fatwas.map((item) => getContentCategory(item)).filter(Boolean)))],
    [fatwas]
  );

  const authors = useMemo(
    () => ["all", ...Array.from(new Set(fatwas.map((item) => item.author_name).filter(Boolean)))],
    [fatwas]
  );

  const filteredFatwas = useMemo(() => {
    const lowerSearch = searchTerm.trim().toLowerCase();

    return fatwas.filter((fatwa) => {
      const matchesSearch =
        !lowerSearch ||
        (fatwa.title || fatwa.question || "").toLowerCase().includes(lowerSearch) ||
        (fatwa.answer || fatwa.content || "").toLowerCase().includes(lowerSearch) ||
        getContentCategory(fatwa).toLowerCase().includes(lowerSearch) ||
        normalizeTags(fatwa.tags).join(" ").toLowerCase().includes(lowerSearch) ||
        (fatwa.author_name || "").toLowerCase().includes(lowerSearch);

      const matchesCategory = category === "all" || getContentCategory(fatwa) === category;
      const matchesAuthor = author === "all" || (fatwa.author_name || "") === author;

      return matchesSearch && matchesCategory && matchesAuthor;
    });
  }, [fatwas, searchTerm, category, author]);

  const totalPages = Math.max(1, Math.ceil(filteredFatwas.length / ITEMS_PER_PAGE));
  const displayedFatwas = filteredFatwas.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const latestFatwas = useMemo(
    () =>
      [...fatwas]
        .sort((left, right) => new Date(right.created_at || 0) - new Date(left.created_at || 0))
        .slice(0, 8),
    [fatwas]
  );

  const resetToFirstPage = () => setCurrentPage(1);

  return (
    <>
      <HeaderOne />
      <BreadcrumbOne
        title={t("fatwasAndRulings", "Fatwas & Rulings")}
        links={[
          { name: t("home", "Home"), link: "/" },
          { name: t("fatwa", "Fatwa"), link: "/fatwa" },
        ]}
      />

      <section className="py-5 bg-white">
        <div className="container">
          <div className="row g-4">
            <aside className="col-lg-4 col-xl-3">
              <div className="islamweb-like-panel sticky-lg-top" style={{ top: "110px" }}>
                <div className="islamweb-like-block">
                  <h5 className="islamweb-like-block-title">By Subject</h5>
                  <ul className="islamweb-like-list">
                    {categories.map((item) => (
                      <li key={item}>
                        <button
                          type="button"
                          className={`islamweb-like-filter-btn ${category === item ? "active" : ""}`}
                          onClick={() => {
                            setCategory(item);
                            resetToFirstPage();
                          }}
                        >
                          {item === "all" ? t("allTopics", "All topics") : translateFatwaCategory(locale, item)}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="islamweb-like-block">
                  <h5 className="islamweb-like-block-title">By Author</h5>
                  <ul className="islamweb-like-list islamweb-like-scroll">
                    {authors.map((item) => (
                      <li key={item}>
                        <button
                          type="button"
                          className={`islamweb-like-filter-btn ${author === item ? "active" : ""}`}
                          onClick={() => {
                            setAuthor(item);
                            resetToFirstPage();
                          }}
                        >
                          {item === "all" ? "All scholars" : item}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="islamweb-like-block">
                  <h5 className="islamweb-like-block-title">New Fatwas</h5>
                  <ul className="islamweb-like-list">
                    {latestFatwas.map((fatwa) => (
                      <li key={buildContentIdentifier(fatwa, "fatwa")}>
                        <Link href={getContentPath("fatwa", fatwa)} className="islamweb-like-mini-link">
                          {fatwa.title || fatwa.question || "Untitled Fatwa"}
                        </Link>
                      </li>
                    ))}
                    {!latestFatwas.length ? (
                      <li className="text-muted small">No published fatwas yet.</li>
                    ) : null}
                  </ul>
                </div>
              </div>
            </aside>

            <div className="col-lg-8 col-xl-9">
              <div className="islamweb-like-feed">
                <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
                  <h2 className="mb-0">{t("fatwasAndRulings", "Fatwas & Rulings")}</h2>
                  <div className="d-flex align-items-center gap-3">
                    <span className="text-muted small">
                      {filteredFatwas.length} item{filteredFatwas.length === 1 ? "" : "s"}
                    </span>
                    <Link href="/request-fatwa" className="btn btn-sm btn-outline-primary">
                      {t("requestFatwa", "Request Fatwa")}
                    </Link>
                  </div>
                </div>

                <div className="compact-directory-toolbar mb-4">
                  <div className="row g-2 align-items-end">
                    <div className="col-lg-5">
                      <label className="compact-directory-label">{t("search", "Search")}</label>
                      <input
                        type="text"
                        className="form-control compact-directory-input"
                        placeholder={t("searchFatwasPlaceholder", "Search by topic, question, tag, or scholar...")}
                        value={searchTerm}
                        onChange={(event) => {
                          setSearchTerm(event.target.value);
                          resetToFirstPage();
                        }}
                      />
                    </div>
                    <div className="col-md-6 col-lg-3">
                      <label className="compact-directory-label">Topic</label>
                      <select
                        className="form-select compact-directory-input"
                        value={category}
                        onChange={(event) => {
                          setCategory(event.target.value);
                          resetToFirstPage();
                        }}
                      >
                        {categories.map((item) => (
                          <option key={item} value={item}>
                            {item === "all" ? t("allTopics", "All topics") : translateFatwaCategory(locale, item)}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="col-md-6 col-lg-3">
                      <label className="compact-directory-label">Scholar</label>
                      <select
                        className="form-select compact-directory-input"
                        value={author}
                        onChange={(event) => {
                          setAuthor(event.target.value);
                          resetToFirstPage();
                        }}
                      >
                        {authors.map((item) => (
                          <option key={item} value={item}>
                            {item === "all" ? "All scholars" : item}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="col-lg-1">
                      <button
                        type="button"
                        className="btn btn-light compact-directory-reset w-100"
                        onClick={() => {
                          setSearchTerm("");
                          setCategory("all");
                          setAuthor("all");
                          resetToFirstPage();
                        }}
                        aria-label="Reset filters"
                        title="Reset filters"
                      >
                        <i className="fa-solid fa-rotate-left" />
                      </button>
                    </div>
                  </div>
                </div>

                {loading ? (
                  <div className="p-4 text-muted">Loading fatwas...</div>
                ) : !displayedFatwas.length ? (
                  <div className="p-4 border rounded-3 text-muted">
                    {t("noRulingsFound", "No rulings found")} - {t("fatwaFilterEmpty", "Could not find any fatwa matching your current filters.")}
                  </div>
                ) : (
                  <div className="islamweb-like-items">
                    {displayedFatwas.map((fatwa) => (
                      <article className="islamweb-like-item" key={buildContentIdentifier(fatwa, "fatwa")}>
                        <h3 className="islamweb-like-item-title">
                          <Link href={getContentPath("fatwa", fatwa)}>
                            {fatwa.title || fatwa.question || "Untitled Fatwa"}
                          </Link>
                        </h3>
                        <p className="islamweb-like-item-excerpt">
                          {getExcerpt(fatwa.answer || fatwa.content || "", 300)}
                        </p>
                        <div className="islamweb-like-item-meta">
                          <span>{translateFatwaCategory(locale, getContentCategory(fatwa))}</span>
                          <span>•</span>
                          <span>{fatwa.author_name || "IRWA Scholar"}</span>
                          <span>•</span>
                          <span>
                            {new Date(fatwa.created_at).toLocaleDateString(
                              locale === "ar" ? "ar" : "en-US",
                              { year: "numeric", month: "2-digit", day: "2-digit" }
                            )}
                          </span>
                        </div>
                        <Link href={getContentPath("fatwa", fatwa)} className="islamweb-like-more">
                          More
                        </Link>
                      </article>
                    ))}
                  </div>
                )}

                {totalPages > 1 ? (
                  <nav className="mt-4" aria-label="Fatwas pagination">
                    <ul className="pagination mb-0">
                      <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
                        <button
                          type="button"
                          className="page-link"
                          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                        >
                          Previous
                        </button>
                      </li>
                      {Array.from({ length: totalPages }).map((_, index) => (
                        <li
                          key={index + 1}
                          className={`page-item ${currentPage === index + 1 ? "active" : ""}`}
                        >
                          <button
                            type="button"
                            className="page-link"
                            onClick={() => setCurrentPage(index + 1)}
                          >
                            {index + 1}
                          </button>
                        </li>
                      ))}
                      <li className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}>
                        <button
                          type="button"
                          className="page-link"
                          onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                        >
                          Next
                        </button>
                      </li>
                    </ul>
                  </nav>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </section>

      <FooterOne />
    </>
  );
}
