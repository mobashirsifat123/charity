import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/server/adminAuth';

export async function GET(request) {
    try {
        const auth = await requireAdmin(request);
        if (auth.errorResponse) return auth.errorResponse;

        const { supabase } = auth;
        const { data, error } = await supabase.from('site_settings').select('*');
        if (error) throw error;
        return NextResponse.json({ success: true, data });
    } catch (err) {
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}

export async function PUT(req) {
    try {
        const auth = await requireAdmin(req);
        if (auth.errorResponse) return auth.errorResponse;

        const { supabase } = auth;
        const body = await req.json();
        const { updates } = body;
        
        for (const item of updates) {
            await supabase.from('site_settings').upsert({
                setting_key: item.setting_key,
                setting_value: item.setting_value
            }, { onConflict: 'setting_key' });
        }
        return NextResponse.json({ success: true });
    } catch (err) {
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}
