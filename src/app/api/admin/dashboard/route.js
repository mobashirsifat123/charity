import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/server/adminAuth";

async function loadRecentDonations(supabase) {
  const preferredResult = await supabase
    .from("donations")
    .select(
      "id, amount, donor_name, donor_email, campaign_id, created_at, payment_status",
    )
    .order("created_at", { ascending: false })
    .limit(5);

  if (!preferredResult.error) {
    return preferredResult;
  }

  const message = String(preferredResult.error.message || "").toLowerCase();
  const missingDonorName =
    message.includes("donor_name") ||
    message.includes("schema cache") ||
    message.includes("could not find");

  if (!missingDonorName) {
    return preferredResult;
  }

  const fallbackResult = await supabase
    .from("donations")
    .select("id, amount, donor_email, campaign_id, created_at, payment_status")
    .order("created_at", { ascending: false })
    .limit(5);

  return {
    ...fallbackResult,
    data: (fallbackResult.data || []).map((donation) => ({
      donor_name: "",
      ...donation,
    })),
  };
}

export async function GET(request) {
  try {
    const auth = await requireAdmin(request);
    if (auth.errorResponse) return auth.errorResponse;

    const { supabase } = auth;

    const [
      campaignsResult,
      donationsResult,
      blogsResult,
      fatwasResult,
      teamResult,
      fatwaRequestsResult,
      newsletterResult,
    ] = await Promise.all([
      supabase.from("campaigns").select("id, raised_amount"),
      loadRecentDonations(supabase),
      supabase.from("blogs").select("id", { count: "exact", head: true }),
      supabase.from("fatwas").select("id", { count: "exact", head: true }),
      supabase
        .from("team_members")
        .select("id", { count: "exact", head: true }),
      supabase
        .from("fatwa_requests")
        .select("id", { count: "exact", head: true })
        .eq("status", "new"),
      supabase
        .from("newsletter_subscriptions")
        .select("id", { count: "exact", head: true })
        .eq("status", "active"),
    ]);

    if (campaignsResult.error) throw campaignsResult.error;
    if (donationsResult.error) throw donationsResult.error;
    if (blogsResult.error) throw blogsResult.error;
    if (fatwasResult.error) throw fatwasResult.error;
    if (teamResult.error) throw teamResult.error;
    if (fatwaRequestsResult.error) throw fatwaRequestsResult.error;
    if (newsletterResult.error) throw newsletterResult.error;

    const campaigns = campaignsResult.data || [];
    const totalRaised = campaigns.reduce(
      (acc, curr) => acc + (Number(curr.raised_amount) || 0),
      0,
    );

    return NextResponse.json({
      success: true,
      data: {
        totalRaised,
        activeCampaigns: campaigns.length,
        recentDonations: donationsResult.data || [],
        totalBlogs: blogsResult.count || 0,
        totalFatwas: fatwasResult.count || 0,
        totalTeamMembers: teamResult.count || 0,
        newFatwaRequests: fatwaRequestsResult.count || 0,
        activeNewsletterSubscribers: newsletterResult.count || 0,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 },
    );
  }
}
