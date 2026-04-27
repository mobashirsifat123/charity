import { createClient } from "@supabase/supabase-js";
import {
  getNextSurah,
  getPreviousSurah,
  getSurahById,
  SURAH_LIST,
} from "@/lib/quran/surah-data";

const QURAN_API_BASE = "https://api.alquran.cloud/v1";
const LONG_CACHE = { next: { revalidate: 60 * 60 * 24 * 30 } };

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co";
const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "placeholder";

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

function normalizeApiSurah(item) {
  const fallback = getSurahById(item?.number);

  return {
    number: item?.number || fallback?.number,
    name: item?.englishName || fallback?.name || "",
    arabicName: item?.name || fallback?.arabicName || "",
    englishName: item?.englishNameTranslation || fallback?.englishName || "",
    ayahs: item?.numberOfAyahs || fallback?.ayahs || 0,
    revelationType:
      item?.revelationType === "Meccan"
        ? "Makki"
        : item?.revelationType === "Medinan"
          ? "Madani"
          : fallback?.revelationType || "",
  };
}

export async function fetchSurahDirectory() {
  try {
    const response = await fetch(`${QURAN_API_BASE}/surah`, LONG_CACHE);

    if (!response.ok) {
      throw new Error(`Surah directory failed with ${response.status}`);
    }

    const payload = await response.json();
    const items = Array.isArray(payload?.data)
      ? payload.data.map(normalizeApiSurah).filter((item) => item.number)
      : [];

    return items.length === 114 ? items : SURAH_LIST;
  } catch (error) {
    console.warn("Quran directory fallback used:", error?.message || error);
    return SURAH_LIST;
  }
}

export async function fetchSurahReading(surahId) {
  const fallbackSurah = getSurahById(surahId);
  if (!fallbackSurah) return null;

  try {
    const response = await fetch(
      `${QURAN_API_BASE}/surah/${fallbackSurah.number}/editions/quran-uthmani,en.sahih,ar.alafasy`,
      LONG_CACHE,
    );

    if (!response.ok) {
      throw new Error(`Surah reading failed with ${response.status}`);
    }

    const payload = await response.json();
    const [arabicEdition, translationEdition, audioEdition] = Array.isArray(
      payload?.data,
    )
      ? payload.data
      : [];

    const ayahs = (arabicEdition?.ayahs || []).map((ayah, index) => ({
      number: ayah.numberInSurah,
      globalNumber: ayah.number,
      arabic: ayah.text,
      translation: translationEdition?.ayahs?.[index]?.text || "",
      audio: audioEdition?.ayahs?.[index]?.audio || "",
    }));

    return {
      ...fallbackSurah,
      ayahCount: fallbackSurah.ayahs,
      ayahs,
      apiAvailable: ayahs.length > 0,
    };
  } catch (error) {
    console.warn("Quran reading fallback used:", error?.message || error);
    return {
      ...fallbackSurah,
      ayahCount: fallbackSurah.ayahs,
      ayahs: [],
      apiAvailable: false,
    };
  }
}

export async function fetchSurahMetadata(surahId, language = "en") {
  try {
    const { data, error } = await supabase
      .from("quran_surah_metadata")
      .select("*")
      .eq("surah_id", Number(surahId))
      .eq("language", language)
      .eq("status", "published")
      .maybeSingle();

    if (error) throw error;
    return data || null;
  } catch (error) {
    console.warn("Surah metadata fallback used:", error?.message || error);
    return null;
  }
}

export async function fetchTafseerSections(surahId, language = "en") {
  const fallbackSurah = getSurahById(surahId);
  if (!fallbackSurah) return [];

  try {
    const { data, error } = await supabase
      .from("quran_tafseer_sections")
      .select("*")
      .eq("surah_id", fallbackSurah.number)
      .eq("language", language)
      .eq("status", "published")
      .order("order_index", { ascending: true });

    if (error) throw error;
    if (Array.isArray(data) && data.length) return data;
  } catch (error) {
    console.warn("Tafseer sections fallback used:", error?.message || error);
  }

  return [
    {
      id: `fallback-${fallbackSurah.number}`,
      surah_id: fallbackSurah.number,
      language,
      title: "Introduction of Surah",
      slug: "introduction",
      ayah_start: null,
      ayah_end: null,
      order_index: 1,
      status: "published",
      isFallback: true,
    },
  ];
}

export async function fetchTafseerContent({
  surahId,
  sectionSlug = "introduction",
  language = "en",
}) {
  const surah = getSurahById(surahId);
  if (!surah) return null;

  const sections = await fetchTafseerSections(surah.number, language);
  const section =
    sections.find((item) => item.slug === sectionSlug) || sections[0] || null;

  if (!section) return null;

  if (!section.isFallback) {
    try {
      const { data, error } = await supabase
        .from("quran_tafseer_content")
        .select("*")
        .eq("section_id", section.id)
        .eq("language", language)
        .eq("status", "published")
        .maybeSingle();

      if (error) throw error;

      if (data) {
        return buildTafseerResult({ surah, section, sections, content: data });
      }
    } catch (error) {
      console.warn("Tafseer content fallback used:", error?.message || error);
    }
  }

  const metadata =
    section.slug === "introduction"
      ? await fetchSurahMetadata(surah.number, language)
      : null;

  if (metadata) {
    return buildTafseerResult({
      surah,
      section,
      sections,
      content: {
        title: `${surah.name} Introduction`,
        body: buildMetadataBody(metadata),
        references: [],
        author_name: "IRWAA Editorial Team",
        status: "published",
      },
    });
  }

  return buildTafseerResult({
    surah,
    section,
    sections,
    content: {
      title: section.title,
      body: "<p>This Tafseer section is ready for your scholars or admins to publish original or licensed explanation content from the admin panel.</p><p>Use this space for Surah introductions, ayah-range explanations, objectives, topics, and scholarly references.</p>",
      references: [],
      author_name: "IRWAA Editorial Team",
      status: "published",
    },
  });
}

function buildMetadataBody(metadata) {
  const blocks = [
    metadata.intro
      ? `<h2>Introduction</h2><p>${escapeHtml(metadata.intro).replace(/\n/g, "<br />")}</p>`
      : "",
    metadata.objectives
      ? `<h2>Objectives</h2><p>${escapeHtml(metadata.objectives).replace(/\n/g, "<br />")}</p>`
      : "",
    metadata.topics
      ? `<h2>Topics</h2><p>${escapeHtml(metadata.topics).replace(/\n/g, "<br />")}</p>`
      : "",
    metadata.notes
      ? `<h2>Notes</h2><p>${escapeHtml(metadata.notes).replace(/\n/g, "<br />")}</p>`
      : "",
  ].filter(Boolean);

  return blocks.join("");
}

function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function buildTafseerResult({ surah, section, sections, content }) {
  const currentIndex = sections.findIndex((item) => item.slug === section.slug);
  const previousSection = currentIndex > 0 ? sections[currentIndex - 1] : null;
  const nextSection =
    currentIndex >= 0 && currentIndex < sections.length - 1
      ? sections[currentIndex + 1]
      : null;

  return {
    surah,
    section,
    sections,
    content: {
      ...content,
      references: normalizeReferences(content.references),
    },
    previous: previousSection
      ? { type: "section", section: previousSection }
      : getPreviousSurah(surah.number)
        ? { type: "surah", surah: getPreviousSurah(surah.number) }
        : null,
    next: nextSection
      ? { type: "section", section: nextSection }
      : getNextSurah(surah.number)
        ? { type: "surah", surah: getNextSurah(surah.number) }
        : null,
  };
}

function normalizeReferences(value) {
  if (Array.isArray(value)) return value.filter(Boolean);

  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) return parsed.filter(Boolean);
    } catch {
      return value
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean);
    }
  }

  return [];
}
