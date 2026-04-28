import { supabase } from "@/lib/supabaseClient";
import { CORE_ARTICLE_SUBJECTS } from "@/lib/article-subjects";
import { listEbooks } from "@/lib/ebook-data";
import { SURAH_LIST } from "@/lib/quran/surah-data";
import {
  extractIdentifierId,
  getContentCategory,
  getContentBody,
  getContentTitle,
  matchesUnifiedSearch,
  sortFeaturedFirst,
} from "@/lib/content-utils";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export const FALLBACK_ARTICLE_CATEGORIES = CORE_ARTICLE_SUBJECTS.map(
  (subject, index) => ({
    id: subject.name,
    name: subject.name,
    slug: subject.name.toLowerCase(),
    description: subject.description,
    icon_class: `fa-solid ${subject.icon}`,
    sort_order: (index + 1) * 10,
    is_active: true,
  }),
);

function isUuid(value = "") {
  return UUID_PATTERN.test(String(value).trim());
}

export async function fetchPublishedBlogs(limit = null) {
  const query = supabase
    .from("blogs")
    .select("*")
    .eq("status", "published")
    .order("created_at", { ascending: false });

  const { data, error } = limit ? await query.limit(limit) : await query;
  if (error) throw error;
  return sortFeaturedFirst(data || []);
}

export async function fetchArticleCategories() {
  try {
    const response = await fetch("/api/article-categories", {
      cache: "no-store",
    });

    if (response.ok) {
      const payload = await response.json();
      if (Array.isArray(payload?.data)) {
        return payload.data;
      }
    }
  } catch {
    // The public article page should still render before the DB upgrade runs.
  }

  return FALLBACK_ARTICLE_CATEGORIES;
}

export async function fetchPublishedFatwas(limit = null) {
  const query = supabase
    .from("fatwas")
    .select("*")
    .eq("status", "published")
    .order("created_at", { ascending: false });

  const { data, error } = limit ? await query.limit(limit) : await query;
  if (error) throw error;
  return sortFeaturedFirst(data || []);
}

export async function fetchBlogByIdentifier(identifier) {
  const normalizedIdentifier = String(identifier || "").trim();
  const rawId = extractIdentifierId(normalizedIdentifier);

  if (!isUuid(rawId)) return null;

  const { data, error } = await supabase
    .from("blogs")
    .select("*")
    .eq("id", rawId)
    .maybeSingle();
  if (error) {
    throw error;
  }
  return data || null;
}

export async function fetchFatwaByIdentifier(identifier) {
  const normalizedIdentifier = String(identifier || "").trim();
  const rawId = extractIdentifierId(normalizedIdentifier);

  if (!isUuid(rawId)) return null;

  const { data, error } = await supabase
    .from("fatwas")
    .select("*")
    .eq("id", rawId)
    .maybeSingle();
  if (error) {
    throw error;
  }
  return data || null;
}

export function getRelatedContent(items = [], currentRecord, type, limit = 3) {
  const currentCategory = getContentCategory(currentRecord);
  const currentId = currentRecord?.id;

  return items
    .filter((item) => item.id !== currentId)
    .sort((a, b) => {
      const sameCategoryA = getContentCategory(a) === currentCategory ? 1 : 0;
      const sameCategoryB = getContentCategory(b) === currentCategory ? 1 : 0;
      if (sameCategoryA !== sameCategoryB) return sameCategoryB - sameCategoryA;
      return new Date(b.created_at || 0) - new Date(a.created_at || 0);
    })
    .slice(0, limit);
}

export function getUnifiedSearchResults({
  blogs = [],
  fatwas = [],
  ebooks = listEbooks(),
  quran = SURAH_LIST,
  query = "",
  type = "all",
  category = "all",
}) {
  const normalizedQuery = query.trim().toLowerCase();
  const normalizedCategory = category.toLowerCase();

  const blogResults = (blogs || []).filter((item) => {
    const queryMatch =
      !normalizedQuery || matchesUnifiedSearch(item, "blog", normalizedQuery);
    const categoryMatch =
      normalizedCategory === "all" ||
      getContentCategory(item).toLowerCase() === normalizedCategory;
    return queryMatch && categoryMatch;
  });

  const fatwaResults = (fatwas || []).filter((item) => {
    const queryMatch =
      !normalizedQuery || matchesUnifiedSearch(item, "fatwa", normalizedQuery);
    const categoryMatch =
      normalizedCategory === "all" ||
      getContentCategory(item).toLowerCase() === normalizedCategory;
    return queryMatch && categoryMatch;
  });

  const quranResults = (quran || []).filter((item) => {
    const queryMatch =
      !normalizedQuery || matchesUnifiedSearch(item, "quran", normalizedQuery);
    const categoryMatch =
      normalizedCategory === "all" ||
      getContentCategory(item).toLowerCase() === normalizedCategory;
    return queryMatch && categoryMatch;
  });

  const ebookResults = (ebooks || []).filter((item) => {
    const queryMatch =
      !normalizedQuery || matchesUnifiedSearch(item, "ebook", normalizedQuery);
    const categoryMatch =
      normalizedCategory === "all" ||
      getContentCategory(item).toLowerCase() === normalizedCategory;
    return queryMatch && categoryMatch;
  });

  const quranCards = quranResults.map((item) => ({
    ...item,
    id: item.number,
    contentType: "quran",
    displayTitle: getContentTitle(item, "quran"),
    displayExcerpt: getContentBody(item, "quran"),
  }));
  const articleCards = blogResults.map((item) => ({
    ...item,
    contentType: "blog",
    displayTitle: getContentTitle(item, "blog"),
  }));
  const fatwaCards = fatwaResults.map((item) => ({
    ...item,
    contentType: "fatwa",
    displayTitle: getContentTitle(item, "fatwa"),
  }));
  const ebookCards = ebookResults.map((item) => ({
    ...item,
    id: item.slug,
    contentType: "ebook",
    displayTitle: getContentTitle(item, "ebook"),
    displayExcerpt: getContentBody(item, "ebook"),
  }));

  if (type === "quran") return quranCards;
  if (type === "blog") return articleCards;
  if (type === "fatwa") return fatwaCards;
  if (type === "ebook") return ebookCards;

  return [...quranCards, ...articleCards, ...fatwaCards, ...ebookCards].sort(
    (a, b) =>
      new Date(b.created_at || b.publishedAt || 0) -
      new Date(a.created_at || a.publishedAt || 0),
  );
}

export async function fetchPublishedCampaigns(limit = 6) {
  const { data, error } = await supabase
    .from("campaigns")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("Error fetching campaigns:", error);
    return [];
  }
  return data || [];
}
