import { NextResponse } from "next/server";

const TRANSLATION_ENDPOINT =
  "https://translate.googleapis.com/translate_a/single";
const TARGET_LANGUAGES = new Set(["bn"]);
const translationCache = new Map();
const MAX_TEXTS_PER_REQUEST = 120;

function normalizeText(value) {
  return String(value ?? "")
    .replace(/\s+/g, " ")
    .trim();
}

async function translateText(text, target) {
  const normalizedText = normalizeText(text);
  if (!normalizedText) return text;

  const cacheKey = `${target}:${normalizedText}`;
  if (translationCache.has(cacheKey)) {
    return translationCache.get(cacheKey);
  }

  const url = new URL(TRANSLATION_ENDPOINT);
  url.searchParams.set("client", "gtx");
  url.searchParams.set("sl", "auto");
  url.searchParams.set("tl", target);
  url.searchParams.set("dt", "t");
  url.searchParams.set("q", normalizedText);

  try {
    const response = await fetch(url.toString(), {
      headers: {
        "User-Agent": "Mozilla/5.0",
      },
      next: { revalidate: 60 * 60 * 24 * 7 },
    });

    if (!response.ok) {
      throw new Error(
        `Translation request failed with status ${response.status}`,
      );
    }

    const payload = await response.json();
    const translated = Array.isArray(payload?.[0])
      ? payload[0]
          .map((item) => item?.[0] || "")
          .join("")
          .trim()
      : normalizedText;

    translationCache.set(cacheKey, translated || normalizedText);
    return translated || normalizedText;
  } catch (error) {
    console.warn("Translation fallback used:", error?.message || error);
    translationCache.set(cacheKey, normalizedText);
    return normalizedText;
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const texts = Array.isArray(body?.texts) ? body.texts : [];
    const target = String(body?.target || "").toLowerCase();

    if (!TARGET_LANGUAGES.has(target)) {
      return NextResponse.json(
        { error: "Unsupported target language." },
        { status: 400 },
      );
    }

    const normalizedTexts = texts
      .map(normalizeText)
      .filter(Boolean)
      .slice(0, MAX_TEXTS_PER_REQUEST);

    if (!normalizedTexts.length) {
      return NextResponse.json({ translations: {} });
    }

    const uniqueTexts = [...new Set(normalizedTexts)];
    const translatedPairs = await Promise.all(
      uniqueTexts.map(async (text) => [
        text,
        await translateText(text, target),
      ]),
    );

    return NextResponse.json({
      translations: Object.fromEntries(translatedPairs),
    });
  } catch (error) {
    console.error("Translation API error:", error);
    return NextResponse.json({ translations: {}, degraded: true });
  }
}
