import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { isMissingColumnError } from "@/lib/content-utils";
import { hasValidSupabaseServerEnv } from "@/lib/server/env";

export async function POST(req) {
  try {
    if (!hasValidSupabaseServerEnv()) {
      return NextResponse.json(
        {
          success: false,
          message: "Newsletter storage is not configured in this environment yet.",
        },
        { status: 503 }
      );
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );

    const body = await req.json();
    const email = String(body?.email || "").trim().toLowerCase();
    const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    if (!email) {
      return NextResponse.json({ success: false, message: "Email is required." }, { status: 400 });
    }
    if (!isValidEmail) {
      return NextResponse.json({ success: false, message: "Please enter a valid email address." }, { status: 400 });
    }

    const { error } = await supabase.from("newsletter_subscriptions").upsert(
      {
        email,
        status: "active",
        source: body?.source || "website",
      },
      { onConflict: "email" }
    );

    if (error) {
      if (isMissingColumnError(error)) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Newsletter subscriptions are not configured yet. Run the content platform SQL upgrade to enable this feature.",
          },
          { status: 503 }
        );
      }
      throw error;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Newsletter subscription error:", error);
    const isNetworkFailure =
      String(error?.message || "").toLowerCase().includes("fetch failed") ||
      String(error?.cause?.code || "").toUpperCase() === "ECONNRESET";
    return NextResponse.json(
      {
        success: false,
        message: isNetworkFailure
          ? "Newsletter service is temporarily unavailable. Please try again shortly."
          : (error.message || "Unable to subscribe right now. Run the content-platform SQL upgrade if this is a new setup."),
      },
      { status: isNetworkFailure ? 503 : 500 }
    );
  }
}
