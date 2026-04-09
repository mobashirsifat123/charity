"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

import BreadcrumbOne from "@/components/BreadcrumbOne";
import FooterOne from "@/components/FooterOne";
import HeaderOne from "@/components/HeaderOne";
import { listEbookCategories, listEbooks } from "@/lib/ebook-data";

const ITEMS_PER_PAGE = 10;

export default function EbooksPage() {
  const ebooks = useMemo(() => listEbooks(), []);
  const categories = useMemo(() => ["all", ...listEbookCategories()], []);
  const latestEbooks = useMemo(() => ebooks.slice(0, 8), [ebooks]);

  const [searchTerm, setSearchTerm] = useState("");
  const [category, setCategory] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);

  const filteredEbooks = useMemo(() => {
    const lowerSearch = searchTerm.trim().toLowerCase();

    return ebooks.filter((ebook) => {
      const matchesSearch =
        !lowerSearch ||
        ebook.title.toLowerCase().includes(lowerSearch) ||
        ebook.summary.toLowerCase().includes(lowerSearch) ||
        ebook.description.toLowerCase().includes(lowerSearch) ||
        ebook.author.toLowerCase().includes(lowerSearch) ||
        ebook.category.toLowerCase().includes(lowerSearch);

      const matchesCategory = category === "all" || ebook.category === category;
      return matchesSearch && matchesCategory;
    });
  }, [category, ebooks, searchTerm]);

  const totalPages = Math.max(1, Math.ceil(filteredEbooks.length / ITEMS_PER_PAGE));
  const displayedEbooks = filteredEbooks.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const resetToFirstPage = () => setCurrentPage(1);

  return (
    <>
      <HeaderOne />
      <BreadcrumbOne
        title="E-Books"
        links={[
          { name: "Home", link: "/" },
          { name: "E-Books", link: "/ebooks" },
        ]}
      />

      <section className="py-5 bg-white">
        <div className="container">
          <div className="row g-4">
            <aside className="col-lg-4 col-xl-3">
              <div className="islamweb-like-panel sticky-lg-top" style={{ top: "110px" }}>
                <div className="islamweb-like-block">
                  <h5 className="islamweb-like-block-title">Search</h5>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Search ebooks, authors, or subjects..."
                    value={searchTerm}
                    onChange={(event) => {
                      setSearchTerm(event.target.value);
                      resetToFirstPage();
                    }}
                  />
                </div>

                <div className="islamweb-like-block">
                  <h5 className="islamweb-like-block-title">Book Categories</h5>
                  <p className="text-muted small mb-3">
                    There are {categories.length - 1} book categories in this library.
                  </p>
                  <ul className="islamweb-like-list islamweb-like-scroll">
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
                          {item === "all" ? "All Ebooks" : item}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="islamweb-like-block">
                  <h5 className="islamweb-like-block-title">New E-Books</h5>
                  <ul className="islamweb-like-list">
                    {latestEbooks.map((ebook) => (
                      <li key={ebook.slug}>
                        <Link href={`/ebooks/${ebook.slug}`} className="islamweb-like-mini-link">
                          {ebook.title}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </aside>

            <div className="col-lg-8 col-xl-9">
              <div className="islamweb-like-feed">
                <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-3">
                  <div>
                    <h2 className="mb-1">E-Books</h2>
                    <p className="text-muted mb-0">
                      A growing reading shelf for dawah, worship, character, family, and Islamic learning.
                    </p>
                  </div>
                  <span className="text-muted small">
                    {filteredEbooks.length} book{filteredEbooks.length === 1 ? "" : "s"}
                  </span>
                </div>

                {!displayedEbooks.length ? (
                  <div className="p-4 border rounded-3 text-muted">
                    No ebooks match your current search or category filter.
                  </div>
                ) : (
                  <div className="islamweb-like-items">
                    {displayedEbooks.map((ebook) => (
                      <article className="islamweb-like-item" key={ebook.slug}>
                        <div className="row g-3 align-items-start">
                          <div className="col-md-3 col-lg-2">
                            <Link href={`/ebooks/${ebook.slug}`} className="text-decoration-none">
                              <div
                                className="rounded-4 p-3 d-flex flex-column justify-content-between hover-lift"
                                style={{
                                  minHeight: "170px",
                                  background:
                                    "linear-gradient(160deg, rgba(11,61,46,0.96) 0%, rgba(20,90,50,0.96) 100%)",
                                  color: "#fff",
                                  boxShadow: "0 18px 32px rgba(11,61,46,0.12)",
                                }}
                              >
                                <span className="badge align-self-start" style={{ background: "rgba(200,169,81,0.18)", color: "#f3e1ad" }}>
                                  {ebook.category}
                                </span>
                                <div>
                                  <div className="small text-white-50 mb-2">{ebook.pages} pages</div>
                                  <div className="fw-bold" style={{ lineHeight: 1.35 }}>{ebook.title}</div>
                                </div>
                              </div>
                            </Link>
                          </div>

                          <div className="col-md-9 col-lg-10">
                            <h3 className="islamweb-like-item-title mb-2">
                              <Link href={`/ebooks/${ebook.slug}`}>{ebook.title}</Link>
                            </h3>
                            <p className="islamweb-like-item-excerpt mb-2">{ebook.summary}</p>
                            <div className="islamweb-like-item-meta mb-3">
                              <span>{ebook.category}</span>
                              <span>•</span>
                              <span>{ebook.author}</span>
                              <span>•</span>
                              <span>{ebook.pages} pages</span>
                              <span>•</span>
                              <span>
                                {new Date(ebook.publishedAt).toLocaleDateString("en-US", {
                                  year: "numeric",
                                  month: "2-digit",
                                  day: "2-digit",
                                })}
                              </span>
                            </div>
                            <p className="text-muted mb-3">{ebook.highlight}</p>
                            <Link href={`/ebooks/${ebook.slug}`} className="islamweb-like-more">
                              More
                            </Link>
                          </div>
                        </div>
                      </article>
                    ))}
                  </div>
                )}

                {totalPages > 1 ? (
                  <nav className="mt-4" aria-label="Ebooks pagination">
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
