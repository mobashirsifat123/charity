"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";

import HeaderOne from "@/components/HeaderOne";
import FooterOne from "@/components/FooterOne";
import ReadabilityToolbar from "@/components/ReadabilityToolbar";
import RelatedContentSection from "@/components/RelatedContentSection";
import SaveContentButton from "@/components/SaveContentButton";
import { useLanguage } from "@/context/LanguageContext";
import { useReadability } from "@/context/ReadabilityContext";
import {
  fetchBlogByIdentifier,
  fetchPublishedBlogs,
  getRelatedContent,
} from "@/lib/content-data";
import {
  estimateReadTime,
  getAuthorName,
  getAuthorRole,
  getContentCategory,
  getContentPath,
  getContentTitle,
  getExcerpt,
  incrementViewCount,
  normalizeTags,
  slugify,
} from "@/lib/content-utils";
import { supabase } from "@/lib/supabaseClient";

function formatLongDate(value, locale) {
  return new Date(value).toLocaleDateString(
    locale === "ar" ? "ar" : undefined,
    {
      year: "numeric",
      month: "long",
      day: "numeric",
    },
  );
}

export default function BlogDetails() {
  const { locale, t } = useLanguage();
  const { getReadingStyle } = useReadability();
  const params = useParams();
  const identifier = params?.id;
  const [blog, setBlog] = useState(null);
  const [relatedBlogs, setRelatedBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  const shareUrl = useMemo(() => {
    if (typeof window === "undefined" || !blog) return "";
    return `${window.location.origin}${getContentPath("blog", blog)}`;
  }, [blog]);

  useEffect(() => {
    let active = true;

    const fetchBlog = async () => {
      try {
        setLoading(true);
        const [article, allBlogs] = await Promise.all([
          fetchBlogByIdentifier(identifier),
          fetchPublishedBlogs(),
        ]);

        if (!active) return;

        setBlog(article);
        setRelatedBlogs(getRelatedContent(allBlogs, article, "blog", 3));
        if (article) {
          incrementViewCount({ supabase, table: "blogs", record: article });
        }
      } catch (error) {
        console.error("Error fetching blog details:", error.message);
      } finally {
        if (active) setLoading(false);
      }
    };

    if (identifier) {
      fetchBlog();
    }

    return () => {
      active = false;
    };
  }, [identifier]);

  const handleShare = async (platform) => {
    if (!blog) return;

    const title = getContentTitle(blog, "blog");
    const encodedUrl = encodeURIComponent(shareUrl);
    const encodedTitle = encodeURIComponent(title);

    const shareTargets = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      twitter: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
      whatsapp: `https://wa.me/?text=${encodeURIComponent(`${title} ${shareUrl}`)}`,
    };

    if (platform === "copy") {
      try {
        await navigator.clipboard.writeText(shareUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 1800);
      } catch (error) {
        console.error("Failed to copy article link:", error);
      }
      return;
    }

    window.open(
      shareTargets[platform],
      "_blank",
      "noopener,noreferrer,width=640,height=720",
    );
  };

  if (loading) {
    return (
      <>
        <HeaderOne />
        <div className="container py-5 my-5 text-center">
          <div
            className="spinner-border text-primary"
            role="status"
            style={{ width: "3rem", height: "3rem" }}
          >
            <span className="visually-hidden">
              {t("loading", "Loading...")}
            </span>
          </div>
          <h5 className="mt-3 text-muted">
            {t("loadingArticle", "Loading Article...")}
          </h5>
        </div>
        <FooterOne />
      </>
    );
  }

  if (!blog) {
    return (
      <>
        <HeaderOne />
        <div className="container py-5 my-5 text-center">
          <i
            className="bi bi-exclamation-triangle display-1 mb-3 d-block"
            style={{ color: "var(--accent-color)" }}
          ></i>
          <h2 className="fw-bold">
            {t("articleNotFound", "Article Not Found")}
          </h2>
          <p className="text-muted mb-4">
            {t(
              "articleRemovedMessage",
              "The article you are looking for does not exist or has been removed.",
            )}
          </p>
          <Link href="/blog-grid" className="btn btn-primary rounded-pill px-4">
            {t("returnToArticles", "Return to Articles")}
          </Link>
        </div>
        <FooterOne />
      </>
    );
  }

  const authorName = getAuthorName(blog, "IRWAA Editorial Team");
  const authorRole = getAuthorRole(blog, "Islamic Insights Contributor");
  const authorPath = `/authors/${slugify(authorName)}`;
  const tags = normalizeTags(blog.tags);
  const articleBody = blog.content || "";
  const articleSummary =
    blog.seo_description ||
    getExcerpt(articleBody, 220) ||
    t("articleSummaryFallback", "Reflect on a beneficial article from IRWAA.");
  const articleReadTime = estimateReadTime(articleBody);

  return (
    <>
      <HeaderOne />

      <section className="reading-hero py-5">
        <div className="container py-4 py-lg-5">
          <div className="reading-hero__inner">
            <div className="reading-hero__content">
              <div className="d-flex flex-wrap gap-2 mb-3">
                <span className="section-header-rail">
                  {getContentCategory(blog)}
                </span>
                {blog.featured ? (
                  <span className="badge bg-warning text-dark rounded-pill px-3 py-2">
                    {t("featured", "Featured")}
                  </span>
                ) : null}
              </div>

              <h1 className="reading-hero__title">
                {blog.seo_title || blog.title}
              </h1>
              <p className="reading-hero__summary">{articleSummary}</p>

              <div className="reading-hero__meta">
                <span>
                  <i className="bi bi-calendar3 me-2"></i>
                  {formatLongDate(blog.created_at, locale)}
                </span>
                <span>
                  <i className="bi bi-clock me-2"></i>
                  {articleReadTime} min read
                </span>
                <Link href={authorPath} className="reading-hero__meta-link">
                  <i className="bi bi-person-circle me-2"></i>
                  {authorName}
                </Link>
              </div>
            </div>

            {blog.image_url ? (
              <div className="reading-hero__visual">
                <div className="reading-hero__visual-frame">
                  <Image
                    src={blog.image_url}
                    alt={blog.title}
                    fill
                    priority
                    sizes="(max-width: 991px) 100vw, 38vw"
                    className="reading-hero__image"
                  />
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </section>

      <section className="py-5 page-surface-alt">
        <div className="container py-4">
          <div className="row g-4">
            <div className="col-xl-8">
              <ReadabilityToolbar
                title={t("readingControls", "Reading controls")}
              />

              <div className="content-panel article-reader-panel overflow-hidden mb-4">
                {blog.image_url ? (
                  <div className="article-reader-cover">
                    <Image
                      src={blog.image_url}
                      alt={blog.title}
                      width={1600}
                      height={900}
                      sizes="(max-width: 1199px) 100vw, 62vw"
                    />
                  </div>
                ) : null}

                <div className="article-reader-content p-4 p-md-5">
                  <div className="d-flex flex-wrap gap-2 mb-4">
                    {tags.map((tag) => (
                      <span
                        key={tag}
                        className="badge bg-light text-dark border px-3 py-2 rounded-pill"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  <div
                    className="blog-content content-prose article-reader-rich-text"
                    style={getReadingStyle()}
                    dangerouslySetInnerHTML={{ __html: articleBody }}
                  ></div>
                </div>
              </div>

              {copied ? (
                <p className="text-success small mb-4">
                  {t("articleLinkCopied", "Article link copied.")}
                </p>
              ) : null}

              <RelatedContentSection
                items={relatedBlogs}
                type="blog"
                title={t("relatedArticles", "Related Articles")}
              />

              <div className="text-center mt-5">
                <Link
                  href="/blog-grid"
                  className="btn btn-outline-secondary rounded-pill px-4 py-2 fw-semibold border-2"
                >
                  <i className="bi bi-arrow-left me-2"></i>{" "}
                  {t("backToAllArticles", "Back to all articles")}
                </Link>
              </div>
            </div>

            <div className="col-xl-4">
              <div
                className="article-reader-aside sticky-xl-top"
                style={{ top: "120px" }}
              >
                <div className="content-panel article-reader-aside-card mb-4">
                  <div className="p-4">
                    <div className="article-reader-kicker mb-3">
                      {t("articleOverview", "Article overview")}
                    </div>
                    <ul className="article-reader-meta-list">
                      <li>
                        <span>{t("subject", "Subject")}</span>
                        <strong>{getContentCategory(blog)}</strong>
                      </li>
                      <li>
                        <span>{t("author", "Author")}</span>
                        <strong>{authorName}</strong>
                      </li>
                      <li>
                        <span>{t("published", "Published")}</span>
                        <strong>
                          {formatLongDate(blog.created_at, locale)}
                        </strong>
                      </li>
                      <li>
                        <span>{t("readTime", "Read time")}</span>
                        <strong>{articleReadTime} min</strong>
                      </li>
                    </ul>
                  </div>
                </div>

                <div className="content-panel article-reader-aside-card mb-4">
                  <div className="p-4">
                    <div className="article-reader-kicker mb-3">
                      {t("saveOrShare", "Save or share")}
                    </div>
                    <div className="d-grid gap-2 mb-3">
                      <SaveContentButton
                        item={blog}
                        type="blog"
                        className="btn btn-outline-secondary rounded-pill"
                      />
                    </div>
                    <div className="article-reader-share-list">
                      <button
                        type="button"
                        className="icon-button"
                        onClick={() => handleShare("facebook")}
                      >
                        <i className="bi bi-facebook mx-auto"></i>
                      </button>
                      <button
                        type="button"
                        className="icon-button"
                        onClick={() => handleShare("twitter")}
                      >
                        <i className="bi bi-twitter mx-auto"></i>
                      </button>
                      <button
                        type="button"
                        className="icon-button"
                        onClick={() => handleShare("whatsapp")}
                      >
                        <i className="bi bi-whatsapp mx-auto"></i>
                      </button>
                      <button
                        type="button"
                        className="icon-button"
                        onClick={() => handleShare("copy")}
                      >
                        <i className="bi bi-link-45deg mx-auto"></i>
                      </button>
                    </div>
                  </div>
                </div>

                <div className="content-panel article-reader-author-card">
                  <div className="p-4">
                    <div className="article-reader-kicker mb-3">
                      {t("aboutTheAuthor", "About the author")}
                    </div>
                    <h5 className="fw-bold mb-1">{authorName}</h5>
                    <p className="text-muted mb-2">{authorRole}</p>
                    <p className="text-muted mb-3">
                      {blog.author_bio ||
                        t(
                          "authorBioFallbackBlog",
                          "Learn from clear, beneficial writing prepared for the IRWA audience.",
                        )}
                    </p>
                    <Link
                      href={authorPath}
                      className="btn btn-outline-primary rounded-pill px-4"
                    >
                      {t("viewProfile", "View Profile")}
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <FooterOne />
    </>
  );
}
