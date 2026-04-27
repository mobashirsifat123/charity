"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import ReadabilityToolbar from "@/components/ReadabilityToolbar";
import { useReadability } from "@/context/ReadabilityContext";

function getSectionHref(surahId, section) {
  return `/quran/tafseer/${surahId}/${section.slug}`;
}

export default function TafseerReaderClient({ tafseer }) {
  const [sectionsOpen, setSectionsOpen] = useState(false);
  const [referencesOpen, setReferencesOpen] = useState(false);
  const { getReadingStyle } = useReadability();

  const references = tafseer?.content?.references || [];
  const currentSection = tafseer?.section;
  const sectionTitle = currentSection?.ayah_start
    ? `${currentSection.ayah_start}${currentSection.ayah_end && currentSection.ayah_end !== currentSection.ayah_start ? `-${currentSection.ayah_end}` : ""}`
    : currentSection?.title;

  const bodyHtml = useMemo(
    () => ({ __html: tafseer?.content?.body || "" }),
    [tafseer],
  );

  return (
    <section className="py-5 page-surface-alt">
      <div className="container">
        <div className="tafseer-reader-shell">
          <aside className="tafseer-sections-panel d-none d-lg-block">
            <TafseerSectionList tafseer={tafseer} />
          </aside>

          <main className="tafseer-reader-main">
            <div className="d-flex flex-wrap justify-content-between gap-3 mb-4">
              <Link href="/quran/tafseer" className="quran-back-link">
                <i className="fa-solid fa-arrow-left" /> Tafseer Directory
              </Link>
              <button
                type="button"
                className="btn btn-outline-primary rounded-pill d-lg-none"
                onClick={() => setSectionsOpen(true)}
              >
                View Sections
              </button>
            </div>

            <ReadabilityToolbar title="Tafseer reading controls" />

            <article className="tafseer-article" style={getReadingStyle()}>
              <span className="theme-badge-soft mb-3">
                {tafseer.surah.name} - {tafseer.surah.arabicName}
              </span>
              <h1>{sectionTitle}</h1>
              <p className="tafseer-article__meta">
                {tafseer.content.author_name || "IRWAA Editorial Team"}
              </p>
              <div
                className="tafseer-article__body"
                dangerouslySetInnerHTML={bodyHtml}
              />
            </article>

            <div className="tafseer-pagination">
              {tafseer.previous ? (
                <Link
                  href={
                    tafseer.previous.type === "section"
                      ? getSectionHref(
                          tafseer.surah.number,
                          tafseer.previous.section,
                        )
                      : `/quran/tafseer/${tafseer.previous.surah.number}/introduction`
                  }
                  className="btn btn-light rounded-pill"
                >
                  Previous
                </Link>
              ) : (
                <span />
              )}
              {tafseer.next ? (
                <Link
                  href={
                    tafseer.next.type === "section"
                      ? getSectionHref(
                          tafseer.surah.number,
                          tafseer.next.section,
                        )
                      : `/quran/tafseer/${tafseer.next.surah.number}/introduction`
                  }
                  className="btn btn-primary rounded-pill"
                >
                  Next
                </Link>
              ) : null}
            </div>

            {references.length ? (
              <section className="tafseer-references">
                <button
                  type="button"
                  className="tafseer-references__toggle"
                  onClick={() => setReferencesOpen((current) => !current)}
                >
                  References ({references.length})
                  <i
                    className={`fa-solid fa-chevron-${referencesOpen ? "up" : "down"}`}
                  />
                </button>
                {referencesOpen ? (
                  <ol>
                    {references.map((reference, index) => (
                      <li key={`${reference}-${index}`}>{reference}</li>
                    ))}
                  </ol>
                ) : null}
              </section>
            ) : null}
          </main>
        </div>
      </div>

      {sectionsOpen ? (
        <div className="tafseer-mobile-drawer">
          <button
            type="button"
            className="tafseer-mobile-drawer__overlay"
            aria-label="Close sections"
            onClick={() => setSectionsOpen(false)}
          />
          <aside className="tafseer-mobile-drawer__panel">
            <button
              type="button"
              className="tafseer-mobile-drawer__close"
              onClick={() => setSectionsOpen(false)}
            >
              <i className="fa-solid fa-xmark" />
            </button>
            <TafseerSectionList
              tafseer={tafseer}
              onNavigate={() => setSectionsOpen(false)}
            />
          </aside>
        </div>
      ) : null}
    </section>
  );
}

function TafseerSectionList({ tafseer, onNavigate }) {
  return (
    <div className="tafseer-sections-list">
      <h2>Choose item</h2>
      <Link href={`/quran/${tafseer.surah.number}`} className="quran-back-link">
        Read Surah
      </Link>
      <div className="mt-3">
        {tafseer.sections.map((section) => {
          const active = section.slug === tafseer.section.slug;
          const label = section.ayah_start
            ? `${section.ayah_start}${section.ayah_end && section.ayah_end !== section.ayah_start ? `-${section.ayah_end}` : ""}`
            : section.title;

          return (
            <Link
              href={getSectionHref(tafseer.surah.number, section)}
              className={`tafseer-section-link ${active ? "is-active" : ""}`}
              key={section.slug}
              onClick={onNavigate}
            >
              <span>{tafseer.surah.name}</span>
              <strong>{label}</strong>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
