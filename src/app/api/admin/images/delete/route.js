import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/server/adminAuth';

const TABLE_ALIASES = {
  team: 'team_members',
  team_members: 'team_members',
  campaigns: 'campaigns',
  blogs: 'blogs',
  fatwas: 'fatwas',
  site_settings: 'site_settings',
};

export async function POST(req) {
  try {
    const auth = await requireAdmin(req);
    if (auth.errorResponse) return auth.errorResponse;

    const { supabase } = auth;
    const { url, image_url, table_name, column_name, row_id, setting_key } = await req.json();
    const targetUrl = url || image_url;
    const resolvedTableName = TABLE_ALIASES[table_name] || table_name;

    if (!targetUrl) {
      return NextResponse.json({ success: false, error: 'No URL provided' }, { status: 400 });
    }

    const bucket = 'site-images';
    const filePath = targetUrl.split(`${bucket}/`)[1];

    if (!filePath) {
      return NextResponse.json({ success: false, error: 'Invalid URL format' }, { status: 400 });
    }

    // Delete from storage
    const { error: deleteError } = await supabase
      .storage
      .from(bucket)
      .remove([filePath]);

    if (deleteError) {
      console.error('Storage delete error:', deleteError);
      return NextResponse.json({ success: false, error: deleteError.message }, { status: 500 });
    }

    // Nullify database record
    if (resolvedTableName && column_name) {
        if (resolvedTableName === 'site_settings' && setting_key) {
             const { error: dbError } = await supabase
                .from('site_settings')
                .update({ setting_value: null })
                .eq('setting_key', setting_key);
            
            if (dbError) throw dbError;
        } else if (row_id) {
            const { error: dbError } = await supabase
                .from(resolvedTableName)
                .update({ [column_name]: null })
                .eq('id', row_id);
                
            if (dbError) throw dbError;
        }
    }

    return NextResponse.json({ success: true, message: 'Image deleted' });

  } catch (error) {
    console.error('Image delete error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
