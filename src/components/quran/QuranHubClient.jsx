"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { JUZ_SHORTCUTS } from "@/lib/quran/surah-data";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabaseClient";

function normalize(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/['’`]/g, "")
    .trim();
}

export default function QuranHubClient({ surahs = [] }) {
  const [query, setQuery] = useState("");
  const [activeJuz, setActiveJuz] = useState(null);
  const [progress, setProgress] = useState(null);
  const { user } = useAuth();

  const filteredSurahs = useMemo(() => {
    const normalizedQuery = normalize(query);
    if (!normalizedQuery) return surahs;

    return surahs.filter((surah) =>
      [
        surah.number,
        surah.name,
        surah.englishName,
        surah.arabicName,
        `${surah.number}. ${surah.name}`,
      ]
        .map(normalize)
        .some((value) => value.includes(normalizedQuery)),
    );
  }, [query, surahs]);

  useEffect(() => {
    let active = true;

    const loadProgress = async () => {
      if (!user || !Number.isInteger(Number(user.id))) {
        setProgress(null);
        return;
      }

      const { data, error } = await supabase
        .from("user_quran_progress")
        .select("surah_id, ayah_number, last_read_at")
        .eq("user_id", Number(user.id))
        .maybeSingle();

      if (!active) return;
      if (error) {
        setProgress(null);
        return;
      }

      setProgress(data || null);
    };

    loadProgress();

    return () => {
      active = false;
    };
  }, [user]);

  return (
    <>
      <section className="quran-hero section-shell">
        <div className="container">
          <div className="quran-hero__panel">
            <div>
              <span className="theme-badge-soft mb-3">Quran Learning</span>
              <h1 className="quran-hero__title">
                Read, reflect, and return to the Book of Allah
              </h1>
              <p className="quran-hero__text">
                Browse all 114 Surahs, listen to recitation, save your place,
                and move into Tafseer when you want deeper explanation.
              </p>
              <div className="d-flex flex-wrap gap-3 mt-4">
                <Link
                  href="/quran/1"
                  className="btn btn-primary rounded-pill px-4"
                >
                  Start Al-Fatihah
                </Link>
                <Link
                  href="/quran/tafseer"
                  className="btn btn-outline-primary rounded-pill px-4"
                >
                  Open Tafseer
                </Link>
                {progress ? (
                  <Link
                    href={`/quran/${progress.surah_id}`}
                    className="btn btn-light rounded-pill px-4"
                  >
                    Continue {progress.surah_id}:{progress.ayah_number}
                  </Link>
                ) : null}
              </div>
            </div>
            <div className="quran-hero__stats">
              <div>
                <strong>114</strong>
                <span>Surahs</span>
              </div>
              <div>
                <strong>30</strong>
                <span>Juz</span>
              </div>
              <div>
                <strong>6,236</strong>
                <span>Ayahs</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-5 page-surface-alt">
        <div className="container">
          <div className="quran-toolbar mb-4">
            <div>
              <span className="section-header-rail mb-2">Directory</span>
              <h2 className="fw-bold mb-0">Choose a Surah</h2>
            </div>
            <div className="quran-search">
              <i className="fa-solid fa-magnifying-glass" />
              <input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search by Surah name, Arabic name, or number"
                aria-label="Search Surahs"
              />
            </div>
          </div>

          <div className="compact-chip-scroll mb-4">
            {JUZ_SHORTCUTS.map((juz) => (
              <button
                key={juz.number}
                type="button"
                className={`quran-juz-chip ${activeJuz === juz.number ? "is-active" : ""}`}
                onClick={() =>
                  setActiveJuz((current) =>
                    current === juz.number ? null : juz.number,
                  )
                }
              >
                {juz.label}
              </button>
            ))}
          </div>

          {activeJuz ? (
            <div className="alert alert-success border-0 rounded-4 mb-4">
              Juz shortcuts are ready for navigation. Full Juz-to-ayah linking
              can be expanded from this structure after the Quran content module
              is populated.
            </div>
          ) : null}

          <div className="quran-surah-grid">
            {filteredSurahs.map((surah) => (
              <Link
                href={`/quran/${surah.number}`}
                className="quran-surah-card"
                key={surah.number}
              >
                <span className="quran-surah-card__number">{surah.number}</span>
                <span className="quran-surah-card__content">
                  <strong>{surah.name}</strong>
                  <small>{surah.englishName}</small>
                </span>
                <span className="quran-surah-card__arabic" lang="ar">
                  {surah.arabicName}
                </span>
                <span className="quran-surah-card__meta">
                  {surah.ayahs} ayahs • {surah.revelationType}
                </span>
              </Link>
            ))}
          </div>

          {!filteredSurahs.length ? (
            <div className="quran-empty-state">
              No Surah matched your search. Try a number like “2” or a name like
              “Baqarah.”
            </div>
          ) : null}
        </div>
      </section>
    </>
  );
}
