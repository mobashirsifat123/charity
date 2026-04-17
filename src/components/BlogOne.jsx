"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useLanguage } from "@/context/LanguageContext";
import { useSiteSettings } from "@/context/SiteSettingsContext";
import { CORE_ARTICLE_SUBJECTS } from "@/lib/article-subjects";
import { fetchPublishedBlogs } from "@/lib/content-data";
import {
  estimateReadTime,
  getContentPath,
  getExcerpt,
  normalizeTags,
} from "@/lib/content-utils";

const FALLBACK_POSTS = [
  {
    id: "fallback-1",
    title: "Why Sound Knowledge Strengthens a Serving Community",
    content:
      "A healthy Muslim community is built on both right belief and sincere service. Learn how knowledge and charity reinforce each other in daily life.",
    category: "Community",
    created_at: "2026-03-10T00:00:00.000Z",
  },
  {
    id: "fallback-2",
    title: "Teaching Islam With Clarity, Mercy, and Wisdom",
    content:
      "Dawah has the greatest impact when it is rooted in compassion, patience, and evidence. These principles shape how we write and how we serve.",
    category: "Dawah",
    created_at: "2026-03-06T00:00:00.000Z",
  },
  {
    id: "fallback-3",
    title: "How Our Causes Support the Mission of Guidance",
    content:
      "Our causes are not separate from our message. They are part of a wider effort to support families, answer questions, and strengthen the ummah.",
    category: "Mission",
    created_at: "2026-02-28T00:00:00.000Z",
  },
  {
    id: "fallback-4",
    title: "Learning the Quran With Consistency in a Busy Life",
    content:
      "Small, regular study habits help the Quran become part of daily life. A steady reading rhythm is often more transformative than occasional bursts.",
    category: "Quran",
    created_at: "2026-02-20T00:00:00.000Z",
  },
];

const formatDate = (dateString, locale) =>
  new Date(dateString).toLocaleDateString(locale === "ar" ? "ar" : "en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

export default function BlogOne({ initialBlogs }) {
  const { locale, t } = useLanguage();
  const { settings } = useSiteSettings();
  const [posts, setPosts] = useState(initialBlogs || FALLBACK_POSTS);
  const [loading, setLoading] = useState(true);
  const sectionTitle = settings.blog_title || "Islamic Insights";
  const leadPost = posts?.[0] || null;
  const supportingPosts = posts?.slice(1, 4) || [];
  const tags = [
    settings.blog_tag_1,
    settings.blog_tag_2,
    settings.blog_tag_3,
    settings.blog_tag_4,
  ].filter(Boolean);

  useEffect(() => {
    let active = true;

    const fetchBlogs = async () => {
      try {
        const data = await fetchPublishedBlogs(4);
        if (active && data?.length) {
          setPosts(data);
        }
      } catch (error) {
        console.error("Error fetching homepage blogs:", error.message);
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    fetchBlogs();

    return () => {
      active = false;
    };
  }, []);

  return (
    <section className="py-5 page-surface-alt section-shell">
      <div className="container position-relative py-4">
        <div className="row align-items-end g-4 mb-5">
          <div className="col-lg-7" data-aos="fade-up">
            <span className="section-header-rail mb-3">
              {settings.blog_badge_text || "Islamic Insights"}
            </span>
            <h2 className="fw-bold mb-3">{sectionTitle}</h2>
            <p className="text-muted fs-5 mb-0">
              {settings.blog_subtitle ||
                "Explore reflections, reminders, and practical articles that strengthen faith and deepen understanding."}
            </p>
          </div>
          <div className="col-lg-5" data-aos="fade-up" data-aos-delay="100">
            <div className="system-panel glass-surface--light p-4 p-xl-4">
              <div className="d-flex flex-wrap gap-2 mb-3">
                {(tags.length
                  ? tags
                  : ["Dawah", "Tazkiyah", "Community", "Guidance"]
                ).map((tag) => (
                  <span key={tag} className="data-chip">
                    <span className="data-chip__dot" />
                    {tag}
                  </span>
                ))}
              </div>
              <div className="system-list">
                <div className="system-list__item">
                  <span className="system-list__icon">
                    <i className="fa-solid fa-book-open-reader" />
                  </span>
                  <div>
                    <span className="system-list__title">
                      Practical and readable
                    </span>
                    <span className="system-list__meta">
                      Designed for quick scanning and deeper reading.
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div
          className="home-subject-shortcuts mb-5"
          data-aos="fade-up"
          data-aos-delay="80"
        >
          {CORE_ARTICLE_SUBJECTS.map((subject) => (
            <Link
              key={subject.name}
              href={subject.href}
              className="home-subject-shortcut text-decoration-none"
            >
              <span className="home-subject-shortcut__icon">
                <i className={`fa-solid ${subject.icon}`} />
              </span>
              <span className="home-subject-shortcut__label">
                {subject.name}
              </span>
            </Link>
          ))}
        </div>

        <div className="row g-4">
          {(!posts || posts.length === 0) && !loading ? (
            <div className="col-12 py-5 text-center text-muted">
              <p className="mb-0 fs-5">
                New insights and articles will be published here shortly.
              </p>
            </div>
          ) : (
            <>
              {leadPost ? (
                <div className="col-lg-6" data-aos="fade-up">
                  <article className="home-article-card home-article-card--lead h-100 rounded-4 overflow-hidden system-panel glass-surface--light">
                    <Link
                      href={getContentPath("blog", leadPost)}
                      className="home-article-card__media-link"
                    >
                      <div className="home-article-card__media">
                        {leadPost.image_url ? (
                          <Image
                            src={leadPost.image_url}
                            alt={leadPost.title}
                            fill
                            sizes="(max-width: 991px) 100vw, 50vw"
                            className="home-article-card__image"
                          />
                        ) : (
                          <div className="home-article-card__fallback" />
                        )}
                      </div>
                    </Link>

                    <div className="p-4 p-xl-5 d-flex flex-column h-100">
                      <div className="d-flex flex-wrap align-items-center gap-2 mb-3">
                        <span className="data-chip">
                          <span className="data-chip__dot" />
                          {leadPost.category || "Islamic Insights"}
                        </span>
                        <span className="home-article-card__meta">
                          {estimateReadTime(leadPost.content)} min read
                        </span>
                        <span className="home-article-card__meta">
                          {formatDate(leadPost.created_at, locale)}
                        </span>
                      </div>

                      {leadPost.featured ? (
                        <span className="badge bg-warning text-dark rounded-pill align-self-start mb-3">
                          {t("featured", "Featured")}
                        </span>
                      ) : null}

                      <h3 className="home-article-card__title home-article-card__title--lead">
                        {leadPost.title}
                      </h3>
                      <p className="home-article-card__excerpt home-article-card__excerpt--lead">
                        {getExcerpt(leadPost.content || "", 220) ||
                          "Read the latest article from our dawah and community team."}
                      </p>

                      <div className="d-flex flex-wrap gap-2 mb-4">
                        {normalizeTags(leadPost.tags)
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

                      <div className="mt-auto pt-3 border-top">
                        <Link
                          href={getContentPath("blog", leadPost)}
                          className="text-decoration-none fw-semibold home-article-card__cta"
                        >
                          {t("readArticle", "Read Article")}{" "}
                          <i className="fa-solid fa-arrow-right ms-2" />
                        </Link>
                      </div>
                    </div>
                  </article>
                </div>
              ) : null}

              <div className="col-lg-6">
                <div className="row g-4">
                  {supportingPosts.map((post, index) => (
                    <div
                      key={post.id}
                      className="col-md-6 col-lg-12"
                      data-aos="fade-up"
                      data-aos-delay={(index + 1) * 120}
                    >
                      <article className="home-article-card home-article-card--compact h-100 rounded-4 overflow-hidden system-panel glass-surface--light">
                        <div className="home-article-card__compact-grid">
                          <Link
                            href={getContentPath("blog", post)}
                            className="home-article-card__media-link"
                          >
                            <div className="home-article-card__media home-article-card__media--compact">
                              {post.image_url ? (
                                <Image
                                  src={post.image_url}
                                  alt={post.title}
                                  fill
                                  sizes="(max-width: 767px) 100vw, (max-width: 991px) 50vw, 22vw"
                                  className="home-article-card__image"
                                />
                              ) : (
                                <div className="home-article-card__fallback" />
                              )}
                            </div>
                          </Link>

                          <div className="p-4 d-flex flex-column">
                            <div className="d-flex flex-wrap align-items-center gap-2 mb-2">
                              <span className="home-article-card__category">
                                {post.category || "Islamic Insights"}
                              </span>
                              <span className="home-article-card__meta">
                                {estimateReadTime(post.content)} min read
                              </span>
                            </div>

                            <h4 className="home-article-card__title">
                              {post.title}
                            </h4>
                            <p className="home-article-card__excerpt flex-grow-1">
                              {getExcerpt(post.content || "", 118) ||
                                "Read the latest article from our dawah and community team."}
                            </p>

                            <div className="d-flex align-items-center justify-content-between gap-3 mt-3 pt-3 border-top">
                              <small className="text-muted">
                                {formatDate(post.created_at, locale)}
                              </small>
                              <Link
                                href={getContentPath("blog", post)}
                                className="text-decoration-none fw-semibold home-article-card__cta"
                              >
                                {t("readArticle", "Read Article")}{" "}
                                <i className="fa-solid fa-arrow-right ms-2" />
                              </Link>
                            </div>
                          </div>
                        </div>
                      </article>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        <div className="text-center mt-5" data-aos="fade-up">
          <Link
            href="/blog-grid"
            className="btn btn-primary btn-lg rounded-pill px-5 btn-ripple"
          >
            {settings.blog_browse_cta_text || "Browse All Articles"}{" "}
            <i className="fa-solid fa-arrow-right ms-2" />
          </Link>
          {loading ? (
            <p className="text-muted small mt-3 mb-0">
              {t("loadingLatestArticles", "Loading latest articles...")}
            </p>
          ) : null}
        </div>
      </div>
    </section>
  );
}
