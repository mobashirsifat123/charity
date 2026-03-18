"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { fetchFatwaByIdentifier, fetchPublishedFatwas, getRelatedContent } from "@/lib/content-data";
import {
  getAuthorName,
  getAuthorRole,
  getContentCategory,
  getContentPath,
  getContentTitle,
  incrementViewCount,
  normalizeTags,
  slugify,
} from "@/lib/content-utils";
import { supabase } from "@/lib/supabaseClient";
import HeaderOne from "@/components/HeaderOne";
import FooterOne from "@/components/FooterOne";
import RelatedContentSection from "@/components/RelatedContentSection";
import SaveContentButton from "@/components/SaveContentButton";

export default function FatwaDetails() {
  const params = useParams();
  const identifier = params?.id;
  const [fatwa, setFatwa] = useState(null);
  const [relatedFatwas, setRelatedFatwas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  const shareUrl = useMemo(() => {
    if (typeof window === "undefined" || !fatwa) return "";
    return `${window.location.origin}${getContentPath("fatwa", fatwa)}`;
  }, [fatwa]);

  useEffect(() => {
    let active = true;

    const fetchFatwa = async () => {
      try {
        setLoading(true);
        const ruling = await fetchFatwaByIdentifier(identifier);
        const allFatwas = await fetchPublishedFatwas();

        if (!active) return;

        setFatwa(ruling);
        setRelatedFatwas(getRelatedContent(allFatwas, ruling, "fatwa", 3));
        incrementViewCount({ supabase, table: "fatwas", record: ruling });
      } catch (error) {
        console.error("Error fetching fatwa:", error.message);
      } finally {
        if (active) setLoading(false);
      }
    };

    if (identifier) fetchFatwa();

    return () => {
      active = false;
    };
  }, [identifier]);

  useEffect(() => {
    if (typeof document === "undefined" || !fatwa) return;
    document.title = fatwa.seo_title || `${getContentTitle(fatwa, "fatwa")} | IRWA`;
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute("content", fatwa.seo_description || (fatwa.answer || fatwa.content || "").slice(0, 150));
    }
  }, [fatwa]);

  const handleShare = async (platform) => {
    if (!fatwa) return;

    const title = getContentTitle(fatwa, "fatwa");
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
        console.error("Failed to copy fatwa link:", error);
      }
      return;
    }

    window.open(shareTargets[platform], "_blank", "noopener,noreferrer,width=640,height=720");
  };

  if (loading) {
    return (
      <>
        <HeaderOne />
        <div className="container py-5 my-5 d-flex justify-content-center align-items-center flex-column" style={{ minHeight: "50vh" }}>
          <div className="spinner-border text-primary fs-4" role="status" style={{ width: "4rem", height: "4rem" }}>
            <span className="visually-hidden">Loading...</span>
          </div>
          <h4 className="mt-4 text-muted fw-light">Retrieving Ruling...</h4>
        </div>
        <FooterOne />
      </>
    );
  }

  if (!fatwa) {
    return (
      <>
        <HeaderOne />
        <div className="container py-5 my-5 text-center" style={{ minHeight: "50vh" }}>
          <i className="bi bi-x-circle display-1 text-danger mb-4 d-block opacity-75"></i>
          <h2 className="fw-bold">Fatwa Not Found</h2>
          <p className="text-muted mb-5 fs-5">This specific ruling may have been moved or removed from our database.</p>
          <Link href="/fatwa" className="btn btn-primary rounded-pill px-5 py-2 fw-semibold shadow-sm">Back to Rulings</Link>
        </div>
        <FooterOne />
      </>
    );
  }

  const authorName = getAuthorName(fatwa, "IRWA Scholar");
  const authorRole = getAuthorRole(fatwa, "Fatwa Contributor");
  const authorPath = `/authors/${slugify(authorName)}`;
  const tags = normalizeTags(fatwa.tags);
  const answerHtml = fatwa.answer || fatwa.content || "";

  return (
    <>
      <HeaderOne />

      <section className="bg-primary bg-gradient py-5 position-relative overflow-hidden">
        <div className="position-absolute top-0 start-0 w-100 h-100 bg-dark opacity-10"></div>
        <div className="container position-relative z-1 py-4 text-white">
          <Link href="/fatwa" className="text-white-50 text-decoration-none d-inline-flex align-items-center mb-4 hover-white transition-all">
            <i className="bi bi-arrow-left me-2"></i> All Rulings
          </Link>
          <div className="row">
            <div className="col-lg-10">
              <div className="d-flex flex-wrap gap-2 mb-3">
                <span className="badge bg-white text-primary px-3 py-2 rounded-pill fw-semibold shadow-sm fs-6">
                  {getContentCategory(fatwa)}
                </span>
                {fatwa.featured ? <span className="badge bg-warning text-dark px-3 py-2 rounded-pill fw-semibold shadow-sm fs-6">Featured</span> : null}
              </div>
              <h1 className="fw-bold mb-3 lh-base" style={{ fontSize: "clamp(2rem, 4vw, 3rem)" }}>
                {getContentTitle(fatwa, "fatwa")}
              </h1>
              <div className="d-flex align-items-center text-white-50 mt-4 fs-5 flex-wrap">
                <span><i className="bi bi-calendar-event me-2"></i>{new Date(fatwa.created_at).toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" })}</span>
                <span className="mx-3">•</span>
                <Link href={authorPath} className="text-white-50 text-decoration-none">
                  <i className="bi bi-bookmark-check me-2"></i>{authorName}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-5 bg-light" style={{ minHeight: "400px" }}>
        <div className="container py-4">
          <div className="row justify-content-center">
            <div className="col-lg-10">
              {fatwa.question ? (
                <div className="card border-0 shadow-sm rounded-4 mb-4 p-4 p-md-5 bg-white position-relative overflow-hidden">
                  <div className="position-absolute top-0 end-0 p-4 opacity-10">
                    <i className="bi bi-quote display-1"></i>
                  </div>
                  <h4 className="text-primary fw-bold mb-3 d-flex align-items-center">
                    <i className="bi bi-question-circle me-3 fs-3"></i> Question
                  </h4>
                  <p className="fs-5 text-dark lh-lg mb-0">{fatwa.question}</p>
                </div>
              ) : null}

              <div className="card border-0 shadow-lg rounded-4 mb-4 position-relative">
                <div className="card-body p-4 p-md-5">
                  <div className="d-flex flex-wrap gap-2 mb-3">
                    {tags.map((tag) => (
                      <span key={tag} className="badge bg-light text-dark border px-3 py-2 rounded-pill">
                        {tag}
                      </span>
                    ))}
                  </div>
                  <h4 className="text-success fw-bold border-bottom pb-3 mb-4 d-flex align-items-center">
                    <i className="bi bi-check-circle-fill me-3 fs-3"></i> Scholar Answer
                  </h4>
                  <div className="fatwa-answer text-dark fs-5 mb-0" style={{ lineHeight: "1.9" }} dangerouslySetInnerHTML={{ __html: answerHtml }}></div>
                </div>
              </div>

              <div className="card border-0 shadow-sm rounded-4 mb-5">
                <div className="card-body p-4">
                  <div className="row g-3 align-items-center">
                    <div className="col-lg-7">
                      <h5 className="fw-bold mb-1">{authorName}</h5>
                      <p className="text-muted mb-2">{authorRole}</p>
                      <p className="text-muted mb-0">{fatwa.author_bio || "Follow guidance prepared with clarity, evidence, and care for the community."}</p>
                    </div>
                    <div className="col-lg-5 text-lg-end">
                      <Link href={authorPath} className="btn btn-outline-primary rounded-pill px-4">
                        View Scholar Profile
                      </Link>
                    </div>
                  </div>
                </div>
              </div>

              <div className="d-flex flex-column flex-sm-row justify-content-between align-items-center mb-5 gap-3 border-top pt-4">
                <div className="d-flex align-items-center flex-wrap gap-2">
                  <span className="text-muted me-1 fw-medium">Share Ruling:</span>
                  <SaveContentButton item={fatwa} type="fatwa" />
                  <button type="button" className="btn btn-light rounded-circle shadow-sm mx-1 text-primary" style={{ width: "45px", height: "45px" }} onClick={() => handleShare("facebook")}><i className="bi bi-facebook mx-auto"></i></button>
                  <button type="button" className="btn btn-light rounded-circle shadow-sm mx-1 text-info" style={{ width: "45px", height: "45px" }} onClick={() => handleShare("twitter")}><i className="bi bi-twitter mx-auto"></i></button>
                  <button type="button" className="btn btn-light rounded-circle shadow-sm mx-1 text-success" style={{ width: "45px", height: "45px" }} onClick={() => handleShare("whatsapp")}><i className="bi bi-whatsapp mx-auto"></i></button>
                  <button type="button" className="btn btn-light rounded-circle shadow-sm mx-1 text-secondary" style={{ width: "45px", height: "45px" }} onClick={() => handleShare("copy")}><i className="bi bi-link-45deg mx-auto"></i></button>
                </div>
                <div className="d-flex flex-wrap gap-2">
                  <button type="button" className="btn btn-outline-secondary rounded-pill px-4" onClick={() => window.print()}>
                    <i className="bi bi-printer me-2"></i> Print Ruling
                  </button>
                  <Link href="/request-fatwa" className="btn btn-primary rounded-pill px-4">
                    Ask a New Question
                  </Link>
                </div>
              </div>
              {copied ? <p className="text-success small mb-4">Fatwa link copied.</p> : null}

              <RelatedContentSection items={relatedFatwas} type="fatwa" title="Related Fatwas" />
            </div>
          </div>
        </div>
      </section>

      <FooterOne />

      <style dangerouslySetInnerHTML={{ __html: `
        .hover-white:hover { color: white!important; }
        .fatwa-answer p { margin-bottom: 1.5rem; }
        .fatwa-answer p:last-child { margin-bottom: 0; }
        @media print {
            header, footer, .btn, .bg-primary { display: none !important; }
            .bg-light { background: white !important; }
            .card { box-shadow: none !important; border: 1px solid #ddd !important; }
            body { padding: 0; margin: 0; }
        }
      ` }} />
    </>
  );
}
