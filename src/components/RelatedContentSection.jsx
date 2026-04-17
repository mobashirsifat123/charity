"use client";
import Link from "next/link";
import Image from "next/image";
import { useLanguage } from "@/context/LanguageContext";
import { translateFatwaCategory } from "@/lib/i18n";
import {
  estimateReadTime,
  getContentPath,
  getContentTitle,
  getExcerpt,
  getContentCategory,
} from "@/lib/content-utils";

export default function RelatedContentSection({ items = [], type, title }) {
  const { locale, t } = useLanguage();

  if (!items.length) return null;

  return (
    <section className="mt-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4 className="fw-bold mb-0">{title}</h4>
        <span className="text-muted small">
          {items.length} {t("relatedItems", "related items")}
        </span>
      </div>
      <div className="row g-4">
        {items.map((item) => (
          <div key={item.id} className="col-md-6 col-xl-4">
            <div className="card border-0 shadow-sm rounded-4 h-100 related-reading-card">
              {item.image_url ? (
                <Link
                  href={getContentPath(type, item)}
                  className="related-reading-card__media"
                >
                  <Image
                    src={item.image_url}
                    alt={getContentTitle(item, type)}
                    fill
                    sizes="(max-width: 767px) 100vw, (max-width: 1199px) 50vw, 25vw"
                    className="related-reading-card__image"
                  />
                </Link>
              ) : null}

              <div className="card-body p-4 d-flex flex-column">
                <div className="d-flex flex-wrap align-items-center gap-2 mb-3">
                  <span className="badge bg-primary bg-opacity-10 text-primary rounded-pill align-self-start">
                    {type === "fatwa"
                      ? translateFatwaCategory(locale, getContentCategory(item))
                      : getContentCategory(item)}
                  </span>
                  <span className="small text-muted">
                    {estimateReadTime(
                      type === "fatwa"
                        ? item.answer || item.content || ""
                        : item.content || "",
                    )}{" "}
                    min read
                  </span>
                </div>
                <h5 className="fw-bold mb-3">{getContentTitle(item, type)}</h5>
                <p className="text-muted flex-grow-1 mb-4">
                  {getExcerpt(
                    type === "fatwa"
                      ? item.answer || item.content || ""
                      : item.content || "",
                    120,
                  )}
                </p>
                <Link
                  href={getContentPath(type, item)}
                  className="fw-semibold text-decoration-none"
                >
                  {t("readMore", "Read more")}{" "}
                  <i className="fa-solid fa-arrow-right ms-2"></i>
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
