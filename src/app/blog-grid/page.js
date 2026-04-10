"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";

import BreadcrumbOne from "@/components/BreadcrumbOne";
import FooterOne from "@/components/FooterOne";
import HeaderOne from "@/components/HeaderOne";
import { useLanguage } from "@/context/LanguageContext";
import { useSiteSettings } from "@/context/SiteSettingsContext";
import { fetchArticleCategories, fetchPublishedBlogs } from "@/lib/content-data";
import {
  buildContentIdentifier,
  getAuthorName,
  getContentCategory,
  getContentPath,
  getExcerpt,
  normalizeTags,
  sortFeaturedFirst,
} from "@/lib/content-utils";
import { parseJsonArraySetting } from "@/lib/siteSettings";

const FEATURED_COUNT = 3;
const SELECTED_SECTION_ITEM_COUNT = 5;
const LATEST_FEED_COUNT = 10;

function formatArticleDate(dateString, locale) {
  return new Date(dateString || Date.now()).toLocaleDateString(locale === "ar" ? "ar" : "en-US", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

export default function BlogGrid() {
  const { locale, t } = useLanguage();
  const { settings } = useSiteSettings();
  const [articles, setArticles] = useState([]);
  const [categoryRecords, setCategoryRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("all");
  const [selectedAuthor, setSelectedAuthor] = useState("all");

  useEffect(() => {
    let active = true;

    async function loadPageData() {
      try {
        setLoading(true);
        const [articleResult, categoryResult] = await Promise.all([
          fetchPublishedBlogs(),
          fetchArticleCategories().catch(() => []),
        ]);

        if (!active) return;
        setArticles(sortFeaturedFirst(articleResult || []));
        setCategoryRecords(categoryResult || []);
      } catch (error) {
        console.error("Error fetching article directory data:", error);
      } finally {
        if (active) setLoading(false);
      }
    }

    loadPageData();
    return () => {
      active = false;
    };
  }, []);

  const allSubjects = useMemo(() => {
    const categoryNames = categoryRecords.map((item) => item.name).filter(Boolean);
    const fallbackNames = articles.map((item) => getContentCategory(item)).filter(Boolean);
    return ["all", ...Array.from(new Set([...categoryNames, ...fallbackNames]))];
  }, [articles, categoryRecords]);

  const allAuthors = useMemo(
    () => ["all", ...Array.from(new Set(articles.map((item) => getAuthorName(item)).filter(Boolean)))],
    [articles]
  );

  const filteredArticles = useMemo(() => {
    const lowerSearch = searchTerm.trim().toLowerCase();

    return articles.filter((article) => {
      const category = getContentCategory(article);
      const author = getAuthorName(article);
      const haystack = [
        article.title,
        article.content,
        category,
        author,
        normalizeTags(article.tags).join(" "),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const matchesSearch = !lowerSearch || haystack.includes(lowerSearch);
      const matchesSubject = selectedSubject === "all" || category === selectedSubject;
      const matchesAuthor = selectedAuthor === "all" || author === selectedAuthor;

      return matchesSearch && matchesSubject && matchesAuthor;
    });
  }, [articles, searchTerm, selectedSubject, selectedAuthor]);

  const featuredArticles = useMemo(
    () => filteredArticles.filter((item) => item.featured).slice(0, FEATURED_COUNT),
    [filteredArticles]
  );

  const leadArticles = useMemo(() => {
    if (featuredArticles.length >= FEATURED_COUNT) {
      return featuredArticles;
    }

    const selectedIds = new Set(featuredArticles.map((item) => item.id));
    const fallbacks = filteredArticles.filter((item) => !selectedIds.has(item.id)).slice(0, FEATURED_COUNT - featuredArticles.length);
    return [...featuredArticles, ...fallbacks];
  }, [featuredArticles, filteredArticles]);

  const latestArticles = useMemo(
    () => [...filteredArticles].sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0)).slice(0, LATEST_FEED_COUNT),
    [filteredArticles]
  );

  const latestSidebarArticles = latestArticles.slice(0, 6);

  const selectedCategoryNames = useMemo(() => {
    const requested = parseJsonArraySetting(settings.article_directory_selected_categories_json, [])
      .map((value) => String(value || "").trim())
      .filter(Boolean);

    if (requested.length) return requested;

    return allSubjects.filter((item) => item !== "all").slice(0, 3);
  }, [allSubjects, settings.article_directory_selected_categories_json]);

  const selectedSections = useMemo(
    () =>
      selectedCategoryNames
        .map((categoryName) => ({
          title: categoryName,
          items: filteredArticles
            .filter((article) => getContentCategory(article) === categoryName)
            .slice(0, SELECTED_SECTION_ITEM_COUNT),
        }))
        .filter((section) => section.items.length),
    [filteredArticles, selectedCategoryNames]
  );

  return (
    <>
      <HeaderOne />
      <BreadcrumbOne
        title={settings.article_directory_title || t("articles", "Articles")}
        links={[
          { name: t("home", "Home"), link: "/" },
          { name: settings.article_directory_title || t("articles", "Articles"), link: "/blog-grid" },
        ]}
      />

      <section className="article-directory-page py-5 bg-white">
        <div className="container">
          <div className="article-directory-header mb-4">
            <h1 className="article-directory-title mb-3">
              {settings.article_directory_title || t("articles", "Articles")}
            </h1>
            <p className="article-directory-description mb-0">
              {settings.article_directory_description ||
                "Browse beneficial writing, scholar reflections, and practical guidance arranged in a rich editorial directory."}
            </p>
          </div>

          <div className="row g-4">
            <div className="col-xl-8">
              <div className="compact-directory-toolbar mb-4 d-xl-none">
                <div className="row g-2 align-items-end">
                  <div className="col-12">
                    <label className="compact-directory-label">{t("search", "Search")}</label>
                    <input
                      type="text"
                      className="form-control compact-directory-input"
                      placeholder={t("searchArticlesPlaceholder", "Search articles, tags, or topics...")}
                      value={searchTerm}
                      onChange={(event) => setSearchTerm(event.target.value)}
                    />
                  </div>
                  <div className="col-12">
                    <label className="compact-directory-label">Subject</label>
                    <div className="compact-chip-scroll">
                      {allSubjects.map((item) => (
                        <button
                          key={item}
                          type="button"
                          className={`article-directory-chip ${selectedSubject === item ? "is-active" : ""}`}
                          onClick={() => setSelectedSubject(item)}
                        >
                          {item === "all" ? t("allCategories", "All categories") : item}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="article-directory-surface">
                <div className="article-directory-section-header">
                  <h2 className="article-directory-section-title mb-0">
                    {settings.article_directory_featured_title || "Featured Articles"}
                  </h2>
                </div>

                {loading ? (
                  <div className="p-4 text-muted">{t("loadingLatestArticles", "Loading latest articles...")}</div>
                ) : !leadArticles.length ? (
                  <div className="p-4 text-muted">{t("noArticlesFound", "No articles found")}</div>
                ) : (
                  <div className="article-directory-featured">
                    {leadArticles.map((article, index) => (
                      <article
                        className={`article-directory-featured-item ${index === 0 ? "article-directory-featured-item--lead" : ""}`}
                        key={buildContentIdentifier(article, "article")}
                      >
                        {article.image_url ? (
                          <div className="article-directory-featured-media">
                            <Image src={article.image_url} alt={article.title} width={1200} height={720} />
                          </div>
                        ) : null}
                        <h3 className="article-directory-featured-title">
                          <Link href={getContentPath("blog", article)}>{article.title}</Link>
                        </h3>
                        <p className="article-directory-featured-excerpt">{getExcerpt(article.content || "", index === 0 ? 420 : 250)}</p>
                        <Link href={getContentPath("blog", article)} className="article-directory-more-link">
                          {t("readMore", "Read more")}
                        </Link>
                      </article>
                    ))}
                  </div>
                )}
              </div>

              <div className="article-directory-surface mt-4">
                <div className="article-directory-section-header">
                  <h2 className="article-directory-section-title mb-0">
                    {settings.article_directory_subsections_title || "Sub-sections"}
                  </h2>
                </div>
                <div className="article-directory-chip-grid">
                  {allSubjects
                    .filter((item) => item !== "all")
                    .map((item) => (
                      <button
                        key={item}
                        type="button"
                        className={`article-directory-chip ${selectedSubject === item ? "is-active" : ""}`}
                        onClick={() => setSelectedSubject(item)}
                      >
                        {item}
                      </button>
                    ))}
                  {!allSubjects.filter((item) => item !== "all").length ? (
                    <div className="text-muted small">No article categories available yet.</div>
                  ) : null}
                </div>
              </div>

              <div className="article-directory-surface mt-4">
                <div className="article-directory-section-header">
                  <h2 className="article-directory-section-title mb-0">
                    {settings.article_directory_selected_title || "Selected Sections"}
                  </h2>
                </div>

                {!selectedSections.length ? (
                  <div className="p-4 text-muted">
                    {t("adjustSearchOrCategory", "Try adjusting your search or selecting another category.")}
                  </div>
                ) : (
                  <div className="article-directory-selected">
                    {selectedSections.map((section) => (
                      <div className="article-directory-shelf" key={section.title}>
                        <h3 className="article-directory-shelf-title">{section.title}</h3>
                        <div className="row g-3">
                          {section.items.map((article) => (
                            <article className="col-md-6" key={buildContentIdentifier(article, "selected-article")}>
                              <div className="article-directory-card">
                                {article.image_url ? (
                                  <div className="article-directory-card-media">
                                    <Image src={article.image_url} alt={article.title} width={800} height={520} />
                                  </div>
                                ) : null}
                                <h4 className="article-directory-card-title">
                                  <Link href={getContentPath("blog", article)}>{article.title}</Link>
                                </h4>
                                <p className="article-directory-card-excerpt">{getExcerpt(article.content || "", 120)}</p>
                              </div>
                            </article>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="article-directory-surface mt-4">
                <div className="article-directory-section-header">
                  <h2 className="article-directory-section-title mb-0">
                    {settings.article_directory_latest_title || "New Articles"}
                  </h2>
                </div>

                {loading ? (
                  <div className="p-4 text-muted">{t("loadingLatestArticles", "Loading latest articles...")}</div>
                ) : !latestArticles.length ? (
                  <div className="p-4 text-muted">{t("noArticlesFound", "No articles found")}</div>
                ) : (
                  <div className="article-directory-latest-feed">
                    {latestArticles.map((article) => (
                      <article className="article-directory-feed-item" key={buildContentIdentifier(article, "feed-article")}>
                        <h3 className="article-directory-feed-title">
                          <Link href={getContentPath("blog", article)}>{article.title}</Link>
                        </h3>
                        <p className="article-directory-feed-excerpt">{getExcerpt(article.content || "", 280)}</p>
                        <div className="article-directory-feed-meta">
                          <span>{getContentCategory(article)}</span>
                          <span>•</span>
                          <span>{getAuthorName(article)}</span>
                          <span>•</span>
                          <span>{formatArticleDate(article.created_at, locale)}</span>
                        </div>
                        <Link href={getContentPath("blog", article)} className="article-directory-more-link">
                          More
                        </Link>
                      </article>
                    ))}
                  </div>
                )}

                <div className="mt-4">
                  <Link
                    href={settings.article_directory_more_cta_link || "/search?type=blog"}
                    className="article-directory-link-cta"
                    data-no-translate="true"
                  >
                    {settings.article_directory_more_cta_text || "More Articles"}
                  </Link>
                </div>
              </div>
            </div>

            <aside className="col-xl-4 d-none d-xl-block">
              <div className="article-directory-sidebar article-directory-surface sticky-lg-top" style={{ top: "110px" }}>
                <div className="article-directory-sidebar-block">
                  <h3 className="article-directory-sidebar-title">
                    {settings.article_directory_sidebar_search_title || t("search", "Search")}
                  </h3>
                  <input
                    type="text"
                    className="form-control article-directory-search"
                    placeholder={t("searchArticlesPlaceholder", "Search articles, tags, or topics...")}
                    value={searchTerm}
                    onChange={(event) => setSearchTerm(event.target.value)}
                  />
                </div>

                <div className="article-directory-sidebar-block">
                  <h3 className="article-directory-sidebar-title">
                    {settings.article_directory_sidebar_subjects_title || "By Subject"}
                  </h3>
                  <ul className="article-directory-sidebar-list">
                    {allSubjects.map((item) => (
                      <li key={item}>
                        <button
                          type="button"
                          className={`article-directory-sidebar-button ${selectedSubject === item ? "is-active" : ""}`}
                          onClick={() => setSelectedSubject(item)}
                        >
                          {item === "all" ? t("allCategories", "All categories") : item}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="article-directory-sidebar-block">
                  <h3 className="article-directory-sidebar-title">
                    {settings.article_directory_sidebar_authors_title || "By Author"}
                  </h3>
                  <ul className="article-directory-sidebar-list article-directory-sidebar-list--scroll">
                    {allAuthors.map((item) => (
                      <li key={item}>
                        <button
                          type="button"
                          className={`article-directory-sidebar-button ${selectedAuthor === item ? "is-active" : ""}`}
                          onClick={() => setSelectedAuthor(item)}
                        >
                          {item === "all" ? "All authors" : item}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="article-directory-sidebar-block">
                  <h3 className="article-directory-sidebar-title">
                    {settings.article_directory_sidebar_latest_title || "New Articles"}
                  </h3>
                  <ul className="article-directory-sidebar-list">
                    {latestSidebarArticles.map((article) => (
                      <li key={buildContentIdentifier(article, "sidebar-article")}>
                        <Link href={getContentPath("blog", article)} className="article-directory-sidebar-link">
                          {article.title}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </section>

      <FooterOne />
    </>
  );
}
