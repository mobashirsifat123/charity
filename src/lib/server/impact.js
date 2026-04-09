import { createClient } from "@supabase/supabase-js";
import { hasValidSupabaseServerEnv } from "@/lib/server/env";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co",
  process.env.SUPABASE_SERVICE_ROLE_KEY || "placeholder_key",
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

function toNumber(value) {
  const numericValue = Number(value || 0);
  return Number.isFinite(numericValue) ? numericValue : 0;
}

function formatMonthKey(dateValue) {
  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) return "Unknown";

  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`;
}

function formatMonthLabel(monthKey) {
  const [year, month] = String(monthKey).split("-");
  const date = new Date(Date.UTC(Number(year), Number(month) - 1, 1));

  if (Number.isNaN(date.getTime())) return monthKey;

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    year: "2-digit",
    timeZone: "UTC",
  }).format(date);
}

function isCompletedCampaign(campaign = {}) {
  const explicitStatus = String(campaign.status || "").toLowerCase();
  if (explicitStatus === "completed") return true;

  return toNumber(campaign.goal_amount) > 0 && toNumber(campaign.raised_amount) >= toNumber(campaign.goal_amount);
}

function buildMonthlyRaised(donations = []) {
  const monthMap = new Map();

  donations.forEach((donation) => {
    const monthKey = formatMonthKey(donation.created_at);
    const currentTotal = monthMap.get(monthKey) || 0;
    monthMap.set(monthKey, currentTotal + toNumber(donation.amount));
  });

  return Array.from(monthMap.entries())
    .sort(([left], [right]) => left.localeCompare(right))
    .slice(-6)
    .map(([monthKey, total]) => ({
      monthKey,
      label: formatMonthLabel(monthKey),
      total,
    }));
}

function buildCategoryBreakdown(campaigns = []) {
  const categoryMap = new Map();

  campaigns
    .filter(isCompletedCampaign)
    .forEach((campaign) => {
      const category = String(campaign.category || "General").trim() || "General";
      const currentValue = categoryMap.get(category) || {
        category,
        campaignCount: 0,
        totalRaised: 0,
        totalGoal: 0,
      };

      currentValue.campaignCount += 1;
      currentValue.totalRaised += toNumber(campaign.raised_amount);
      currentValue.totalGoal += toNumber(campaign.goal_amount);
      categoryMap.set(category, currentValue);
    });

  return Array.from(categoryMap.values()).sort((left, right) => right.totalRaised - left.totalRaised);
}

function logImpactFallback(...args) {
  if (process.env.NODE_ENV !== "production") {
    console.warn(...args);
  }
}

async function loadCampaigns() {
  const campaigns = await supabase.from("campaigns").select("*");

  if (!campaigns.error) {
    campaigns.data = (campaigns.data || []).map((campaign) => ({
      ...campaign,
      category: String(campaign.category || "General"),
      status: campaign.status || null,
    }));
  }

  return campaigns;
}

async function loadCompletedDonations() {
  const completed = await supabase
    .from("donations")
    .select("*")
    .eq("payment_status", "completed")
    .order("created_at", { ascending: true });

  if (!completed.error) {
    return completed;
  }

  const missingPaymentStatus =
    completed.error.code === "42703" || /column .*payment_status.* does not exist/i.test(completed.error.message || "");

  if (!missingPaymentStatus) {
    return completed;
  }

  return supabase.from("donations").select("*").order("created_at", { ascending: true });
}

export async function getImpactDashboardData() {
  try {
    if (!hasValidSupabaseServerEnv()) {
      return {
        dataSource: "fallback",
        totals: {
          totalFundsRaised: 0,
          totalCampaignsCompleted: 0,
          totalCompletedDonations: 0,
          activeCategories: 0,
        },
        monthlyRaised: [],
        categoryBreakdown: [],
        completedCampaigns: [],
      };
    }

    const [campaignsResult, donationsResult] = await Promise.all([loadCampaigns(), loadCompletedDonations()]);

    if (campaignsResult.error) {
      throw new Error(campaignsResult.error.message || "Unable to load campaign impact data.");
    }

    if (donationsResult.error) {
      throw new Error(donationsResult.error.message || "Unable to load donation impact data.");
    }

    const campaigns = campaignsResult.data || [];
    const completedDonations = donationsResult.data || [];
    const completedCampaigns = campaigns.filter(isCompletedCampaign);
    const categoryBreakdown = buildCategoryBreakdown(campaigns);

    return {
      dataSource: "supabase",
      totals: {
        totalFundsRaised: completedDonations.reduce((sum, donation) => sum + toNumber(donation.amount), 0),
        totalCampaignsCompleted: completedCampaigns.length,
        totalCompletedDonations: completedDonations.length,
        activeCategories: categoryBreakdown.length,
      },
      monthlyRaised: buildMonthlyRaised(completedDonations),
      categoryBreakdown,
      completedCampaigns,
    };
  } catch (error) {
    logImpactFallback("Impact dashboard falling back to empty data:", error);
    return {
      dataSource: "fallback",
      totals: {
        totalFundsRaised: 0,
        totalCampaignsCompleted: 0,
        totalCompletedDonations: 0,
        activeCategories: 0,
      },
      monthlyRaised: [],
      categoryBreakdown: [],
      completedCampaigns: [],
    };
  }
}
