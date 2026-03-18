"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useSiteSettings } from "@/context/SiteSettingsContext";
import { fetchPublishedBlogs } from "@/lib/content-data";
import { getContentPath, getExcerpt, normalizeTags } from "@/lib/content-utils";

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
];

const getReadTime = (content = "") => {
  const words = getExcerpt(content, 500).trim().split(/\s+/).filter(Boolean).length;
  return `${Math.max(1, Math.ceil(words / 180))} min read`;
};

const formatDate = (dateString) =>
  new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

export default function BlogOne() {
  const { settings } = useSiteSettings();
  const [posts, setPosts] = useState(FALLBACK_POSTS);
  const [loading, setLoading] = useState(true);
  const sectionTitle = settings.blog_title || "Islamic Insights";
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
        const data = await fetchPublishedBlogs(3);
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
    <section
      className="py-5"
      style={{
        background:
          "linear-gradient(180deg, rgba(247,244,235,0.88) 0%, rgba(255,255,255,1) 100%)",
      }}
    >
      <div className="container py-4">
        <div className="row align-items-end g-4 mb-5">
          <div className="col-lg-7" data-aos="fade-up">
            <span
              className="badge px-3 py-2 rounded-pill mb-3 fw-semibold"
              style={{
                background: "rgba(171, 125, 44, 0.12)",
                color: "#7a5310",
              }}
            >
              {settings.blog_badge_text || "Islamic Insights"}
            </span>
            <h2 className="fw-bold mb-3">
              {sectionTitle}
            </h2>
            <p className="text-muted fs-5 mb-0">
              {settings.blog_subtitle ||
                "Explore reflections, reminders, and practical articles that strengthen faith and deepen understanding."}
            </p>
          </div>
          <div className="col-lg-5 text-lg-end" data-aos="fade-up" data-aos-delay="100">
            <div className="d-flex flex-wrap gap-2 justify-content-lg-end">
              {(tags.length ? tags : ["Dawah", "Tazkiyah", "Community", "Guidance"]).map((tag) => (
                <span
                  key={tag}
                  className="rounded-pill px-3 py-2 small fw-semibold"
                  style={{
                    background: "#fff",
                    border: "1px solid rgba(122, 83, 16, 0.18)",
                    color: "#6a4b14",
                  }}
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="row g-4">
          {posts.map((post, index) => (
            <div
              key={post.id}
              className="col-lg-4 col-md-6"
              data-aos="fade-up"
              data-aos-delay={index * 120}
            >
              <article
                className="h-100 rounded-4 overflow-hidden shadow-sm"
                style={{
                  background: "#fff",
                  border: "1px solid rgba(10, 31, 53, 0.08)",
                  transition: "transform 0.25s ease, box-shadow 0.25s ease",
                }}
              >
                <div
                  style={{
                    height: "10px",
                    background:
                      "linear-gradient(90deg, #0f3b5f 0%, #ab7d2c 50%, #2f7d67 100%)",
                  }}
                />
                <div className="p-4 p-xl-5 d-flex flex-column h-100">
                  <div className="d-flex align-items-center justify-content-between gap-3 mb-3">
                    <span
                      className="rounded-pill px-3 py-2 small fw-semibold"
                      style={{
                        background: "rgba(15, 59, 95, 0.08)",
                        color: "#0f3b5f",
                      }}
                    >
                    {post.category || "Islamic Insights"}
                  </span>
                  <small className="text-muted">{getReadTime(post.content)}</small>
                </div>

                  {post.featured ? <span className="badge bg-warning text-dark rounded-pill align-self-start mb-3">Featured</span> : null}

                  <h4 className="fw-bold mb-3" style={{ lineHeight: 1.35 }}>
                    {post.title}
                  </h4>
                  <p className="text-muted mb-4 flex-grow-1">
                    {getExcerpt(post.content || "", 150) || "Read the latest article from our dawah and community team."}
                  </p>
                  <div className="d-flex flex-wrap gap-2 mb-4">
                    {normalizeTags(post.tags).slice(0, 3).map((tag) => (
                      <span key={tag} className="badge bg-light text-dark border">
                        {tag}
                      </span>
                    ))}
                  </div>

                  <div className="d-flex align-items-center justify-content-between gap-3 pt-3 border-top">
                    <small className="text-muted">{formatDate(post.created_at)}</small>
                    <Link
                      href={getContentPath("blog", post)}
                      className="text-decoration-none fw-semibold"
                      style={{ color: "#0f3b5f" }}
                    >
                      Read article <i className="fa-solid fa-arrow-right ms-2" />
                    </Link>
                  </div>
                </div>
              </article>
            </div>
          ))}
        </div>

        <div className="text-center mt-5" data-aos="fade-up">
          <Link
            href="/blog-grid"
            className="btn btn-lg rounded-pill px-5"
            style={{
              background: "#0f3b5f",
              color: "#fff",
              border: "none",
            }}
          >
            {settings.blog_browse_cta_text || "Browse All Articles"} <i className="fa-solid fa-arrow-right ms-2" />
          </Link>
          {loading ? <p className="text-muted small mt-3 mb-0">Loading latest articles...</p> : null}
        </div>
      </div>
    </section>
  );
}
