"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

const AudioPlayerContext = createContext(null);

async function safelyPlay(audioElement) {
  if (!audioElement) return;

  try {
    await audioElement.play();
  } catch (error) {
    console.error("Audio playback failed:", error);
  }
}

export function AudioPlayerProvider({ children }) {
  const audioRef = useRef(null);
  const [playlist, setPlaylistState] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [currentTrack, setCurrentTrack] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolumeState] = useState(1);
  const [isReady, setIsReady] = useState(false);

  const syncTrack = useCallback(
    async (track, nextIndex, shouldAutoplay = true) => {
      const audioElement = audioRef.current;
      if (!audioElement || !track?.src) return;

      setCurrentTrack(track);
      setCurrentIndex(nextIndex);
      audioElement.src = track.src;
      audioElement.load();

      if (shouldAutoplay) {
        await safelyPlay(audioElement);
      } else {
        setIsPlaying(false);
      }
    },
    []
  );

  const clearPlayer = useCallback(() => {
    const audioElement = audioRef.current;
    if (audioElement) {
      audioElement.pause();
      audioElement.removeAttribute("src");
      audioElement.load();
    }

    setPlaylistState([]);
    setCurrentIndex(-1);
    setCurrentTrack(null);
    setCurrentTime(0);
    setDuration(0);
    setIsPlaying(false);
  }, []);

  const playTrack = useCallback(
    async (track, options = {}) => {
      if (!track?.src) return;

      const nextPlaylist = Array.isArray(options.playlist) && options.playlist.length
        ? options.playlist
        : [track];
      const resolvedIndex = options.index ?? nextPlaylist.findIndex((item) => item.src === track.src);
      const nextIndex = resolvedIndex >= 0 ? resolvedIndex : 0;

      setPlaylistState(nextPlaylist);
      await syncTrack(nextPlaylist[nextIndex], nextIndex, options.autoplay !== false);
    },
    [syncTrack]
  );

  const setPlaylist = useCallback(
    async (tracks = [], startIndex = 0, shouldAutoplay = false) => {
      const normalizedTracks = tracks.filter((track) => track?.src);
      setPlaylistState(normalizedTracks);

      if (!normalizedTracks.length) {
        clearPlayer();
        return;
      }

      const boundedIndex = Math.min(Math.max(startIndex, 0), normalizedTracks.length - 1);
      await syncTrack(normalizedTracks[boundedIndex], boundedIndex, shouldAutoplay);
    },
    [clearPlayer, syncTrack]
  );

  const play = useCallback(async () => {
    const audioElement = audioRef.current;
    if (!audioElement) return;
    await safelyPlay(audioElement);
  }, []);

  const pause = useCallback(() => {
    audioRef.current?.pause();
  }, []);

  const togglePlayPause = useCallback(async () => {
    const audioElement = audioRef.current;
    if (!audioElement) return;

    if (audioElement.paused) {
      await safelyPlay(audioElement);
      return;
    }

    audioElement.pause();
  }, []);

  const seekTo = useCallback((timeInSeconds) => {
    const audioElement = audioRef.current;
    if (!audioElement) return;
    audioElement.currentTime = timeInSeconds;
    setCurrentTime(timeInSeconds);
  }, []);

  const setVolume = useCallback((nextVolume) => {
    const audioElement = audioRef.current;
    const boundedVolume = Math.min(Math.max(nextVolume, 0), 1);

    setVolumeState(boundedVolume);
    if (audioElement) {
      audioElement.volume = boundedVolume;
    }
  }, []);

  const playNext = useCallback(async () => {
    if (!playlist.length) return;

    const nextIndex = currentIndex + 1;
    if (nextIndex >= playlist.length) {
      setIsPlaying(false);
      return;
    }

    await syncTrack(playlist[nextIndex], nextIndex, true);
  }, [currentIndex, playlist, syncTrack]);

  const playPrevious = useCallback(async () => {
    if (!playlist.length) return;

    const previousIndex = currentIndex > 0 ? currentIndex - 1 : 0;
    await syncTrack(playlist[previousIndex], previousIndex, true);
  }, [currentIndex, playlist, syncTrack]);

  useEffect(() => {
    const audioElement = audioRef.current;
    if (!audioElement) return;

    audioElement.preload = "metadata";
    audioElement.volume = volume;

    const handleLoadedMetadata = () => {
      setDuration(Number.isFinite(audioElement.duration) ? audioElement.duration : 0);
      setIsReady(true);
    };

    const handleTimeUpdate = () => {
      setCurrentTime(audioElement.currentTime || 0);
    };

    const handlePlay = () => {
      setIsPlaying(true);
    };

    const handlePause = () => {
      setIsPlaying(false);
    };

    const handleEnded = () => {
      if (currentIndex >= 0 && currentIndex < playlist.length - 1) {
        void syncTrack(playlist[currentIndex + 1], currentIndex + 1, true);
        return;
      }

      setIsPlaying(false);
    };

    const handleError = () => {
      console.error("Audio element error:", audioElement.error);
      setIsPlaying(false);
    };

    audioElement.addEventListener("loadedmetadata", handleLoadedMetadata);
    audioElement.addEventListener("timeupdate", handleTimeUpdate);
    audioElement.addEventListener("play", handlePlay);
    audioElement.addEventListener("pause", handlePause);
    audioElement.addEventListener("ended", handleEnded);
    audioElement.addEventListener("error", handleError);

    return () => {
      audioElement.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audioElement.removeEventListener("timeupdate", handleTimeUpdate);
      audioElement.removeEventListener("play", handlePlay);
      audioElement.removeEventListener("pause", handlePause);
      audioElement.removeEventListener("ended", handleEnded);
      audioElement.removeEventListener("error", handleError);
    };
  }, [currentIndex, playlist, syncTrack, volume]);

  const value = useMemo(
    () => ({
      playlist,
      currentIndex,
      currentTrack,
      isPlaying,
      duration,
      currentTime,
      volume,
      isReady,
      playTrack,
      setPlaylist,
      play,
      pause,
      togglePlayPause,
      seekTo,
      setVolume,
      playNext,
      playPrevious,
      clearPlayer,
    }),
    [
      clearPlayer,
      currentIndex,
      currentTime,
      currentTrack,
      duration,
      isPlaying,
      isReady,
      pause,
      play,
      playNext,
      playPrevious,
      playTrack,
      playlist,
      seekTo,
      setPlaylist,
      setVolume,
      togglePlayPause,
      volume,
    ]
  );

  return (
    <AudioPlayerContext.Provider value={value}>
      {children}
      <audio ref={audioRef} hidden />
    </AudioPlayerContext.Provider>
  );
}

export function useAudioPlayer() {
  const context = useContext(AudioPlayerContext);

  if (!context) {
    throw new Error("useAudioPlayer must be used within an AudioPlayerProvider");
  }

  return context;
}
