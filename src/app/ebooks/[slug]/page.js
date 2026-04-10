import Link from "next/link";
import { notFound } from "next/navigation";

import BreadcrumbOne from "@/components/BreadcrumbOne";
import FooterOne from "@/components/FooterOne";
import HeaderOne from "@/components/HeaderOne";
import { getEbookBySlug, getRelatedEbooks } from "@/lib/ebook-data";

export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  const ebook = getEbookBySlug(resolvedParams.slug);

  if (!ebook) {
    return {
      title: "E-Book Not Found | IRWA",
    };
  }

  return {
    title: `${ebook.title} | IRWA E-Books`,
    description: ebook.summary,
  };
}

export default async function EbookDetailPage({ params }) {
  const resolvedParams = await params;
  const ebook = getEbookBySlug(resolvedParams.slug);

  if (!ebook) {
    notFound();
  }

  const relatedEbooks = getRelatedEbooks(ebook.slug, 5);

  return (
    <>
      <HeaderOne />
      <BreadcrumbOne
        title={ebook.title}
        links={[
          { name: "Home", link: "/" },
          { name: "E-Books", link: "/ebooks" },
          { name: ebook.title, link: `/ebooks/${ebook.slug}` },
        ]}
      />

      <section className="py-5 page-surface-alt">
        <div className="container">
          <div className="row g-4 align-items-start">
            <div className="col-lg-8">
              <div className="content-panel p-4 p-lg-5 mb-4">
                <div className="row g-4 align-items-start">
                  <div className="col-md-4">
                    <div
                      className="rounded-4 p-4 d-flex flex-column justify-content-between"
                      style={{
                        minHeight: "320px",
                        background:
                          "linear-gradient(160deg, rgba(11,61,46,0.96) 0%, rgba(20,90,50,0.96) 100%)",
                        color: "#fff",
                        boxShadow: "0 24px 42px rgba(11,61,46,0.12)",
                      }}
                    >
                      <span className="badge align-self-start" style={{ background: "rgba(200,169,81,0.18)", color: "#f3e1ad" }}>
                        {ebook.category}
                      </span>
                      <div>
                        <div className="small text-white-50 mb-2">{ebook.language}</div>
                        <h1 className="h3 fw-bold mb-3 text-white">{ebook.title}</h1>
                        <div className="small text-white-50">{ebook.pages} pages</div>
                      </div>
                    </div>
                  </div>

                  <div className="col-md-8">
                    <span className="badge bg-success-subtle text-success rounded-pill mb-3">
                      IRWA E-Book Library
                    </span>
                    <h2 className="fw-bold mb-3">{ebook.title}</h2>
                    <p className="lead text-muted mb-3">{ebook.summary}</p>
                    <div className="d-flex flex-wrap gap-3 mb-4 small text-muted">
                      <span><strong className="text-dark">Author:</strong> {ebook.author}</span>
                      <span><strong className="text-dark">Category:</strong> {ebook.category}</span>
                      <span><strong className="text-dark">Published:</strong> {new Date(ebook.publishedAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}</span>
                    </div>
                    <p className="text-muted mb-4">{ebook.highlight}</p>
                    <div className="d-flex flex-wrap gap-3">
                      <a href="#ebook-summary" onClick={(e) => { e.preventDefault(); document.getElementById("ebook-summary")?.scrollIntoView({ behavior: "smooth" }); }} className="btn btn-primary btn-ripple rounded-pill px-4">
                        Read Summary
                      </a>
                      <Link href="/ebooks" className="btn btn-outline-primary btn-ripple rounded-pill px-4">
                        Browse Library
                      </Link>
                    </div>
                  </div>
                </div>
              </div>

              <div className="content-panel p-4 p-lg-5" id="ebook-summary">
                <h3 className="fw-bold mb-3">About this ebook</h3>
                <div className="content-prose">
                  <p>{ebook.description}</p>
                  <p>
                    This section is structured to feel like a lightweight Islamic ebook library:
                    clear category browsing, simple metadata, and distraction-free reading.
                  </p>
                </div>
              </div>
            </div>

            <div className="col-lg-4">
              <div className="content-panel p-4 mb-4">
                <h5 className="fw-bold mb-3">Library details</h5>
                <div className="d-flex flex-column gap-3">
                  <div className="d-flex justify-content-between">
                    <span className="text-muted">Format</span>
                    <strong>Digital Ebook</strong>
                  </div>
                  <div className="d-flex justify-content-between">
                    <span className="text-muted">Language</span>
                    <strong>{ebook.language}</strong>
                  </div>
                  <div className="d-flex justify-content-between">
                    <span className="text-muted">Pages</span>
                    <strong>{ebook.pages}</strong>
                  </div>
                  <div className="d-flex justify-content-between">
                    <span className="text-muted">Category</span>
                    <strong>{ebook.category}</strong>
                  </div>
                </div>
              </div>

              <div className="content-panel p-4">
                <h5 className="fw-bold mb-3">Related ebooks</h5>
                <ul className="islamweb-like-list">
                  {relatedEbooks.map((item) => (
                    <li key={item.slug}>
                      <Link href={`/ebooks/${item.slug}`} className="islamweb-like-mini-link">
                        {item.title}
                      </Link>
                    </li>
                  ))}
                </ul>
                <Link href="/ebooks" className="btn btn-outline-primary btn-ripple rounded-pill mt-4">
                  Back to all ebooks
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
