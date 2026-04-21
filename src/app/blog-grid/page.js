"use client";

import {
  Suspense,
  useDeferredValue,
  useEffect,
  useMemo,
  useState,
} from "react";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";

import { CORE_ARTICLE_SUBJECTS } from "@/lib/article-subjects";
import BreadcrumbOne from "@/components/BreadcrumbOne";
import FooterOne from "@/components/FooterOne";
import HeaderOne from "@/components/HeaderOne";
import KnowledgeSearchBar from "@/components/KnowledgeSearchBar";
import { useLanguage } from "@/context/LanguageContext";
import { useSiteSettings } from "@/context/SiteSettingsContext";
import {
  fetchArticleCategories,
  fetchPublishedBlogs,
} from "@/lib/content-data";
import {
  buildContentIdentifier,
  estimateReadTime,
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
const QUICK_FILTERS = [
  { key: "all", label: "All Articles", icon: "fa-layer-group" },
  { key: "featured", label: "Featured", icon: "fa-gem" },
  { key: "short", label: "Short Reads", icon: "fa-mug-hot" },
  { key: "deep", label: "Deep Reads", icon: "fa-book-open" },
];

function formatArticleDate(dateString, locale) {
  return new Date(dateString || Date.now()).toLocaleDateString(
    locale === "ar" ? "ar" : "en-US",
    {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    },
  );
}

function normalizeSubjectValue(value = "") {
  return String(value || "")
    .trim()
    .toLowerCase();
}

function matchesSubjectName(value = "", subject) {
  const normalizedValue = normalizeSubjectValue(value);
  if (!normalizedValue || !subject) return false;

  const aliases = [subject.name, ...(subject.aliases || [])].map(
    normalizeSubjectValue,
  );
  return aliases.includes(normalizedValue);
}

function findCoreSubject(value = "") {
  return (
    CORE_ARTICLE_SUBJECTS.find((subject) =>
      matchesSubjectName(value, subject),
    ) || null
  );
}

function matchesSelectedSubject(category = "", selectedSubject = "") {
  if (selectedSubject === "all") return true;
  if (category === selectedSubject) return true;

  const selectedCoreSubject = findCoreSubject(selectedSubject);
  if (!selectedCoreSubject) return false;

  return matchesSubjectName(category, selectedCoreSubject);
}

function BlogGridContent() {
  const { locale, t } = useLanguage();
  const { settings } = useSiteSettings();
  const searchParams = useSearchParams();
  const [articles, setArticles] = useState([]);
  const [categoryRecords, setCategoryRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("all");
  const [selectedAuthor, setSelectedAuthor] = useState("all");
  const [quickFilter, setQuickFilter] = useState("all");
  const deferredSearchTerm = useDeferredValue(searchTerm);

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
    const categoryNames = categoryRecords
      .map((item) => item.name)
      .filter(Boolean);
    const fallbackNames = articles
      .map((item) => getContentCategory(item))
      .filter(Boolean);
    return [
      "all",
      ...Array.from(new Set([...categoryNames, ...fallbackNames])),
    ];
  }, [articles, categoryRecords]);

  const allAuthors = useMemo(
    () => [
      "all",
      ...Array.from(
        new Set(articles.map((item) => getAuthorName(item)).filter(Boolean)),
      ),
    ],
    [articles],
  );

  useEffect(() => {
    const requestedSubject = String(searchParams.get("subject") || "").trim();

    if (!requestedSubject) {
      return;
    }

    const matchedSubject =
      allSubjects.find(
        (item) => item.toLowerCase() === requestedSubject.toLowerCase(),
      ) ||
      CORE_ARTICLE_SUBJECTS.find((subject) =>
        matchesSubjectName(requestedSubject, subject),
      )?.name;

    if (matchedSubject) {
      setSelectedSubject(matchedSubject);
    }
  }, [searchParams, allSubjects]);

  const filteredArticles = useMemo(() => {
    const lowerSearch = deferredSearchTerm.trim().toLowerCase();

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
      const matchesSubject = matchesSelectedSubject(category, selectedSubject);
      const matchesAuthor =
        selectedAuthor === "all" || author === selectedAuthor;
      const readTime = estimateReadTime(article.content || "");
      const matchesQuickFilter =
        quickFilter === "all" ||
        (quickFilter === "featured" && article.featured) ||
        (quickFilter === "short" && readTime <= 5) ||
        (quickFilter === "deep" && readTime >= 8);

      return (
        matchesSearch && matchesSubject && matchesAuthor && matchesQuickFilter
      );
    });
  }, [
    articles,
    deferredSearchTerm,
    selectedSubject,
    selectedAuthor,
    quickFilter,
  ]);

  const featuredArticles = useMemo(
    () =>
      filteredArticles.filter((item) => item.featured).slice(0, FEATURED_COUNT),
    [filteredArticles],
  );

  const leadArticles = useMemo(() => {
    if (featuredArticles.length >= FEATURED_COUNT) {
      return featuredArticles;
    }

    const selectedIds = new Set(featuredArticles.map((item) => item.id));
    const fallbacks = filteredArticles
      .filter((item) => !selectedIds.has(item.id))
      .slice(0, FEATURED_COUNT - featuredArticles.length);
    return [...featuredArticles, ...fallbacks];
  }, [featuredArticles, filteredArticles]);

  const latestArticles = useMemo(
    () =>
      [...filteredArticles]
        .sort(
          (a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0),
        )
        .slice(0, LATEST_FEED_COUNT),
    [filteredArticles],
  );

  const latestSidebarArticles = latestArticles.slice(0, 6);
  const editorialLeadArticle = leadArticles[0] || null;
  const editorialStackArticles = filteredArticles
    .filter((article) => article.id !== editorialLeadArticle?.id)
    .slice(0, 4);

  const topicCloud = useMemo(() => {
    const topicMap = new Map();

    articles.forEach((article) => {
      [
        getContentCategory(article),
        ...normalizeTags(article.tags),
        ...normalizeTags(article.keywords),
      ]
        .map((value) => String(value || "").trim())
        .filter(Boolean)
        .forEach((topic) => {
          const key = topic.toLowerCase();
          const previous = topicMap.get(key) || { name: topic, count: 0 };
          topicMap.set(key, { ...previous, count: previous.count + 1 });
        });
    });

    return Array.from(topicMap.values())
      .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name))
      .slice(0, 14);
  }, [articles]);

  const subjectOverview = useMemo(
    () =>
      CORE_ARTICLE_SUBJECTS.map((subject) => ({
        ...subject,
        count: articles.filter((article) =>
          matchesSubjectName(getContentCategory(article), subject),
        ).length,
      })),
    [articles],
  );

  const articleSubjectCards = useMemo(
    () =>
      subjectOverview.map((subject, index) => ({
        ...subject,
        filterName: subject.name,
        name: settings[`article_subject_${index + 1}_title`] || subject.name,
        description:
          settings[`article_subject_${index + 1}_description`] ||
          subject.description,
        icon: settings[`article_subject_${index + 1}_icon`] || subject.icon,
      })),
    [settings, subjectOverview],
  );

  const selectedCategoryNames = useMemo(() => {
    const requested = parseJsonArraySetting(
      settings.article_directory_selected_categories_json,
      [],
    )
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
            .filter((article) =>
              matchesSelectedSubject(getContentCategory(article), categoryName),
            )
            .slice(0, SELECTED_SECTION_ITEM_COUNT),
        }))
        .filter((section) => section.items.length),
    [filteredArticles, selectedCategoryNames],
  );

  const visibleSubjectShelves = useMemo(() => {
    const subjectPool =
      selectedSubject === "all"
        ? CORE_ARTICLE_SUBJECTS
        : CORE_ARTICLE_SUBJECTS.filter((subject) =>
            matchesSubjectName(selectedSubject, subject),
          );

    return subjectPool
      .map((subject) => ({
        ...subject,
        items: filteredArticles
          .filter((article) =>
            matchesSubjectName(getContentCategory(article), subject),
          )
          .slice(0, 3),
      }))
      .filter((section) => section.items.length);
  }, [filteredArticles, selectedSubject]);

  const totalArticleCount = articles.length;
  const featuredArticleCount = articles.filter(
    (article) => article.featured,
  ).length;
  const activeCoreSubject = findCoreSubject(selectedSubject);
  const activeFilterCount =
    (searchTerm.trim() ? 1 : 0) +
    (selectedSubject !== "all" ? 1 : 0) +
    (selectedAuthor !== "all" ? 1 : 0) +
    (quickFilter !== "all" ? 1 : 0);
  const hasActiveFilters = activeFilterCount > 0;
  const resultsSummary =
    selectedSubject !== "all"
      ? `${filteredArticles.length} ${filteredArticles.length === 1 ? "article" : "articles"} in ${selectedSubject}`
      : `${filteredArticles.length} ${filteredArticles.length === 1 ? "article" : "articles"} available`;

  return (
    <>
      <HeaderOne />
      <BreadcrumbOne
        title={settings.article_directory_title || t("articles", "Articles")}
        links={[
          { name: t("home", "Home"), link: "/" },
          {
            name: settings.article_directory_title || t("articles", "Articles"),
            link: "/blog-grid",
          },
        ]}
      />

      <section className="article-directory-page bg-white">
        <div className="article-directory-hero-band">
          <div className="container">
            <div className="article-directory-header mb-4">
              <span className="section-header-rail section-header-rail--light mb-3">
                {settings.article_directory_badge || "Knowledge Library"}
              </span>
              <h1 className="article-directory-title article-directory-title--hero mb-3">
                {settings.article_directory_title || t("articles", "Articles")}
              </h1>
              <p className="article-directory-description article-directory-description--hero mb-0">
                {settings.article_directory_description ||
                  "Browse beneficial writing, scholar reflections, and practical guidance arranged in a rich editorial directory."}
              </p>
            </div>

            <KnowledgeSearchBar
              className="mb-4"
              variant="hero"
              defaultType="blog"
              value={searchTerm}
              onChange={(nextValue) => {
                setSearchTerm(nextValue);
                setCurrentPage(1);
              }}
              onSearch={() => setCurrentPage(1)}
              placeholder="Search articles, subjects, authors, and tags..."
            />

            <div className="article-hero-subject-grid">
              {articleSubjectCards.map((subject) => (
                <Link
                  key={subject.filterName}
                  href={subject.href}
                  className={`article-hero-subject-card ${matchesSubjectName(selectedSubject, subject) ? "is-active" : ""}`}
                >
                  <span className="article-hero-subject-card__icon">
                    <i className={`fa-solid ${subject.icon}`} />
                  </span>
                  <span className="article-hero-subject-card__body">
                    <span className="article-hero-subject-card__title">
                      {subject.name}
                    </span>
                    <span className="article-hero-subject-card__description">
                      {subject.description}
                    </span>
                  </span>
                  <span className="article-hero-subject-card__count">
                    {subject.count}
                  </span>
                </Link>
              ))}
            </div>

            <div className="article-product-hero-panel">
              <div className="article-product-hero-panel__copy">
                <span className="article-product-hero-panel__eyebrow">
                  {settings.article_directory_reader_path_title ||
                    "Your Reading Path"}
                </span>
                <p className="mb-0">
                  {settings.article_directory_reader_path_description ||
                    "Begin with a core subject, continue with a featured article, then save the newest reminders for your next visit."}
                </p>
              </div>
              <div className="article-product-hero-panel__steps">
                {[
                  settings.article_directory_reader_step_1 ||
                    "Choose a subject",
                  settings.article_directory_reader_step_2 ||
                    "Read a scholar-guided article",
                  settings.article_directory_reader_step_3 ||
                    "Continue with related lessons",
                ].map((step, index) => (
                  <span key={step}>
                    <strong>{index + 1}</strong>
                    {step}
                  </span>
                ))}
              </div>
              <div className="article-product-hero-panel__actions">
                <Link
                  href={
                    settings.article_directory_primary_cta_link ||
                    "#article-reading-room"
                  }
                  className="article-product-hero-button article-product-hero-button--primary"
                >
                  {settings.article_directory_primary_cta_text ||
                    "Start Reading"}
                </Link>
                <Link
                  href={
                    settings.article_directory_secondary_cta_link ||
                    "#article-topics"
                  }
                  className="article-product-hero-button article-product-hero-button--ghost"
                >
                  {settings.article_directory_secondary_cta_text ||
                    "Browse Topics"}
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="container py-5" id="article-reading-room">
          <div className="article-directory-stats mb-4">
            <div className="article-directory-stat-card">
              <span className="article-directory-stat-card__value">
                {totalArticleCount}
              </span>
              <span className="article-directory-stat-card__label">
                {settings.article_directory_stats_articles_label || "Published"}
              </span>
            </div>
            <div className="article-directory-stat-card">
              <span className="article-directory-stat-card__value">
                {subjectOverview.filter((subject) => subject.count > 0).length}
              </span>
              <span className="article-directory-stat-card__label">
                {settings.article_directory_stats_subjects_label ||
                  "Core Subjects"}
              </span>
            </div>
            <div className="article-directory-stat-card">
              <span className="article-directory-stat-card__value">
                {featuredArticleCount}
              </span>
              <span className="article-directory-stat-card__label">
                {settings.article_directory_stats_featured_label || "Featured"}
              </span>
            </div>
          </div>

          <div className="article-directory-control-row mb-4">
            <div>
              <p className="article-directory-results mb-1">{resultsSummary}</p>
              <p className="article-directory-results-note mb-0">
                {activeCoreSubject?.description ||
                  settings.article_directory_subjects_intro ||
                  "Choose a core subject to focus the directory, then explore image-led articles and curated shelves."}
              </p>
            </div>
            {hasActiveFilters ? (
              <button
                type="button"
                className="article-directory-reset-button"
                onClick={() => {
                  setSearchTerm("");
                  setSelectedSubject("all");
                  setSelectedAuthor("all");
                  setQuickFilter("all");
                }}
              >
                Reset filters
              </button>
            ) : null}
          </div>

          <div className="article-discovery-grid mb-4" id="article-topics">
            <div className="article-discovery-card">
              <div className="article-directory-section-header article-directory-section-header--compact">
                <h2 className="article-directory-section-title mb-0">
                  {settings.article_directory_quick_filters_title ||
                    "Quick Filters"}
                </h2>
              </div>
              <div className="article-quick-filter-grid">
                {QUICK_FILTERS.map((filter) => (
                  <button
                    key={filter.key}
                    type="button"
                    className={`article-quick-filter ${quickFilter === filter.key ? "is-active" : ""}`}
                    onClick={() => setQuickFilter(filter.key)}
                  >
                    <i className={`fa-solid ${filter.icon}`} />
                    <span>{filter.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="article-discovery-card">
              <div className="article-directory-section-header article-directory-section-header--compact">
                <h2 className="article-directory-section-title mb-0">
                  {settings.article_directory_topic_cloud_title ||
                    "Popular Topics"}
                </h2>
              </div>
              <div className="article-topic-cloud">
                {topicCloud.length ? (
                  topicCloud.map((topic) => (
                    <button
                      key={topic.name}
                      type="button"
                      className="article-topic-pill"
                      onClick={() => {
                        setSearchTerm(topic.name);
                        setSelectedSubject("all");
                      }}
                    >
                      <span>{topic.name}</span>
                      <strong>{topic.count}</strong>
                    </button>
                  ))
                ) : (
                  <p className="article-directory-section-note mb-0">
                    Add categories or tags from the admin article editor to
                    build this topic cloud.
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="row g-4">
            <div className="col-xl-8">
              <div className="compact-directory-toolbar mb-4 d-xl-none">
                <div className="row g-2 align-items-end">
                  <div className="col-12">
                    <label className="compact-directory-label">
                      {t("search", "Search")}
                    </label>
                    <input
                      type="text"
                      className="form-control compact-directory-input"
                      placeholder={t(
                        "searchArticlesPlaceholder",
                        "Search articles, tags, or topics...",
                      )}
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
                          {item === "all"
                            ? t("allCategories", "All categories")
                            : item}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="article-directory-surface">
                <div className="article-directory-section-header">
                  <h2 className="article-directory-section-title mb-0">
                    {settings.article_directory_featured_title ||
                      "Featured Articles"}
                  </h2>
                </div>

                {loading ? (
                  <div className="p-4 text-muted">
                    {t("loadingLatestArticles", "Loading latest articles...")}
                  </div>
                ) : !editorialLeadArticle ? (
                  <div className="article-directory-empty-state">
                    <i className="fa-solid fa-magnifying-glass" />
                    <h3>
                      {settings.article_directory_empty_title ||
                        t("noArticlesFound", "No articles found")}
                    </h3>
                    <p>
                      {settings.article_directory_empty_description ||
                        "Try clearing filters or add more published articles from the admin panel."}
                    </p>
                  </div>
                ) : (
                  <div className="article-directory-hero-grid">
                    <article className="article-directory-lead-story">
                      {editorialLeadArticle.image_url ? (
                        <div className="article-directory-featured-media article-directory-featured-media--hero">
                          <Image
                            src={editorialLeadArticle.image_url}
                            alt={editorialLeadArticle.title}
                            width={1400}
                            height={820}
                            sizes="(max-width: 1199px) 100vw, 58vw"
                          />
                        </div>
                      ) : null}
                      <div className="article-directory-lead-meta">
                        <span>{getContentCategory(editorialLeadArticle)}</span>
                        <span>•</span>
                        <span>{getAuthorName(editorialLeadArticle)}</span>
                        <span>•</span>
                        <span>
                          {estimateReadTime(editorialLeadArticle.content || "")}{" "}
                          min read
                        </span>
                        <span>•</span>
                        <span>
                          {formatArticleDate(
                            editorialLeadArticle.created_at,
                            locale,
                          )}
                        </span>
                      </div>
                      <h3 className="article-directory-featured-title article-directory-featured-title--hero">
                        <Link
                          href={getContentPath("blog", editorialLeadArticle)}
                        >
                          {editorialLeadArticle.title}
                        </Link>
                      </h3>
                      <p className="article-directory-featured-excerpt article-directory-featured-excerpt--hero">
                        {getExcerpt(editorialLeadArticle.content || "", 420)}
                      </p>
                      <Link
                        href={getContentPath("blog", editorialLeadArticle)}
                        className="article-directory-more-link"
                      >
                        {t("readMore", "Read more")}
                      </Link>
                    </article>

                    <div className="article-directory-stack">
                      {editorialStackArticles.map((article) => (
                        <article
                          className="article-directory-stack-item"
                          key={buildContentIdentifier(article, "stack-article")}
                        >
                          {article.image_url ? (
                            <div className="article-directory-stack-media">
                              <Image
                                src={article.image_url}
                                alt={article.title}
                                width={360}
                                height={240}
                                sizes="(max-width: 991px) 100vw, 18vw"
                              />
                            </div>
                          ) : null}
                          <div className="article-directory-stack-content">
                            <div className="article-directory-feed-meta mb-2">
                              <span>{getContentCategory(article)}</span>
                              <span>•</span>
                              <span>
                                {estimateReadTime(article.content || "")} min
                                read
                              </span>
                              <span>•</span>
                              <span>
                                {formatArticleDate(article.created_at, locale)}
                              </span>
                            </div>
                            <h3 className="article-directory-stack-title">
                              <Link href={getContentPath("blog", article)}>
                                {article.title}
                              </Link>
                            </h3>
                            <p className="article-directory-stack-excerpt">
                              {getExcerpt(article.content || "", 120)}
                            </p>
                          </div>
                        </article>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {visibleSubjectShelves.length ? (
                <div className="article-directory-surface mt-4">
                  <div className="article-directory-section-header">
                    <h2 className="article-directory-section-title mb-0">
                      {selectedSubject === "all"
                        ? settings.article_directory_subject_shelves_title ||
                          "Core Subjects"
                        : `${selectedSubject} Articles`}
                    </h2>
                  </div>

                  <div className="article-directory-selected">
                    {visibleSubjectShelves.map((section) => (
                      <div
                        className="article-directory-shelf"
                        key={section.name}
                      >
                        <div className="d-flex justify-content-between align-items-center gap-3 mb-3 flex-wrap">
                          <h3 className="article-directory-shelf-title mb-0">
                            {section.name}
                          </h3>
                          <Link
                            href={section.href}
                            className="article-directory-more-link"
                          >
                            More in {section.name}
                          </Link>
                        </div>
                        <div className="row g-3">
                          {section.items.map((article) => (
                            <article
                              className="col-md-4"
                              key={buildContentIdentifier(
                                article,
                                `${section.name}-article`,
                              )}
                            >
                              <div className="article-directory-card">
                                {article.image_url ? (
                                  <div className="article-directory-card-media">
                                    <Image
                                      src={article.image_url}
                                      alt={article.title}
                                      width={800}
                                      height={520}
                                      sizes="(max-width: 767px) 100vw, 33vw"
                                    />
                                  </div>
                                ) : null}
                                <div className="article-directory-feed-meta mb-2">
                                  <span>{getAuthorName(article)}</span>
                                  <span>•</span>
                                  <span>
                                    {estimateReadTime(article.content || "")}{" "}
                                    min read
                                  </span>
                                  <span>•</span>
                                  <span>
                                    {formatArticleDate(
                                      article.created_at,
                                      locale,
                                    )}
                                  </span>
                                </div>
                                <h4 className="article-directory-card-title">
                                  <Link href={getContentPath("blog", article)}>
                                    {article.title}
                                  </Link>
                                </h4>
                                <div className="article-directory-feed-meta mb-2">
                                  <span>{getContentCategory(article)}</span>
                                  <span>•</span>
                                  <span>
                                    {estimateReadTime(article.content || "")}{" "}
                                    min read
                                  </span>
                                </div>
                                <p className="article-directory-card-excerpt">
                                  {getExcerpt(article.content || "", 120)}
                                </p>
                              </div>
                            </article>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}

              <div className="article-directory-surface mt-4">
                <div className="article-directory-section-header">
                  <h2 className="article-directory-section-title mb-0">
                    {settings.article_directory_selected_title ||
                      "Selected Sections"}
                  </h2>
                </div>

                {!selectedSections.length ? (
                  <div className="article-directory-empty-state article-directory-empty-state--small">
                    <i className="fa-solid fa-filter-circle-xmark" />
                    <h3>
                      {settings.article_directory_empty_title ||
                        t("noArticlesFound", "No articles found")}
                    </h3>
                    <p>
                      {settings.article_directory_empty_description ||
                        t(
                          "adjustSearchOrCategory",
                          "Try adjusting your search or selecting another category.",
                        )}
                    </p>
                  </div>
                ) : (
                  <div className="article-directory-selected">
                    {selectedSections.map((section) => (
                      <div
                        className="article-directory-shelf"
                        key={section.title}
                      >
                        <h3 className="article-directory-shelf-title">
                          {section.title}
                        </h3>
                        <div className="row g-3">
                          {section.items.map((article) => (
                            <article
                              className="col-md-6"
                              key={buildContentIdentifier(
                                article,
                                "selected-article",
                              )}
                            >
                              <div className="article-directory-card">
                                {article.image_url ? (
                                  <div className="article-directory-card-media">
                                    <Image
                                      src={article.image_url}
                                      alt={article.title}
                                      width={800}
                                      height={520}
                                      sizes="(max-width: 767px) 100vw, 50vw"
                                    />
                                  </div>
                                ) : null}
                                <h4 className="article-directory-card-title">
                                  <Link href={getContentPath("blog", article)}>
                                    {article.title}
                                  </Link>
                                </h4>
                                <div className="article-directory-feed-meta mb-2">
                                  <span>{getContentCategory(article)}</span>
                                  <span>•</span>
                                  <span>
                                    {estimateReadTime(article.content || "")}{" "}
                                    min read
                                  </span>
                                  <span>•</span>
                                  <span>{getAuthorName(article)}</span>
                                </div>
                                <p className="article-directory-card-excerpt">
                                  {getExcerpt(article.content || "", 120)}
                                </p>
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
                  <div className="p-4 text-muted">
                    {t("loadingLatestArticles", "Loading latest articles...")}
                  </div>
                ) : !latestArticles.length ? (
                  <div className="article-directory-empty-state article-directory-empty-state--small">
                    <i className="fa-solid fa-newspaper" />
                    <h3>
                      {settings.article_directory_empty_title ||
                        t("noArticlesFound", "No articles found")}
                    </h3>
                    <p>
                      {settings.article_directory_empty_description ||
                        "Try clearing filters or publish a new article from the admin panel."}
                    </p>
                  </div>
                ) : (
                  <div className="article-directory-latest-feed">
                    {latestArticles.map((article) => (
                      <article
                        className="article-directory-feed-item"
                        key={buildContentIdentifier(article, "feed-article")}
                      >
                        {article.image_url ? (
                          <div className="article-directory-feed-media">
                            <Image
                              src={article.image_url}
                              alt={article.title}
                              width={260}
                              height={180}
                              sizes="(max-width: 991px) 100vw, 16vw"
                            />
                          </div>
                        ) : null}
                        <div className="article-directory-feed-body">
                          <h3 className="article-directory-feed-title">
                            <Link href={getContentPath("blog", article)}>
                              {article.title}
                            </Link>
                          </h3>
                          <p className="article-directory-feed-excerpt">
                            {getExcerpt(article.content || "", 280)}
                          </p>
                          <div className="article-directory-feed-meta">
                            <span>{getContentCategory(article)}</span>
                            <span>•</span>
                            <span>{getAuthorName(article)}</span>
                            <span>•</span>
                            <span>
                              {estimateReadTime(article.content || "")} min read
                            </span>
                            <span>•</span>
                            <span>
                              {formatArticleDate(article.created_at, locale)}
                            </span>
                          </div>
                          <Link
                            href={getContentPath("blog", article)}
                            className="article-directory-more-link"
                          >
                            More
                          </Link>
                        </div>
                      </article>
                    ))}
                  </div>
                )}

                <div className="mt-4">
                  <Link
                    href={
                      settings.article_directory_more_cta_link ||
                      "/search?type=blog"
                    }
                    className="article-directory-link-cta"
                    data-no-translate="true"
                  >
                    {settings.article_directory_more_cta_text ||
                      "More Articles"}
                  </Link>
                </div>
              </div>
            </div>

            <aside className="col-xl-4 d-none d-xl-block">
              <div
                className="article-directory-sidebar article-directory-surface sticky-lg-top"
                style={{ top: "110px" }}
              >
                <div className="article-directory-sidebar-block">
                  <h3 className="article-directory-sidebar-title">
                    {settings.article_directory_sidebar_subjects_title ||
                      "By Subject"}
                  </h3>
                  <ul className="article-directory-sidebar-list">
                    {allSubjects.map((item) => (
                      <li key={item}>
                        <button
                          type="button"
                          className={`article-directory-sidebar-button ${selectedSubject === item ? "is-active" : ""}`}
                          onClick={() => setSelectedSubject(item)}
                        >
                          {item === "all"
                            ? t("allCategories", "All categories")
                            : item}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="article-directory-sidebar-block">
                  <h3 className="article-directory-sidebar-title">
                    {settings.article_directory_sidebar_authors_title ||
                      "By Author"}
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
                    {settings.article_directory_sidebar_latest_title ||
                      "New Articles"}
                  </h3>
                  <ul className="article-directory-sidebar-list">
                    {latestSidebarArticles.map((article) => (
                      <li
                        key={buildContentIdentifier(article, "sidebar-article")}
                      >
                        <Link
                          href={getContentPath("blog", article)}
                          className="article-directory-sidebar-link"
                        >
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

export default function BlogGrid() {
  return (
    <Suspense fallback={null}>
      <BlogGridContent />
    </Suspense>
  );
}
