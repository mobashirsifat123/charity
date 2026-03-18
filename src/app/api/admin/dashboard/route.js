import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/server/adminAuth';

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
    ] = await Promise.all([
      supabase.from('campaigns').select('id, raised_amount'),
      supabase
        .from('donations')
        .select('id, amount, donor_name, campaign_id, created_at, payment_status')
        .order('created_at', { ascending: false })
        .limit(5),
      supabase.from('blogs').select('id', { count: 'exact', head: true }),
      supabase.from('fatwas').select('id', { count: 'exact', head: true }),
      supabase.from('team_members').select('id', { count: 'exact', head: true }),
    ]);

    if (campaignsResult.error) throw campaignsResult.error;
    if (donationsResult.error) throw donationsResult.error;
    if (blogsResult.error) throw blogsResult.error;
    if (fatwasResult.error) throw fatwasResult.error;
    if (teamResult.error) throw teamResult.error;

    const campaigns = campaignsResult.data || [];
    const totalRaised = campaigns.reduce((acc, curr) => acc + (Number(curr.raised_amount) || 0), 0);

    return NextResponse.json({
      success: true,
      data: {
        totalRaised,
        activeCampaigns: campaigns.length,
        recentDonations: donationsResult.data || [],
        totalBlogs: blogsResult.count || 0,
        totalFatwas: fatwasResult.count || 0,
        totalTeamMembers: teamResult.count || 0,
      },
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
