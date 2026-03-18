import { supabase } from "@/lib/supabaseClient";
import {
  extractIdentifierId,
  getContentCategory,
  getContentTitle,
  matchesUnifiedSearch,
  sortFeaturedFirst,
} from "@/lib/content-utils";

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
  const rawId = extractIdentifierId(identifier);
  const { data, error } = await supabase.from("blogs").select("*").eq("id", rawId).single();
  if (error) throw error;
  return data;
}

export async function fetchFatwaByIdentifier(identifier) {
  const rawId = extractIdentifierId(identifier);
  const { data, error } = await supabase.from("fatwas").select("*").eq("id", rawId).single();
  if (error) throw error;
  return data;
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

export function getUnifiedSearchResults({ blogs = [], fatwas = [], query = "", type = "all", category = "all" }) {
  const normalizedQuery = query.trim().toLowerCase();
  const normalizedCategory = category.toLowerCase();

  const blogResults = (blogs || []).filter((item) => {
    const queryMatch = !normalizedQuery || matchesUnifiedSearch(item, "blog", normalizedQuery);
    const categoryMatch = normalizedCategory === "all" || getContentCategory(item).toLowerCase() === normalizedCategory;
    return queryMatch && categoryMatch;
  });

  const fatwaResults = (fatwas || []).filter((item) => {
    const queryMatch = !normalizedQuery || matchesUnifiedSearch(item, "fatwa", normalizedQuery);
    const categoryMatch = normalizedCategory === "all" || getContentCategory(item).toLowerCase() === normalizedCategory;
    return queryMatch && categoryMatch;
  });

  const articleCards = blogResults.map((item) => ({ ...item, contentType: "blog", displayTitle: getContentTitle(item, "blog") }));
  const fatwaCards = fatwaResults.map((item) => ({ ...item, contentType: "fatwa", displayTitle: getContentTitle(item, "fatwa") }));

  if (type === "blog") return articleCards;
  if (type === "fatwa") return fatwaCards;

  return [...articleCards, ...fatwaCards].sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
}
