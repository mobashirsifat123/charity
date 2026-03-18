import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/server/adminAuth';
import {
  bulkDeleteAdminResource,
  createAdminResource,
  listAdminResource,
} from '@/lib/server/adminResources';

export async function GET(request, { params }) {
  try {
    const auth = await requireAdmin(request);
    if (auth.errorResponse) return auth.errorResponse;

    const data = await listAdminResource({
      supabase: auth.supabase,
      resource: params.resource,
    });

    return NextResponse.json({ success: true, data });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request, { params }) {
  try {
    const auth = await requireAdmin(request);
    if (auth.errorResponse) return auth.errorResponse;

    const body = await request.json();
    const data = await createAdminResource({
      supabase: auth.supabase,
      resource: params.resource,
      body,
    });

    return NextResponse.json({ success: true, data });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const auth = await requireAdmin(request);
    if (auth.errorResponse) return auth.errorResponse;

    const body = await request.json();
    await bulkDeleteAdminResource({
      supabase: auth.supabase,
      resource: params.resource,
      ids: body?.ids || [],
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
