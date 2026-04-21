import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co",
  process.env.SUPABASE_SERVICE_ROLE_KEY || "placeholder_key",
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  },
);

export async function getAdminArticleFormData() {
  let categoriesResult = await supabase
    .from("article_categories")
    .select("*")
    .order("sort_order", { ascending: true });

  if (categoriesResult.error) {
    categoriesResult = await supabase
      .from("article_categories")
      .select("id, name, slug")
      .order("name", { ascending: true });
  }

  const [scholarsResult] = await Promise.all([
    supabase
      .from("scholar_profiles")
      .select("id, name, bio, avatar_url, credentials")
      .order("name", { ascending: true }),
  ]);

  return {
    categories: categoriesResult.error ? [] : categoriesResult.data || [],
    scholars: scholarsResult.error ? [] : scholarsResult.data || [],
  };
}
