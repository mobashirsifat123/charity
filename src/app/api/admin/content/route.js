import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/server/adminAuth";

export const dynamic = "force-dynamic";
export const revalidate = 0;

async function saveSiteSetting(supabase, item) {
  const settingKey = String(item?.setting_key || "").trim();

  if (!settingKey) {
    throw new Error("A setting key is required.");
  }

  const payload = {
    setting_key: settingKey,
    setting_value: item.setting_value,
  };

  const upsertResult = await supabase
    .from("site_settings")
    .upsert(payload, { onConflict: "setting_key" });

  if (!upsertResult.error) {
    return;
  }

  const message = String(upsertResult.error.message || "").toLowerCase();
  const canFallback =
    message.includes("unique") ||
    message.includes("constraint") ||
    message.includes("on conflict") ||
    message.includes("duplicate");

  if (!canFallback) {
    throw upsertResult.error;
  }

  const updateResult = await supabase
    .from("site_settings")
    .update({ setting_value: item.setting_value })
    .eq("setting_key", settingKey)
    .select("setting_key");

  if (updateResult.error) {
    throw updateResult.error;
  }

  if (!updateResult.data?.length) {
    const insertResult = await supabase.from("site_settings").insert(payload);
    if (insertResult.error) {
      throw insertResult.error;
    }
  }
}

export async function GET(request) {
  try {
    const auth = await requireAdmin(request);
    if (auth.errorResponse) return auth.errorResponse;

    const { supabase } = auth;
    const { data, error } = await supabase.from("site_settings").select("*");
    if (error) throw error;
    return NextResponse.json({ success: true, data });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 },
    );
  }
}

export async function PUT(req) {
  try {
    const auth = await requireAdmin(req);
    if (auth.errorResponse) return auth.errorResponse;

    const { supabase } = auth;
    const body = await req.json();
    const { updates } = body;

    if (!Array.isArray(updates)) {
      throw new Error("Invalid site settings payload.");
    }

    for (const item of updates) {
      await saveSiteSetting(supabase, item);
    }

    revalidatePath("/");
    revalidatePath("/blog-grid");
    revalidatePath("/fatwa");
    revalidatePath("/ebooks");
    revalidatePath("/about-us");
    revalidatePath("/contact-us");

    return NextResponse.json(
      { success: true, savedCount: updates.length },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate",
        },
      },
    );
  } catch (err) {
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 },
    );
  }
}
