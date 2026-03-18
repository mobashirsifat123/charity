"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { fetchBlogByIdentifier, fetchPublishedBlogs, getRelatedContent } from "@/lib/content-data";
import {
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
import HeaderOne from "@/components/HeaderOne";
import FooterOne from "@/components/FooterOne";
import RelatedContentSection from "@/components/RelatedContentSection";
import SaveContentButton from "@/components/SaveContentButton";

export default function BlogDetails() {
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
        const article = await fetchBlogByIdentifier(identifier);
        const allBlogs = await fetchPublishedBlogs();
        if (!active) return;

        setBlog(article);
        setRelatedBlogs(getRelatedContent(allBlogs, article, "blog", 3));
        incrementViewCount({ supabase, table: "blogs", record: article });
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

  useEffect(() => {
    if (typeof document === "undefined" || !blog) return;
    document.title = blog.seo_title || `${blog.title} | IRWA`;

    const metaDescription = document.querySelector('meta[name="description"]');
    const description = blog.seo_description || getExcerpt(blog.content || "", 150);
    if (metaDescription) {
      metaDescription.setAttribute("content", description);
    }
  }, [blog]);

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

    window.open(shareTargets[platform], "_blank", "noopener,noreferrer,width=640,height=720");
  };

  if (loading) {
    return (
      <>
        <HeaderOne />
        <div className="container py-5 my-5 text-center">
          <div className="spinner-border text-primary" role="status" style={{ width: "3rem", height: "3rem" }}>
            <span className="visually-hidden">Loading...</span>
          </div>
          <h5 className="mt-3 text-muted">Loading Article...</h5>
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
          <i className="bi bi-exclamation-triangle display-1 text-warning mb-3 d-block"></i>
          <h2 className="fw-bold">Article Not Found</h2>
          <p className="text-muted mb-4">The article you are looking for does not exist or has been removed.</p>
          <Link href="/blog-grid" className="btn btn-primary rounded-pill px-4">Return to Articles</Link>
        </div>
        <FooterOne />
      </>
    );
  }

  const authorName = getAuthorName(blog, "IRWA Editorial Team");
  const authorRole = getAuthorRole(blog, "Islamic Insights Contributor");
  const authorPath = `/authors/${slugify(authorName)}`;
  const tags = normalizeTags(blog.tags);

  return (
    <>
      <HeaderOne />

      <section className="position-relative bg-dark text-white py-5" style={{ minHeight: "350px" }}>
        {blog.image_url ? (
          <div
            className="position-absolute top-0 start-0 w-100 h-100"
            style={{ backgroundImage: `url(${blog.image_url})`, backgroundSize: "cover", backgroundPosition: "center", opacity: "0.4" }}
          ></div>
        ) : null}
        <div className="container position-relative z-1 py-5">
          <div className="row justify-content-center text-center">
            <div className="col-lg-8">
              <div className="d-flex justify-content-center flex-wrap gap-2 mb-3">
                <span className="badge bg-primary px-3 py-2 rounded-pill fs-6">
                  {getContentCategory(blog)}
                </span>
                {blog.featured ? <span className="badge bg-warning text-dark px-3 py-2 rounded-pill fs-6">Featured</span> : null}
              </div>
              <h1 className="display-4 fw-bold mb-4">{blog.seo_title || blog.title}</h1>
              <div className="d-flex align-items-center justify-content-center gap-4 text-white-50 flex-wrap">
                <span><i className="bi bi-calendar3 me-2"></i>{new Date(blog.created_at).toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" })}</span>
                <Link href={authorPath} className="text-white-50 text-decoration-none">
                  <i className="bi bi-person-circle me-2"></i>{authorName}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-5 bg-light">
        <div className="container py-4">
          <div className="row justify-content-center">
            <div className="col-lg-9">
              <div className="card border-0 shadow-sm rounded-4 overflow-hidden mb-4">
                <div className="card-body p-4 p-md-5">
                  <div className="d-flex flex-wrap gap-2 mb-4">
                    {tags.map((tag) => (
                      <span key={tag} className="badge bg-light text-dark border px-3 py-2 rounded-pill">
                        {tag}
                      </span>
                    ))}
                  </div>
                  <div className="blog-content fs-5 text-dark" style={{ lineHeight: "1.8" }} dangerouslySetInnerHTML={{ __html: blog.content }}></div>
                </div>
              </div>

              <div className="card border-0 shadow-sm rounded-4 mb-5">
                <div className="card-body p-4">
                  <div className="row g-3 align-items-center">
                    <div className="col-lg-7">
                      <h5 className="fw-bold mb-1">{authorName}</h5>
                      <p className="text-muted mb-2">{authorRole}</p>
                      <p className="text-muted mb-0">{blog.author_bio || "Learn from clear, beneficial writing prepared for the IRWA audience."}</p>
                    </div>
                    <div className="col-lg-5 text-lg-end">
                      <Link href={authorPath} className="btn btn-outline-primary rounded-pill px-4">
                        View Profile
                      </Link>
                    </div>
                  </div>
                </div>
              </div>

              <div className="d-flex justify-content-between align-items-center border-top border-bottom py-4 mb-5 flex-wrap gap-3">
                <h5 className="fw-bold mb-0">Share this article:</h5>
                <div className="d-flex gap-2 flex-wrap">
                  <SaveContentButton item={blog} type="blog" />
                  <button type="button" className="btn btn-outline-primary rounded-circle" style={{ width: "45px", height: "45px" }} onClick={() => handleShare("facebook")}><i className="bi bi-facebook mx-auto"></i></button>
                  <button type="button" className="btn btn-outline-info rounded-circle" style={{ width: "45px", height: "45px" }} onClick={() => handleShare("twitter")}><i className="bi bi-twitter mx-auto"></i></button>
                  <button type="button" className="btn btn-outline-success rounded-circle" style={{ width: "45px", height: "45px" }} onClick={() => handleShare("whatsapp")}><i className="bi bi-whatsapp mx-auto"></i></button>
                  <button type="button" className="btn btn-outline-secondary rounded-circle" style={{ width: "45px", height: "45px" }} onClick={() => handleShare("copy")}><i className="bi bi-link-45deg mx-auto"></i></button>
                </div>
              </div>
              {copied ? <p className="text-success small mb-4">Article link copied.</p> : null}

              <RelatedContentSection items={relatedBlogs} type="blog" title="Related Articles" />

              <div className="text-center mt-5">
                <Link href="/blog-grid" className="btn btn-outline-secondary rounded-pill px-4 py-2 fw-semibold border-2">
                  <i className="bi bi-arrow-left me-2"></i> Back to all articles
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <FooterOne />
    </>
  );
}
