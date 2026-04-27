"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

function normalize(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/['’`]/g, "")
    .trim();
}

export default function TafseerDirectoryClient({ surahs = [] }) {
  const [query, setQuery] = useState("");

  const filteredSurahs = useMemo(() => {
    const normalizedQuery = normalize(query);
    if (!normalizedQuery) return surahs;

    return surahs.filter((surah) =>
      [surah.number, surah.name, surah.englishName, surah.arabicName]
        .map(normalize)
        .some((value) => value.includes(normalizedQuery)),
    );
  }, [query, surahs]);

  return (
    <section className="py-5 page-surface-alt">
      <div className="container">
        <div className="quran-toolbar mb-4">
          <div>
            <span className="theme-badge-soft mb-3">Tafseer of Quran</span>
            <h1 className="fw-bold mb-2">The overall Tafseer of Quran</h1>
            <p className="text-muted mb-0">
              Choose a Surah to read admin-managed introductions, ayah ranges,
              objectives, topics, and references.
            </p>
          </div>
          <div className="quran-search">
            <i className="fa-solid fa-magnifying-glass" />
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search Tafseer by Surah"
              aria-label="Search Tafseer Surahs"
            />
          </div>
        </div>

        <div className="tafseer-directory-grid">
          {filteredSurahs.map((surah) => (
            <Link
              href={`/quran/tafseer/${surah.number}/introduction`}
              className="tafseer-directory-card"
              key={surah.number}
            >
              <span className="tafseer-directory-card__number">
                {surah.number}
              </span>
              <span>
                <strong>{surah.name}</strong>
                <small>{surah.englishName}</small>
              </span>
              <span className="tafseer-directory-card__arabic" lang="ar">
                {surah.arabicName}
              </span>
              <i className="fa-solid fa-chevron-right" />
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
