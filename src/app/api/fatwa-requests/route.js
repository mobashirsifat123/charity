import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { isMissingColumnError } from "@/lib/content-utils";

export async function POST(req) {
  try {
    const body = await req.json();

    if (!body?.name || !body?.email || !body?.question) {
      return NextResponse.json(
        { success: false, message: "Name, email, and question are required." },
        { status: 400 }
      );
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey =
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json(
        {
          success: false,
          message: "Fatwa request submissions are not configured yet.",
        },
        { status: 503 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    const { error } = await supabase.from("fatwa_requests").insert([
      {
        name: body.name,
        email: body.email,
        category: body.category || "General",
        question: body.question,
        details: body.details || "",
        status: "new",
      },
    ]);

    if (error) {
      if (isMissingColumnError(error)) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Fatwa request storage is not configured yet. Run the content platform SQL upgrade to enable submissions.",
          },
          { status: 503 }
        );
      }
      throw error;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Fatwa request error:", error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Unable to submit your question right now. Run the content-platform SQL upgrade if this is a new setup.",
      },
      { status: 500 }
    );
  }
}
