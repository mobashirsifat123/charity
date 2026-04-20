import { NextResponse } from "next/server";
import { createAdminSupabaseClient } from "@/lib/server/adminAuth";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const supabase = createAdminSupabaseClient();
    const { data, error } = await supabase
      .from("site_settings")
      .select("setting_key, setting_value");

    if (error) throw error;

    return NextResponse.json(
      { success: true, data: data || [] },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate",
        },
      },
    );
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Unable to load site settings.",
      },
      {
        status: 500,
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate",
        },
      },
    );
  }
}
