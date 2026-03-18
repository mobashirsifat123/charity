import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/server/adminAuth';
import { parseSiteSettingValue } from '@/lib/siteSettings';
import { SITE_IMAGE_REGISTRY, looksLikeImageUrl } from '@/lib/siteImageRegistry';

export async function GET(request) {
  const auth = await requireAdmin(request);
  if (auth.errorResponse) return auth.errorResponse;

  const { supabase } = auth;
  const { data, error } = await supabase
    .from('site_settings')
    .select('setting_key, setting_value')
    .in('setting_key', SITE_IMAGE_REGISTRY.map((item) => item.setting_key));

  if (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }

  const values = new Map(
    (data || []).map((item) => [item.setting_key, parseSiteSettingValue(item.setting_value)])
  );

  const registry = SITE_IMAGE_REGISTRY.map((item) => {
    const rawValue = values.get(item.setting_key);
    const currentUrl = looksLikeImageUrl(rawValue) ? rawValue : '';
    const extraDescription =
      rawValue && !currentUrl ? `${item.description} Current text value: ${rawValue}` : item.description;

    return {
      id: item.setting_key,
      section: item.section,
      label: item.label,
      description: extraDescription,
      recommended_size: item.recommended_size,
      table_name: 'site_settings',
      column_name: 'setting_value',
      setting_key: item.setting_key,
      folder: item.folder,
      current_url: currentUrl,
    };
  });

  return NextResponse.json({ success: true, data: registry });
}
