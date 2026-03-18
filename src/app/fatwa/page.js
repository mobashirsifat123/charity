"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import HeaderOne from "@/components/HeaderOne";
import FooterOne from "@/components/FooterOne";
import BreadcrumbOne from "@/components/BreadcrumbOne";
import SaveContentButton from "@/components/SaveContentButton";
import { fetchPublishedFatwas } from "@/lib/content-data";
import {
  buildContentIdentifier,
  getContentCategory,
  getContentPath,
  getExcerpt,
  normalizeTags,
  sortFeaturedFirst,
} from "@/lib/content-utils";

export default function FatwaList() {
  const [fatwas, setFatwas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [category, setCategory] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  useEffect(() => {
    let active = true;

    const fetchFatwas = async () => {
      try {
        setLoading(true);
        const data = await fetchPublishedFatwas();
        if (active) setFatwas(sortFeaturedFirst(data));
      } catch (error) {
        console.error("Error fetching fatwas:", error.message);
      } finally {
        if (active) setLoading(false);
      }
    };

    fetchFatwas();

    return () => {
      active = false;
    };
  }, []);

  const categories = useMemo(
    () => ["all", ...Array.from(new Set(fatwas.map((item) => getContentCategory(item)).filter(Boolean)))],
    [fatwas]
  );

  const filteredFatwas = useMemo(() => {
    const lower = searchTerm.toLowerCase();
    return fatwas.filter((fatwa) => {
      const searchMatch =
        !lower ||
        (fatwa.title || fatwa.question || "").toLowerCase().includes(lower) ||
        (fatwa.answer || fatwa.content || "").toLowerCase().includes(lower) ||
        getContentCategory(fatwa).toLowerCase().includes(lower) ||
        normalizeTags(fatwa.tags).join(" ").toLowerCase().includes(lower) ||
        fatwa.author_name?.toLowerCase().includes(lower);

      const categoryMatch = category === "all" || getContentCategory(fatwa) === category;
      return searchMatch && categoryMatch;
    });
  }, [fatwas, searchTerm, category]);

  const totalPages = Math.max(1, Math.ceil(filteredFatwas.length / itemsPerPage));
  const displayedFatwas = filteredFatwas.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <>
      <HeaderOne />
      <BreadcrumbOne title="Fatwa Rulings" links={[{ name: "Home", link: "/" }, { name: "Fatwa", link: "/fatwa" }]} />

      <section className="py-5 bg-light min-vh-100">
        <div className="container py-4">
          <div className="row mb-5 align-items-center">
            <div className="col-lg-7 mb-4 mb-lg-0">
              <h2 className="fw-bold mb-3 display-5">Fatwas & Rulings</h2>
              <p className="text-muted fs-5">Browse answered questions, filter by topic, or submit a question for a future ruling.</p>
              <div className="d-flex gap-3 flex-wrap mt-4">
                <Link href="/request-fatwa" className="btn btn-primary rounded-pill px-4">
                  Ask a Question
                </Link>
                <Link href="/search?type=fatwa" className="btn btn-outline-primary rounded-pill px-4">
                  Unified Search
                </Link>
              </div>
            </div>
            <div className="col-lg-5 text-lg-end">
              <div className="d-inline-block w-100" style={{ maxWidth: "420px" }}>
                <div className="input-group shadow-sm rounded-pill overflow-hidden">
                  <span className="input-group-text bg-white border-0 ps-4"><i className="bi bi-search text-muted"></i></span>
                  <input
                    type="text"
                    className="form-control border-0 py-3 ps-2 shadow-none"
                    placeholder="Search by topic, question, tag, or scholar..."
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setCurrentPage(1);
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="d-flex flex-wrap gap-2 mb-4">
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
                {option === "all" ? "All topics" : option}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="row g-4">
              {[1, 2, 3, 4].map((n) => (
                <div key={n} className="col-md-6">
                  <div className="card border-0 shadow-sm rounded-4 h-100 p-4" aria-hidden="true">
                    <h4 className="card-title placeholder-glow"><span className="placeholder col-8"></span></h4>
                    <p className="card-text placeholder-glow mb-4">
                      <span className="placeholder col-12"></span>
                      <span className="placeholder col-10"></span>
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : displayedFatwas.length === 0 ? (
            <div className="text-center py-5 my-5 bg-white rounded-4 shadow-sm">
              <i className="bi bi-patch-question display-1 text-muted mb-3 d-block"></i>
              <h4 className="fw-bold">No rulings found</h4>
              <p className="text-muted">Could not find any fatwa matching your current filters.</p>
            </div>
          ) : (
            <>
              <div className="row g-4">
                {displayedFatwas.map((fatwa) => (
                  <div className="col-md-6" key={buildContentIdentifier(fatwa, "fatwa")}>
                    <div className="card h-100 border-0 shadow-sm rounded-4 hover-lift">
                      <div className="card-body p-4 d-flex flex-column">
                        <div className="d-flex justify-content-between align-items-start gap-3 mb-3">
                          <div className="d-flex">
                            <i className="bi bi-question-circle display-6 text-primary me-3 opacity-50"></i>
                            <div>
                              <h5 className="card-title fw-bold mb-2">{fatwa.title || fatwa.question}</h5>
                              <p className="text-muted small mb-0">
                                <i className="bi bi-calendar-event me-1"></i> {new Date(fatwa.created_at).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          {fatwa.featured ? <span className="badge bg-warning text-dark rounded-pill">Featured</span> : null}
                        </div>

                        <div className="d-flex flex-wrap gap-2 mb-3">
                          <span className="badge bg-primary bg-opacity-10 text-primary rounded-pill px-3 py-2">
                            {getContentCategory(fatwa)}
                          </span>
                          {normalizeTags(fatwa.tags).slice(0, 3).map((tag) => (
                            <span key={tag} className="badge bg-light text-dark border">
                              {tag}
                            </span>
                          ))}
                        </div>

                        <p className="card-text text-secondary mb-4 flex-grow-1" style={{ display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                          {getExcerpt(fatwa.answer || fatwa.content || "", 160) || "Tap to read the detailed answer."}
                        </p>

                        <div className="mt-auto d-flex justify-content-between align-items-center border-top pt-3 gap-2">
                          <Link href={getContentPath("fatwa", fatwa)} className="btn text-primary fw-semibold text-decoration-none p-0 d-flex align-items-center stretched-link">
                            Read Full Answer <i className="bi bi-arrow-right-short fs-4 ms-1 transition-transform"></i>
                          </Link>
                          <SaveContentButton item={fatwa} type="fatwa" className="btn btn-outline-secondary rounded-pill btn-sm" />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {totalPages > 1 ? (
                <div className="row mt-5">
                  <div className="col-12 flex-column d-flex align-items-center">
                    <nav>
                      <ul className="pagination pagination-lg shadow-sm rounded-pill overflow-hidden">
                        <li className={`page-item border-0 ${currentPage === 1 ? "disabled" : ""}`}>
                          <button type="button" className="page-link border-0 px-4" onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}>Prev</button>
                        </li>
                        {[...Array(totalPages)].map((_, i) => (
                          <li key={i} className={`page-item border-0 ${currentPage === i + 1 ? "active" : ""}`}>
                            <button type="button" className="page-link border-0" onClick={() => setCurrentPage(i + 1)}>{i + 1}</button>
                          </li>
                        ))}
                        <li className={`page-item border-0 ${currentPage === totalPages ? "disabled" : ""}`}>
                          <button type="button" className="page-link border-0 px-4" onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}>Next</button>
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
        .hover-lift { transition: transform 0.2s ease, box-shadow 0.2s ease; }
        .hover-lift:hover { transform: translateY(-3px); box-shadow: 0 .5rem 1rem rgba(0,0,0,.15)!important; }
        .transition-transform { transition: transform 0.2s ease; }
        .hover-lift:hover .transition-transform { transform: translateX(4px); }
      ` }} />
    </>
  );
}
