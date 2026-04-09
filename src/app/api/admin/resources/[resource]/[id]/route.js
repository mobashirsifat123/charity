import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/server/adminAuth';
import {
  deleteAdminResource,
  getAdminResource,
  updateAdminResource,
} from '@/lib/server/adminResources';

export async function GET(request, { params }) {
  try {
    const resolvedParams = await params;
    const auth = await requireAdmin(request);
    if (auth.errorResponse) return auth.errorResponse;

    const data = await getAdminResource({
      supabase: auth.supabase,
      resource: resolvedParams.resource,
      id: resolvedParams.id,
    });

    return NextResponse.json({ success: true, data });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PATCH(request, { params }) {
  try {
    const resolvedParams = await params;
    const auth = await requireAdmin(request);
    if (auth.errorResponse) return auth.errorResponse;

    const body = await request.json();
    const data = await updateAdminResource({
      supabase: auth.supabase,
      resource: resolvedParams.resource,
      id: resolvedParams.id,
      body,
    });

    return NextResponse.json({ success: true, data });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const resolvedParams = await params;
    const auth = await requireAdmin(request);
    if (auth.errorResponse) return auth.errorResponse;

    await deleteAdminResource({
      supabase: auth.supabase,
      resource: resolvedParams.resource,
      id: resolvedParams.id,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
