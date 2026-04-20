"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import HeaderOne from "@/components/HeaderOne";
import FooterOne from "@/components/FooterOne";
import BreadcrumbOne from "@/components/BreadcrumbOne";
import { useLanguage } from "@/context/LanguageContext";
import {
  fetchPublishedBlogs,
  fetchPublishedFatwas,
  getUnifiedSearchResults,
} from "@/lib/content-data";
import {
  getContentCategory,
  getContentPath,
  getExcerpt,
  normalizeTags,
} from "@/lib/content-utils";

export default function SearchPage() {
  const { t } = useLanguage();
  const [query, setQuery] = useState("");
  const [type, setType] = useState("all");
  const [category, setCategory] = useState("all");
  const [blogs, setBlogs] = useState([]);
  const [fatwas, setFatwas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params =
      typeof window !== "undefined"
        ? new URLSearchParams(window.location.search)
        : new URLSearchParams();
    setQuery(params.get("q") || "");
    setType(params.get("type") || "all");
    setCategory(params.get("category") || "all");
  }, []);

  useEffect(() => {
    let active = true;

    const fetchAll = async () => {
      try {
        setLoading(true);
        const [blogData, fatwaData] = await Promise.all([
          fetchPublishedBlogs(),
          fetchPublishedFatwas(),
        ]);
        if (active) {
          setBlogs(blogData);
          setFatwas(fatwaData);
        }
      } catch (error) {
        console.error("Unified search load error:", error);
      } finally {
        if (active) setLoading(false);
      }
    };

    fetchAll();

    return () => {
      active = false;
    };
  }, []);

  const categories = useMemo(() => {
    const combined = [...blogs, ...fatwas].map((item) =>
      getContentCategory(item),
    );
    return ["all", ...Array.from(new Set(combined.filter(Boolean)))];
  }, [blogs, fatwas]);

  const results = useMemo(
    () => getUnifiedSearchResults({ blogs, fatwas, query, type, category }),
    [blogs, fatwas, query, type, category],
  );

  return (
    <section className="page-wrapper">
      <HeaderOne />
      <BreadcrumbOne
        title={t("search", "Search")}
        links={[
          { name: t("home", "Home"), link: "/" },
          { name: t("search", "Search"), link: "/search" },
        ]}
      />
      <div className="container py-5">
        <div className="card border-0 shadow-sm rounded-4 mb-4">
          <div className="card-body p-4">
            <div className="row g-3">
              <div className="col-lg-6">
                <label className="form-label fw-semibold">
                  {t("searchArticlesAndFatwas", "Search articles and fatwas")}
                </label>
                <input
                  type="text"
                  className="form-control"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={t(
                    "searchByTopic",
                    "Search by topic, title, tag, or author...",
                  )}
                />
              </div>
              <div className="col-lg-3">
                <label className="form-label fw-semibold">
                  {t("contentType", "Content type")}
                </label>
                <select
                  className="form-select"
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                >
                  <option value="all">{t("allContent", "All content")}</option>
                  <option value="blog">{t("articles", "Articles")}</option>
                  <option value="fatwa">{t("fatwas", "Fatwas")}</option>
                </select>
              </div>
              <div className="col-lg-3">
                <label className="form-label fw-semibold">
                  {t("category", "Category")}
                </label>
                <select
                  className="form-select"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  {categories.map((option) => (
                    <option key={option} value={option}>
                      {option === "all"
                        ? t("allCategories", "All categories")
                        : option}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary"></div>
          </div>
        ) : results.length === 0 ? (
          <div className="text-center py-5">
            <h4 className="fw-bold">
              {t("noResultsFound", "No results found")}
            </h4>
            <p className="text-muted">
              {t(
                "tryDifferentSearch",
                "Try another keyword, content type, or category.",
              )}
            </p>
          </div>
        ) : (
          <div className="row g-4">
            {results.map((item) => (
              <div key={`${item.contentType}-${item.id}`} className="col-lg-6">
                <div className="card border-0 shadow-sm rounded-4 h-100">
                  <div className="card-body p-4">
                    <div className="d-flex justify-content-between align-items-center gap-3 mb-3">
                      <span
                        className={`badge rounded-pill ${item.contentType === "blog" ? "bg-primary" : "bg-success"}`}
                      >
                        {item.contentType === "blog"
                          ? t("article", "Article")
                          : t("fatwa", "Fatwa")}
                      </span>
                      <span className="text-muted small">
                        {getContentCategory(item)}
                      </span>
                    </div>
                    <h4 className="fw-bold mb-3">{item.displayTitle}</h4>
                    <p className="text-muted mb-3">
                      {getExcerpt(
                        item.contentType === "fatwa"
                          ? item.answer || item.content || ""
                          : item.content || "",
                        160,
                      )}
                    </p>
                    <div className="d-flex flex-wrap gap-2 mb-4">
                      {normalizeTags(item.tags)
                        .slice(0, 4)
                        .map((tag) => (
                          <span
                            key={tag}
                            className="badge bg-light text-dark border"
                          >
                            {tag}
                          </span>
                        ))}
                    </div>
                    <Link
                      href={getContentPath(item.contentType, item)}
                      className="fw-semibold text-decoration-none"
                    >
                      {t("openResult", "Open result")}{" "}
                      <i className="fa-solid fa-arrow-right ms-2"></i>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <FooterOne />
    </section>
  );
}
