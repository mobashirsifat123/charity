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
    const formData = await req.formData();
    const file = formData.get('file');
    const folder = formData.get('folder') || 'general';
    const tableName = formData.get('table_name');
    const columnName = formData.get('column_name');
    const rowId = formData.get('row_id');
    const settingKey = formData.get('setting_key');
    const resolvedTableName = TABLE_ALIASES[tableName] || tableName;
    const bucket = 'site-images'; 
    
    if (!file) {
      return NextResponse.json({ success: false, error: 'No file provided' }, { status: 400 });
    }

    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ success: false, error: 'File size exceeds 5MB limit' }, { status: 400 });
    }

    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 10000);
    const ext = file.name.split('.').pop() || 'jpg';
    const filename = `${timestamp}-${random}.${ext}`;
    
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload
    const { data: uploadData, error: uploadError } = await supabase
      .storage
      .from(bucket)
      .upload(`${folder}/${filename}`, buffer, {
        contentType: file.type,
        upsert: true
      });

    if (uploadError) throw uploadError;

    // Get URL
    const { data: { publicUrl } } = supabase
      .storage
      .from(bucket)
      .getPublicUrl(uploadData.path);

    // Update Database
    if (resolvedTableName && columnName) {
        if (resolvedTableName === 'site_settings' && settingKey) {
            const { error: dbError } = await supabase
                .from('site_settings')
                .upsert({ 
                    setting_key: settingKey, 
                    setting_value: publicUrl
                }, { onConflict: 'setting_key' });
            
            if (dbError) throw dbError;
        } else if (rowId) {
            const { error: dbError } = await supabase
                .from(resolvedTableName)
                .update({ [columnName]: publicUrl })
                .eq('id', rowId);
                
            if (dbError) throw dbError;
        }
    }

    return NextResponse.json({ success: true, url: publicUrl, message: 'Upload complete' });

  } catch (error) {
    console.error('Image upload error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
