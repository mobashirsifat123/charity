import { NextResponse } from "next/server";
import { createAdminSupabaseClient } from "@/lib/server/adminAuth";
import { FALLBACK_ARTICLE_CATEGORIES } from "@/lib/content-data";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function isMissingTableError(error) {
  const message = String(error?.message || "").toLowerCase();
  const code = String(error?.code || "");

  return (
    code === "42P01" ||
    message.includes("does not exist") ||
    message.includes("schema cache") ||
    message.includes("could not find")
  );
}

export async function GET() {
  try {
    const supabase = createAdminSupabaseClient();
    const { data, error } = await supabase
      .from("article_categories")
      .select("*")
      .order("sort_order", { ascending: true })
      .order("name", { ascending: true });

    if (error) {
      if (isMissingTableError(error)) {
        return NextResponse.json({
          success: true,
          data: FALLBACK_ARTICLE_CATEGORIES,
          fallback: true,
        });
      }

      throw error;
    }

    return NextResponse.json({
      success: true,
      data: data?.length ? data : FALLBACK_ARTICLE_CATEGORIES,
      fallback: !data?.length,
    });
  } catch (error) {
    console.error("Article category API fallback used:", error);
    return NextResponse.json({
      success: true,
      data: FALLBACK_ARTICLE_CATEGORIES,
      fallback: true,
    });
  }
}
