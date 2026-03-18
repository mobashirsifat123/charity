export const BLOG_CATEGORY_OPTIONS = [
  "Aqidah",
  "Salah",
  "Family",
  "Ramadan",
  "Dawah",
  "Charity",
  "Community",
  "Tazkiyah",
];

export const FATWA_CATEGORY_OPTIONS = [
  "Worship",
  "Family",
  "Finance",
  "Dawah",
  "Charity",
  "Ramadan",
  "General",
];

export function slugify(value = "") {
  return value
    .toString()
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export function getPlainText(value = "") {
  return value.replace(/<[^>]*>?/gm, "").replace(/\s+/g, " ").trim();
}

export function getExcerpt(value = "", length = 160) {
  const text = getPlainText(value);
  if (text.length <= length) return text;
  return `${text.slice(0, length).trim()}...`;
}

export function normalizeTags(value) {
  if (Array.isArray(value)) {
    return value.map((tag) => String(tag).trim()).filter(Boolean);
  }

  if (typeof value === "string") {
    return value
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean);
  }

  return [];
}

export function tagsToInputValue(value) {
  return normalizeTags(value).join(", ");
}

export function normalizeStatus(value = "") {
  if (value === "drafted") return "draft";
  return value || "draft";
}

export function buildContentIdentifier(record, fallbackTitle = "content") {
  if (!record?.id) return slugify(record?.slug || fallbackTitle);
  const resolvedSlug = record?.slug?.trim() || slugify(record?.title || record?.question || fallbackTitle);
  return `${record.id}--${resolvedSlug || "content"}`;
}

export function extractIdentifierId(value = "") {
  return String(value || "").split("--")[0];
}

export function getContentPath(type, record) {
  const identifier = buildContentIdentifier(record, type);
  return type === "blog" ? `/blog-details/${identifier}` : `/fatwa/${identifier}`;
}

export function getContentTitle(record, type) {
  if (type === "fatwa") {
    return record?.title || record?.question || "Untitled Fatwa";
  }
  return record?.title || "Untitled Article";
}

export function getContentBody(record, type) {
  if (type === "fatwa") {
    return record?.answer || record?.content || "";
  }
  return record?.content || "";
}

export function getContentCategory(record) {
  return record?.category || "General";
}

export function getAuthorName(record, fallback = "IRWA Team") {
  return record?.author_name || fallback;
}

export function getAuthorRole(record, fallback = "Contributor") {
  return record?.author_role || fallback;
}

export function sortFeaturedFirst(items = []) {
  return [...items].sort((a, b) => {
    const featuredA = a?.featured ? 1 : 0;
    const featuredB = b?.featured ? 1 : 0;
    if (featuredA !== featuredB) return featuredB - featuredA;
    return new Date(b?.created_at || 0) - new Date(a?.created_at || 0);
  });
}

export function matchesUnifiedSearch(record, type, query) {
  const lower = query.toLowerCase();
  const haystack = [
    getContentTitle(record, type),
    getContentBody(record, type),
    record?.question,
    record?.answer,
    record?.category,
    normalizeTags(record?.tags).join(" "),
    record?.author_name,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  return haystack.includes(lower);
}

export function getSavedContentStorageKey(userId = "guest") {
  return `irwa-saved-content:${userId}`;
}

export function readSavedContent(userId = "guest") {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(window.localStorage.getItem(getSavedContentStorageKey(userId)) || "[]");
  } catch (error) {
    console.error("Failed to read saved content:", error);
    return [];
  }
}

export function writeSavedContent(userId = "guest", items = []) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(getSavedContentStorageKey(userId), JSON.stringify(items));
}

export function isMissingColumnError(error) {
  const message = String(error?.message || "").toLowerCase();
  return message.includes("column") || message.includes("schema cache") || message.includes("could not find");
}

export async function saveContentRecord({
  supabase,
  table,
  recordId = null,
  basePayload,
  optionalPayload = {},
}) {
  const fullPayload = { ...basePayload, ...optionalPayload };

  const execute = async (payload) => {
    if (recordId) {
      return supabase.from(table).update(payload).eq("id", recordId);
    }
    return supabase.from(table).insert([payload]);
  };

  const fullResult = await execute(fullPayload);
  if (!fullResult.error) {
    return { optionalFieldsSaved: true };
  }

  if (!isMissingColumnError(fullResult.error)) {
    throw fullResult.error;
  }

  const fallbackResult = await execute(basePayload);
  if (fallbackResult.error) {
    throw fallbackResult.error;
  }

  return { optionalFieldsSaved: false };
}

export async function incrementViewCount({ supabase, table, record }) {
  if (!record?.id) return;
  try {
    await supabase
      .from(table)
      .update({ view_count: Number(record.view_count || 0) + 1 })
      .eq("id", record.id);
  } catch (error) {
    if (!isMissingColumnError(error)) {
      console.error(`Failed to increment ${table} view count:`, error);
    }
  }
}
