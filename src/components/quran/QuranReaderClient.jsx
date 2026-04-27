"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import { useAudioPlayer } from "@/context/AudioPlayerContext";
import { useAuth } from "@/context/AuthContext";

export default function QuranReaderClient({ surah, previousSurah, nextSurah }) {
  const { setPlaylist, playTrack } = useAudioPlayer();
  const { user } = useAuth();
  const [saveState, setSaveState] = useState("");

  const tracks = useMemo(
    () =>
      (surah?.ayahs || [])
        .filter((ayah) => ayah.audio)
        .map((ayah) => ({
          id: `${surah.number}:${ayah.number}`,
          title: `${surah.name} ${ayah.number}`,
          subtitle: surah.arabicName,
          src: ayah.audio,
        })),
    [surah],
  );

  const playAll = async () => {
    if (!tracks.length) return;
    await setPlaylist(tracks, 0, true);
  };

  const playAyah = async (ayahNumber) => {
    const index = tracks.findIndex(
      (track) => track.id === `${surah.number}:${ayahNumber}`,
    );
    if (index < 0) return;
    await playTrack(tracks[index], { playlist: tracks, index });
  };

  const saveProgress = async (ayahNumber) => {
    setSaveState("");

    if (!user) {
      setSaveState("Log in to save your reading progress.");
      return;
    }

    if (!Number.isInteger(Number(user.id))) {
      setSaveState(
        "Your member profile is still syncing. Please refresh after login.",
      );
      return;
    }

    const { error } = await supabase.from("user_quran_progress").upsert(
      {
        user_id: Number(user.id),
        surah_id: surah.number,
        ayah_number: ayahNumber,
        last_read_at: new Date().toISOString(),
      },
      { onConflict: "user_id" },
    );

    if (error) {
      setSaveState(error.message || "Unable to save progress.");
      return;
    }

    setSaveState(`Saved ${surah.name}, ayah ${ayahNumber}.`);
  };

  return (
    <section className="py-5 page-surface-alt">
      <div className="container">
        <div className="quran-reader-shell">
          <aside className="quran-reader-aside">
            <Link href="/quran" className="quran-back-link">
              <i className="fa-solid fa-arrow-left" /> Quran Hub
            </Link>
            <div className="quran-reader-card">
              <span className="theme-badge-soft mb-3">
                {surah.revelationType}
              </span>
              <h1>{surah.name}</h1>
              <p lang="ar">{surah.arabicName}</p>
              <small>
                {surah.ayahCount || surah.ayahs.length} ayahs •{" "}
                {surah.englishName}
              </small>
              <button
                type="button"
                className="btn btn-primary rounded-pill w-100 mt-4"
                onClick={playAll}
                disabled={!tracks.length}
              >
                <i className="fa-solid fa-play me-2" />
                Play recitation
              </button>
              <Link
                href={`/quran/tafseer/${surah.number}/introduction`}
                className="btn btn-outline-primary rounded-pill w-100 mt-3"
              >
                Open Tafseer
              </Link>
            </div>
            <div className="d-flex gap-2 mt-3">
              {previousSurah ? (
                <Link
                  href={`/quran/${previousSurah.number}`}
                  className="btn btn-light rounded-pill flex-fill"
                >
                  Previous
                </Link>
              ) : null}
              {nextSurah ? (
                <Link
                  href={`/quran/${nextSurah.number}`}
                  className="btn btn-light rounded-pill flex-fill"
                >
                  Next
                </Link>
              ) : null}
            </div>
          </aside>

          <div className="quran-reader-content">
            {!surah.apiAvailable ? (
              <div className="alert alert-warning border-0 rounded-4">
                Quran text is temporarily unavailable from the Quran API. Please
                try again shortly.
              </div>
            ) : null}

            {surah.ayahs.map((ayah) => (
              <article className="quran-ayah-card" key={ayah.number}>
                <div className="quran-ayah-card__top">
                  <span>
                    {surah.number}:{ayah.number}
                  </span>
                  <div className="d-flex gap-2">
                    <button
                      type="button"
                      className="btn btn-sm btn-light rounded-pill"
                      onClick={() => playAyah(ayah.number)}
                      disabled={!ayah.audio}
                    >
                      <i className="fa-solid fa-play" />
                    </button>
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-primary rounded-pill"
                      onClick={() => saveProgress(ayah.number)}
                    >
                      Save
                    </button>
                  </div>
                </div>
                <p className="quran-ayah-card__arabic" lang="ar" dir="rtl">
                  {ayah.arabic}
                  <span className="quran-ayah-card__marker">{ayah.number}</span>
                </p>
                <p className="quran-ayah-card__translation">
                  {ayah.translation}
                </p>
              </article>
            ))}

            {saveState ? (
              <div className="quran-save-toast">{saveState}</div>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
