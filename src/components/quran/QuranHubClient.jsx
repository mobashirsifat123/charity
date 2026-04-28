"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import KnowledgePageHeader from "@/components/KnowledgePageHeader";
import { JUZ_SHORTCUTS } from "@/lib/quran/surah-data";
import { useAuth } from "@/context/AuthContext";
import { usePersonalization } from "@/context/PersonalizationContext";
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
  const { quranProgress, trackFeature } = usePersonalization();

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
      const localProgress = quranProgress;

      if (!user || !Number.isInteger(Number(user.id))) {
        setProgress(localProgress);
        return;
      }

      const { data, error } = await supabase
        .from("user_quran_progress")
        .select("surah_id, ayah_number, last_read_at")
        .eq("user_id", Number(user.id))
        .maybeSingle();

      if (!active) return;
      if (error) {
        setProgress(localProgress);
        return;
      }

      setProgress(data || localProgress);
    };

    loadProgress();

    return () => {
      active = false;
    };
  }, [quranProgress, user]);

  useEffect(() => {
    trackFeature({
      href: "/quran",
      label: "Quran",
      icon: "fa-book-quran",
    });
  }, [trackFeature]);

  return (
    <>
      <KnowledgePageHeader
        badge="Quran Learning"
        title="Read, reflect, and return to the Book of Allah"
        description="Browse all 114 Surahs, listen to recitation, save your place, and move into Tafseer when you want deeper explanation."
        links={[
          { name: "Home", link: "/" },
          { name: "Quran", link: "/quran" },
        ]}
        stats={[
          { value: "114", label: "Surahs" },
          { value: "30", label: "Juz" },
          { value: "6,236", label: "Ayahs" },
        ]}
        actions={
          <>
            <Link href="/quran/1" className="btn btn-light rounded-pill px-4">
              Start Al-Fatihah
            </Link>
            <Link
              href="/quran/tafseer"
              className="btn btn-outline-light rounded-pill px-4"
            >
              Open Tafseer
            </Link>
            {progress ? (
              <Link
                href={`/quran/${progress.surah_id}`}
                className="btn btn-outline-light rounded-pill px-4"
              >
                Continue {progress.surah_id}:{progress.ayah_number}
              </Link>
            ) : null}
          </>
        }
      >
        <div className="quran-search quran-search--hero">
          <i className="fa-solid fa-magnifying-glass" />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search by Surah name, Arabic name, or number"
            aria-label="Search Surahs"
          />
        </div>
      </KnowledgePageHeader>

      <section className="knowledge-directory-body page-surface-alt">
        <div className="container">
          {progress ? (
            <Link
              href={`/quran/${progress.surah_id}`}
              className="mobile-continue-card d-md-none"
            >
              <span>
                <small>Continue reading</small>
                <strong>
                  Surah {progress.surah_id}, Ayah {progress.ayah_number}
                </strong>
              </span>
              <i className="fa-solid fa-arrow-right" />
            </Link>
          ) : null}

          <div className="mobile-quran-search d-md-none">
            <i className="fa-solid fa-magnifying-glass" />
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search Surah"
            />
          </div>

          <div className="quran-toolbar mb-4">
            <div>
              <span className="section-header-rail mb-2">Directory</span>
              <h2 className="fw-bold mb-0">Choose a Surah</h2>
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
