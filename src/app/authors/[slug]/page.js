"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import HeaderOne from "@/components/HeaderOne";
import FooterOne from "@/components/FooterOne";
import BreadcrumbOne from "@/components/BreadcrumbOne";
import { fetchPublishedBlogs, fetchPublishedFatwas } from "@/lib/content-data";
import { getContentPath, getContentTitle, slugify } from "@/lib/content-utils";

export default function AuthorProfilePage() {
  const params = useParams();
  const slug = params?.slug;
  const [articles, setArticles] = useState([]);
  const [fatwas, setFatwas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const fetchAuthorContent = async () => {
      try {
        setLoading(true);
        const [blogs, rulings] = await Promise.all([fetchPublishedBlogs(), fetchPublishedFatwas()]);
        if (!active) return;

        setArticles((blogs || []).filter((item) => slugify(item.author_name || "IRWA Team") === slug));
        setFatwas((rulings || []).filter((item) => slugify(item.author_name || "IRWA Team") === slug));
      } catch (error) {
        console.error("Author profile error:", error);
      } finally {
        if (active) setLoading(false);
      }
    };

    fetchAuthorContent();

    return () => {
      active = false;
    };
  }, [slug]);

  const authorName = useMemo(() => articles[0]?.author_name || fatwas[0]?.author_name || "IRWA Team", [articles, fatwas]);
  const authorRole = useMemo(() => articles[0]?.author_role || fatwas[0]?.author_role || "Contributor", [articles, fatwas]);
  const authorBio = useMemo(() => articles[0]?.author_bio || fatwas[0]?.author_bio || "A contributor to the IRWA knowledge platform.", [articles, fatwas]);

  return (
    <section className="page-wrapper">
      <HeaderOne />
      <BreadcrumbOne
        title={authorName}
        links={[
          { name: "Home", link: "/" },
          { name: "Author", link: `/authors/${slug}` },
        ]}
      />
      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-lg-10">
            <div className="card border-0 shadow-sm rounded-4 mb-4">
              <div className="card-body p-4 p-md-5">
                <span className="badge bg-primary bg-opacity-10 text-primary rounded-pill mb-3">{authorRole}</span>
                <h1 className="fw-bold mb-3">{authorName}</h1>
                <p className="text-muted mb-0">{authorBio}</p>
              </div>
            </div>

            {loading ? (
              <div className="text-center py-5">
                <div className="spinner-border text-primary"></div>
              </div>
            ) : (
              <div className="row g-4">
                <div className="col-lg-6">
                  <div className="card border-0 shadow-sm rounded-4 h-100">
                    <div className="card-body p-4">
                      <h4 className="fw-bold mb-4">Articles</h4>
                      {articles.length ? articles.map((item) => (
                        <div key={item.id} className="border-bottom pb-3 mb-3">
                          <Link href={getContentPath("blog", item)} className="fw-semibold text-decoration-none d-block mb-1">
                            {getContentTitle(item, "blog")}
                          </Link>
                          <span className="text-muted small">{new Date(item.created_at).toLocaleDateString()}</span>
                        </div>
                      )) : <p className="text-muted mb-0">No published articles yet.</p>}
                    </div>
                  </div>
                </div>
                <div className="col-lg-6">
                  <div className="card border-0 shadow-sm rounded-4 h-100">
                    <div className="card-body p-4">
                      <h4 className="fw-bold mb-4">Fatwas</h4>
                      {fatwas.length ? fatwas.map((item) => (
                        <div key={item.id} className="border-bottom pb-3 mb-3">
                          <Link href={getContentPath("fatwa", item)} className="fw-semibold text-decoration-none d-block mb-1">
                            {getContentTitle(item, "fatwa")}
                          </Link>
                          <span className="text-muted small">{new Date(item.created_at).toLocaleDateString()}</span>
                        </div>
                      )) : <p className="text-muted mb-0">No published fatwas yet.</p>}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <FooterOne />
    </section>
  );
}
