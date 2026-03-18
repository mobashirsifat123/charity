"use client";
import Link from "next/link";
import { getContentPath, getContentTitle, getExcerpt, getContentCategory } from "@/lib/content-utils";

export default function RelatedContentSection({ items = [], type, title }) {
  if (!items.length) return null;

  return (
    <section className="mt-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4 className="fw-bold mb-0">{title}</h4>
        <span className="text-muted small">{items.length} related result{items.length === 1 ? "" : "s"}</span>
      </div>
      <div className="row g-4">
        {items.map((item) => (
          <div key={item.id} className="col-md-6 col-xl-4">
            <div className="card border-0 shadow-sm rounded-4 h-100">
              <div className="card-body p-4 d-flex flex-column">
                <span className="badge bg-primary bg-opacity-10 text-primary rounded-pill align-self-start mb-3">
                  {getContentCategory(item)}
                </span>
                <h5 className="fw-bold mb-3">{getContentTitle(item, type)}</h5>
                <p className="text-muted flex-grow-1 mb-4">{getExcerpt(type === "fatwa" ? (item.answer || item.content || "") : item.content || "", 120)}</p>
                <Link href={getContentPath(type, item)} className="fw-semibold text-decoration-none">
                  Read more <i className="fa-solid fa-arrow-right ms-2"></i>
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
