import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/server/adminAuth';

export async function GET(request) {
    try {
        const auth = await requireAdmin(request);
        if (auth.errorResponse) return auth.errorResponse;

        const { supabase } = auth;
        const { data, error } = await supabase
            .from('donations')
            .select('*, campaigns(title)')
            .order('created_at', { ascending: false });
        
        if (error) throw error;
        
        return NextResponse.json({ success: true, data });
    } catch (err) {
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}
