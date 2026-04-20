import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/server/adminAuth";
import {
  bulkDeleteAdminResource,
  createAdminResource,
  listAdminResource,
} from "@/lib/server/adminResources";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function revalidateResource(resource) {
  if (resource === "blogs") {
    revalidatePath("/");
    revalidatePath("/blog-grid");
    revalidatePath("/search");
  }

  if (resource === "fatwas") {
    revalidatePath("/");
    revalidatePath("/fatwa");
    revalidatePath("/search");
  }

  if (resource === "campaigns") {
    revalidatePath("/");
    revalidatePath("/donation");
    revalidatePath("/impact");
  }
}

export async function GET(request, { params }) {
  try {
    const resolvedParams = await params;
    const auth = await requireAdmin(request);
    if (auth.errorResponse) return auth.errorResponse;

    const data = await listAdminResource({
      supabase: auth.supabase,
      resource: resolvedParams.resource,
    });

    return NextResponse.json({ success: true, data });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 },
    );
  }
}

export async function POST(request, { params }) {
  try {
    const resolvedParams = await params;
    const auth = await requireAdmin(request);
    if (auth.errorResponse) return auth.errorResponse;

    const body = await request.json();
    const data = await createAdminResource({
      supabase: auth.supabase,
      resource: resolvedParams.resource,
      body,
    });

    revalidateResource(resolvedParams.resource);

    return NextResponse.json({ success: true, data });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 },
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    const resolvedParams = await params;
    const auth = await requireAdmin(request);
    if (auth.errorResponse) return auth.errorResponse;

    const body = await request.json();
    await bulkDeleteAdminResource({
      supabase: auth.supabase,
      resource: resolvedParams.resource,
      ids: body?.ids || [],
    });

    revalidateResource(resolvedParams.resource);

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 },
    );
  }
}
