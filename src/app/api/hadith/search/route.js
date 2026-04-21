import { NextResponse } from "next/server";

const FALLBACK_HADITHS = [
  {
    hadith:
      "Actions are judged by intentions, and every person will have only what they intended.",
    rawi: "Umar ibn al-Khattab",
    mohdith: "Bukhari and Muslim",
    book: "Sahih Collections",
    grade: "Authentic",
    categories: [{ name: "Intentions" }],
  },
  {
    hadith: "The best of you are those who learn the Quran and teach it.",
    rawi: "Uthman ibn Affan",
    mohdith: "Al-Bukhari",
    book: "Sahih al-Bukhari",
    grade: "Authentic",
    categories: [{ name: "Quran" }],
  },
  {
    hadith:
      "Whoever believes in Allah and the Last Day should speak good or remain silent.",
    rawi: "Abu Hurayrah",
    mohdith: "Bukhari and Muslim",
    book: "Sahih Collections",
    grade: "Authentic",
    categories: [{ name: "Character" }],
  },
];

function normalizeHadith(item = {}) {
  return {
    hadith: item.hadith || "",
    rawi: item.rawi || "",
    mohdith: item.mohdith || "",
    book: item.book || "",
    numberOrPage: item.numberOrPage || "",
    grade: item.grade || "",
    explainGrade: item.explainGrade || "",
    takhrij: item.takhrij || "",
    hadithId: item.hadithId || "",
    categories: Array.isArray(item.categories) ? item.categories : [],
    hasSimilarHadith: Boolean(item.hasSimilarHadith),
    hasAlternateHadithSahih: Boolean(item.hasAlternateHadithSahih),
    hasSharhMetadata: Boolean(item.hasSharhMetadata),
  };
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const value = String(searchParams.get("value") || "").trim();
  const page = String(searchParams.get("page") || "1");
  const baseUrl = process.env.DORAR_HADITH_API_BASE_URL;

  if (!value) {
    return NextResponse.json({
      success: true,
      source: "fallback",
      data: FALLBACK_HADITHS,
      metadata: { length: FALLBACK_HADITHS.length },
    });
  }

  if (!baseUrl) {
    const lower = value.toLowerCase();
    const filtered = FALLBACK_HADITHS.filter((item) =>
      [item.hadith, item.rawi, item.mohdith, item.book, item.grade]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(lower),
    );

    return NextResponse.json({
      success: true,
      source: "fallback",
      data: filtered.length ? filtered : FALLBACK_HADITHS,
      metadata: {
        length: filtered.length || FALLBACK_HADITHS.length,
        note: "Set DORAR_HADITH_API_BASE_URL to enable live Dorar-compatible results.",
      },
    });
  }

  try {
    const endpoint = new URL("/v1/site/hadith/search", baseUrl);
    endpoint.searchParams.set("value", value);
    endpoint.searchParams.set("page", page);
    endpoint.searchParams.set("removehtml", "true");

    const response = await fetch(endpoint.toString(), {
      next: { revalidate: 30 },
    });
    const payload = await response.json();

    if (!response.ok) {
      throw new Error(payload?.message || "Hadith API request failed.");
    }

    return NextResponse.json({
      success: true,
      source: "dorar-proxy",
      metadata: payload.metadata || {},
      data: (payload.data || []).map(normalizeHadith),
    });
  } catch (error) {
    console.error("Hadith search failed:", error);

    return NextResponse.json({
      success: true,
      source: "fallback",
      data: FALLBACK_HADITHS,
      metadata: {
        length: FALLBACK_HADITHS.length,
        note: "Live Hadith search is temporarily unavailable.",
      },
    });
  }
}
