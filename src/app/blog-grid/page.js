"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

import BreadcrumbOne from "@/components/BreadcrumbOne";
import FooterOne from "@/components/FooterOne";
import HeaderOne from "@/components/HeaderOne";
import { useLanguage } from "@/context/LanguageContext";
import { fetchPublishedBlogs } from "@/lib/content-data";
import {
  buildContentIdentifier,
  getContentCategory,
  getContentPath,
  getExcerpt,
  normalizeTags,
  sortFeaturedFirst,
} from "@/lib/content-utils";

const ITEMS_PER_PAGE = 12;

export default function BlogGrid() {
  const { locale, t } = useLanguage();
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [category, setCategory] = useState("all");
  const [author, setAuthor] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    let active = true;

    async function loadArticles() {
      try {
        setLoading(true);
        const result = await fetchPublishedBlogs();
        if (!active) return;
        setArticles(sortFeaturedFirst(result || []));
      } catch (error) {
        console.error("Error fetching articles:", error);
      } finally {
        if (active) setLoading(false);
      }
    }

    loadArticles();
    return () => {
      active = false;
    };
  }, []);

  const categories = useMemo(
    () => ["all", ...Array.from(new Set(articles.map((item) => getContentCategory(item)).filter(Boolean)))],
    [articles]
  );

  const authors = useMemo(
    () => ["all", ...Array.from(new Set(articles.map((item) => item.author_name).filter(Boolean)))],
    [articles]
  );

  const filteredArticles = useMemo(() => {
    const lowerSearch = searchTerm.trim().toLowerCase();

    return articles.filter((article) => {
      const matchesSearch =
        !lowerSearch ||
        article.title?.toLowerCase().includes(lowerSearch) ||
        article.content?.toLowerCase().includes(lowerSearch) ||
        getContentCategory(article).toLowerCase().includes(lowerSearch) ||
        normalizeTags(article.tags).join(" ").toLowerCase().includes(lowerSearch) ||
        (article.author_name || "").toLowerCase().includes(lowerSearch);

      const matchesCategory = category === "all" || getContentCategory(article) === category;
      const matchesAuthor = author === "all" || (article.author_name || "") === author;

      return matchesSearch && matchesCategory && matchesAuthor;
    });
  }, [articles, searchTerm, category, author]);

  const totalPages = Math.max(1, Math.ceil(filteredArticles.length / ITEMS_PER_PAGE));
  const displayedArticles = filteredArticles.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const latestArticles = useMemo(
    () =>
      [...articles]
        .sort((left, right) => new Date(right.created_at || 0) - new Date(left.created_at || 0))
        .slice(0, 8),
    [articles]
  );

  const resetToFirstPage = () => setCurrentPage(1);

  return (
    <>
      <HeaderOne />
      <BreadcrumbOne
        title={t("articles", "Articles")}
        links={[
          { name: t("home", "Home"), link: "/" },
          { name: t("articles", "Articles"), link: "/blog-grid" },
        ]}
      />

      <section className="py-5 bg-white">
        <div className="container">
          <div className="row g-4">
            <aside className="col-lg-4 col-xl-3">
              <div className="islamweb-like-panel sticky-lg-top" style={{ top: "110px" }}>
                <div className="islamweb-like-block">
                  <h5 className="islamweb-like-block-title">{t("search", "Search")}</h5>
                  <input
                    type="text"
                    className="form-control"
                    placeholder={t("searchArticlesPlaceholder", "Search articles, tags, or topics...")}
                    value={searchTerm}
                    onChange={(event) => {
                      setSearchTerm(event.target.value);
                      resetToFirstPage();
                    }}
                  />
                </div>

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
                          {item === "all" ? t("allCategories", "All categories") : item}
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
                          {item === "all" ? "All authors" : item}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="islamweb-like-block">
                  <h5 className="islamweb-like-block-title">New Articles</h5>
                  <ul className="islamweb-like-list">
                    {latestArticles.map((article) => (
                      <li key={buildContentIdentifier(article, "article")}>
                        <Link href={getContentPath("blog", article)} className="islamweb-like-mini-link">
                          {article.title}
                        </Link>
                      </li>
                    ))}
                    {!latestArticles.length ? (
                      <li className="text-muted small">No published articles yet.</li>
                    ) : null}
                  </ul>
                </div>
              </div>
            </aside>

            <div className="col-lg-8 col-xl-9">
              <div className="islamweb-like-feed">
                <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
                  <h2 className="mb-0">{t("articles", "Articles")}</h2>
                  <span className="text-muted small">
                    {filteredArticles.length} item{filteredArticles.length === 1 ? "" : "s"}
                  </span>
                </div>

                {loading ? (
                  <div className="p-4 text-muted">Loading articles...</div>
                ) : !displayedArticles.length ? (
                  <div className="p-4 border rounded-3 text-muted">
                    {t("noArticlesFound", "No articles found")} - {t("adjustSearchOrCategory", "Try adjusting your search or category filter.")}
                  </div>
                ) : (
                  <div className="islamweb-like-items">
                    {displayedArticles.map((article) => (
                      <article className="islamweb-like-item" key={buildContentIdentifier(article, "article")}>
                        <h3 className="islamweb-like-item-title">
                          <Link href={getContentPath("blog", article)}>{article.title}</Link>
                        </h3>
                        <p className="islamweb-like-item-excerpt">
                          {getExcerpt(article.content || "", 300)}
                        </p>
                        <div className="islamweb-like-item-meta">
                          <span>{getContentCategory(article)}</span>
                          <span>•</span>
                          <span>{article.author_name || "IRWA Editorial Team"}</span>
                          <span>•</span>
                          <span>
                            {new Date(article.created_at).toLocaleDateString(
                              locale === "ar" ? "ar" : "en-US",
                              { year: "numeric", month: "2-digit", day: "2-digit" }
                            )}
                          </span>
                        </div>
                        <Link href={getContentPath("blog", article)} className="islamweb-like-more">
                          More
                        </Link>
                      </article>
                    ))}
                  </div>
                )}

                {totalPages > 1 ? (
                  <nav className="mt-4" aria-label="Articles pagination">
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
