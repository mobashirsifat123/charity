// src/components/quran/QuranReaderClient.jsx
"use client";
import React, { useMemo, useEffect } from 'react';
import Link from 'next/link';
import { useAudioPlayer } from '@/context/AudioPlayerContext';

export default function QuranReaderClient({ arabic, translation }) {
  const { 
    currentTrack, 
    isPlaying, 
    setPlaylist, 
    togglePlayPause, 
    clearPlayer,
    currentIndex 
  } = useAudioPlayer();

  const surahPlaylist = useMemo(() => {
    return arabic.ayahs.map((ayah) => ({
      src: ayah.audio,
      number: ayah.numberInSurah,
      text: ayah.text
    }));
  }, [arabic.ayahs]);

  // Clean up player when leaving the reader
  useEffect(() => {
    return () => {
      clearPlayer();
    };
  }, [clearPlayer]);

  const playAyah = (index) => {
    // Load the playlist starting from this ayah
    setPlaylist(surahPlaylist, index, true);
  };

  const stopAudio = () => {
    clearPlayer();
  };

  return (
    <div className="container" style={{ maxWidth: '900px' }}>
      <div className="text-center mb-5 pb-3 border-bottom">
        <h1 className="display-4 fw-bold">{arabic.englishName}</h1>
        <h2 className="display-2" style={{ fontFamily: '"Amiri", serif', color: 'var(--primary-color)' }}>
          {arabic.name}
        </h2>
        <p className="lead">{arabic.englishNameTranslation} • {arabic.revelationType} • {arabic.numberOfAyahs} Ayahs</p>
        
        <div className="mt-4 d-flex flex-wrap justify-content-center gap-3">
          {!isPlaying ? (
            <button onClick={() => playAyah(0)} className="btn btn-primary rounded-pill px-4">
              <i className="fa-solid fa-play me-2" /> Play Full Surah
            </button>
          ) : (
            <button onClick={togglePlayPause} className="btn btn-warning rounded-pill px-4">
              <i className="fa-solid fa-pause me-2" /> Pause Recitation
            </button>
          )}
          <button onClick={stopAudio} className="btn btn-danger rounded-pill px-4">
            <i className="fa-solid fa-stop me-2" /> Stop
          </button>
          
          <Link href={`/quran/tafseer/${arabic.number}`} className="btn btn-outline-success rounded-pill px-4">
            <i className="fa-solid fa-book-open me-2" /> Read Tafseer for this Surah
          </Link>
        </div>
      </div>

      <div className="quran-reader-content">
        {arabic.ayahs.map((ayah, index) => {
          const transAyah = translation?.ayahs?.[index];
          const isCurrentlyPlaying = currentTrack?.number === ayah.numberInSurah;
          
          return (
            <div 
              key={ayah.number} 
              id={`ayah-${ayah.numberInSurah}`} 
              className={`ayah-card p-4 mb-4 rounded shadow-sm ${isCurrentlyPlaying ? 'border border-primary' : 'bg-white'}`}
              style={{ transition: 'all 0.3s ease', backgroundColor: isCurrentlyPlaying ? '#f8f9fa' : '#fff' }}
            >
              <div className="d-flex justify-content-between align-items-center mb-4 pb-2 border-bottom">
                <span className={`badge ${isCurrentlyPlaying ? 'bg-primary' : 'bg-secondary'} fs-6 rounded-pill`}>
                  {arabic.number}:{ayah.numberInSurah}
                </span>
                <div className="ayah-actions gap-2 d-flex">
                  <button 
                    onClick={() => playAyah(index)} 
                    className={`btn btn-sm rounded-circle ${isCurrentlyPlaying && isPlaying ? 'btn-primary' : 'btn-light'}`} 
                    title={isCurrentlyPlaying && isPlaying ? "Playing..." : "Play from this Ayah"}
                  >
                    <i className={`fa-solid ${isCurrentlyPlaying && isPlaying ? 'fa-volume-high text-white' : 'fa-play text-primary'}`} />
                  </button>
                  <button onClick={stopAudio} className="btn btn-sm btn-light rounded-circle" title="Stop">
                    <i className="fa-solid fa-stop text-danger" />
                  </button>
                  <button className="btn btn-sm btn-light rounded-circle" title="Bookmark">
                    <i className="fa-regular fa-bookmark text-success" />
                  </button>
                </div>
              </div>
              
              <p className="text-right mb-4 lh-lg" dir="rtl" style={{ fontSize: '2rem', fontFamily: '"Amiri", serif', color: isCurrentlyPlaying ? 'var(--primary-color)' : '#333' }}>
                {ayah.text}
              </p>
              
              {transAyah && (
                <p className="text-left text-muted" style={{ fontSize: '1.2rem', lineHeight: '1.8' }}>
                  {transAyah.text}
                </p>
              )}
            </div>
          );
        })}
      </div>

      <div className="d-flex justify-content-between mt-5 pt-4 border-top">
        {arabic.number > 1 ? (
          <Link href={`/quran/${arabic.number - 1}`} className="btn btn-primary px-4 py-2 rounded-pill">
            <i className="fa-solid fa-arrow-left me-2" /> Previous Surah
          </Link>
        ) : <div />}
        {arabic.number < 114 ? (
          <Link href={`/quran/${arabic.number + 1}`} className="btn btn-primary px-4 py-2 rounded-pill">
            Next Surah <i className="fa-solid fa-arrow-right ms-2" />
          </Link>
        ) : <div />}
      </div>
    </div>
  );
}
