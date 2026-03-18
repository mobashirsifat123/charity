"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import HeaderOne from "@/components/HeaderOne";
import FooterOne from "@/components/FooterOne";
import BreadcrumbOne from "@/components/BreadcrumbOne";
import SaveContentButton from "@/components/SaveContentButton";
import { fetchPublishedBlogs } from "@/lib/content-data";
import {
  buildContentIdentifier,
  getContentCategory,
  getContentPath,
  getExcerpt,
  normalizeTags,
  sortFeaturedFirst,
} from "@/lib/content-utils";

export default function BlogGrid() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [category, setCategory] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  useEffect(() => {
    let active = true;

    const fetchBlogs = async () => {
      try {
        setLoading(true);
        const data = await fetchPublishedBlogs();
        if (active) setBlogs(sortFeaturedFirst(data));
      } catch (error) {
        console.error("Error fetching blogs:", error.message);
      } finally {
        if (active) setLoading(false);
      }
    };

    fetchBlogs();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    setSearchTerm(params.get("search") || "");
    setCurrentPage(1);
  }, []);

  const categories = useMemo(
    () => ["all", ...Array.from(new Set(blogs.map((blog) => getContentCategory(blog)).filter(Boolean)))],
    [blogs]
  );

  const filteredBlogs = useMemo(() => {
    const lower = searchTerm.toLowerCase();
    return blogs.filter((blog) => {
      const searchMatch =
        !lower ||
        blog.title?.toLowerCase().includes(lower) ||
        blog.content?.toLowerCase().includes(lower) ||
        getContentCategory(blog).toLowerCase().includes(lower) ||
        normalizeTags(blog.tags).join(" ").toLowerCase().includes(lower) ||
        blog.author_name?.toLowerCase().includes(lower);

      const categoryMatch = category === "all" || getContentCategory(blog) === category;
      return searchMatch && categoryMatch;
    });
  }, [blogs, searchTerm, category]);

  const totalPages = Math.max(1, Math.ceil(filteredBlogs.length / itemsPerPage));
  const displayedBlogs = filteredBlogs.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <>
      <HeaderOne />
      <BreadcrumbOne title="Articles" links={[{ name: "Home", link: "/" }, { name: "Articles", link: "/blog-grid" }]} />

      <section className="py-5 bg-light">
        <div className="container py-4">
          <div className="row mb-5 justify-content-center">
            <div className="col-lg-8 text-center">
              <h2 className="fw-bold mb-3">Articles</h2>
              <p className="text-muted lead">Browse Islamic insights, reflections, reminders, and practical writing that support faith, family, and community growth.</p>
              <div className="input-group shadow-sm mt-4 rounded-pill overflow-hidden mx-auto" style={{ maxWidth: "500px" }}>
                <span className="input-group-text bg-white border-0 ps-4"><i className="bi bi-search text-muted"></i></span>
                <input
                  type="text"
                  className="form-control border-0 py-3 ps-2 shadow-none"
                  placeholder="Search articles, tags, or topics..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                />
              </div>
              <div className="d-flex flex-wrap gap-2 justify-content-center mt-4">
                {categories.map((option) => (
                  <button
                    key={option}
                    type="button"
                    className={`btn rounded-pill ${category === option ? "btn-primary" : "btn-outline-primary"}`}
                    onClick={() => {
                      setCategory(option);
                      setCurrentPage(1);
                    }}
                  >
                    {option === "all" ? "All categories" : option}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {loading ? (
            <div className="row justify-content-center my-5">
              {[1, 2, 3].map((n) => (
                <div key={n} className="col-lg-4 col-md-6 mb-4">
                  <div className="card border-0 shadow-sm rounded-4" aria-hidden="true">
                    <div className="card-img-top placeholder-glow" style={{ height: "200px", backgroundColor: "#e9ecef" }}>
                      <span className="placeholder w-100 h-100"></span>
                    </div>
                    <div className="card-body p-4">
                      <h5 className="card-title placeholder-glow"><span className="placeholder col-6"></span></h5>
                      <p className="card-text placeholder-glow">
                        <span className="placeholder col-7"></span>
                        <span className="placeholder col-4"></span>
                        <span className="placeholder col-4"></span>
                        <span className="placeholder col-6"></span>
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : displayedBlogs.length === 0 ? (
            <div className="text-center py-5">
              <i className="bi bi-journal-x display-1 text-muted mb-3 d-block"></i>
              <h4 className="fw-bold">No articles found</h4>
              <p className="text-muted">Try adjusting your search or selecting another category.</p>
            </div>
          ) : (
            <>
              <div className="row g-4">
                {displayedBlogs.map((blog) => (
                  <div className="col-lg-4 col-md-6" key={buildContentIdentifier(blog, "article")}>
                    <div className="card h-100 border-0 shadow-sm rounded-4 overflow-hidden card-hover">
                      {blog.image_url ? (
                        <Image src={blog.image_url} className="card-img-top" alt={blog.title} width={800} height={220} style={{ height: "220px", objectFit: "cover" }} unoptimized />
                      ) : (
                        <div className="card-img-top d-flex align-items-center justify-content-center bg-secondary bg-opacity-10" style={{ height: "220px" }}>
                          <i className="bi bi-image text-muted display-4"></i>
                        </div>
                      )}
                      <div className="card-body p-4 d-flex flex-column">
                        <div className="d-flex justify-content-between align-items-center mb-3 gap-2">
                          <span className="badge bg-primary bg-opacity-10 text-primary rounded-pill px-3 py-2">
                            {getContentCategory(blog)}
                          </span>
                          <small className="text-muted"><i className="bi bi-clock me-1"></i> {new Date(blog.created_at).toLocaleDateString()}</small>
                        </div>
                        {blog.featured ? <span className="badge bg-warning text-dark rounded-pill align-self-start mb-3">Featured</span> : null}
                        <h4 className="card-title fw-bold mb-3">{blog.title}</h4>
                        <p className="card-text text-muted mb-3 flex-grow-1">{getExcerpt(blog.content || "", 130)}</p>
                        <div className="d-flex flex-wrap gap-2 mb-4">
                          {normalizeTags(blog.tags).slice(0, 3).map((tag) => (
                            <span key={tag} className="badge bg-light text-dark border">
                              {tag}
                            </span>
                          ))}
                        </div>
                        <div className="d-flex justify-content-between align-items-center mt-auto gap-2">
                          <Link href={getContentPath("blog", blog)} className="btn btn-outline-primary fw-semibold rounded-pill border-2 px-4 py-2">
                            Read Article <i className="bi bi-arrow-right ms-2"></i>
                          </Link>
                          <SaveContentButton item={blog} type="blog" className="btn btn-outline-secondary rounded-pill" />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {totalPages > 1 ? (
                <div className="row mt-5">
                  <div className="col-12 d-flex justify-content-center">
                    <nav aria-label="Articles navigation">
                      <ul className="pagination pagination-lg">
                        <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
                          <button type="button" className="page-link rounded-start-pill px-4" onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}>Prev</button>
                        </li>
                        {[...Array(totalPages)].map((_, i) => (
                          <li key={i} className={`page-item ${currentPage === i + 1 ? "active" : ""}`}>
                            <button type="button" className="page-link" onClick={() => setCurrentPage(i + 1)}>{i + 1}</button>
                          </li>
                        ))}
                        <li className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}>
                          <button type="button" className="page-link rounded-end-pill px-4" onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}>Next</button>
                        </li>
                      </ul>
                    </nav>
                  </div>
                </div>
              ) : null}
            </>
          )}
        </div>
      </section>

      <FooterOne />

      <style dangerouslySetInnerHTML={{ __html: `
        .card-hover { transition: transform 0.3s ease, box-shadow 0.3s ease; }
        .card-hover:hover { transform: translateY(-5px); box-shadow: 0 1rem 3rem rgba(0,0,0,.15)!important; }
      ` }} />
    </>
  );
}
