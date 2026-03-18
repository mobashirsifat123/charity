import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { isMissingColumnError } from "@/lib/content-utils";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co",
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
);

export async function POST(req) {
  try {
    const body = await req.json();
    const email = String(body?.email || "").trim().toLowerCase();

    if (!email) {
      return NextResponse.json({ success: false, message: "Email is required." }, { status: 400 });
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
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Unable to subscribe right now. Run the content-platform SQL upgrade if this is a new setup.",
      },
      { status: 500 }
    );
  }
}
