import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/server/adminAuth";
import {
  deleteAdminResource,
  getAdminResource,
  updateAdminResource,
} from "@/lib/server/adminResources";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function revalidateResource(resource, id) {
  if (resource === "blogs") {
    revalidatePath("/");
    revalidatePath("/blog-grid");
    revalidatePath("/search");
    if (id) revalidatePath(`/blog-details/${id}`);
  }

  if (resource === "fatwas") {
    revalidatePath("/");
    revalidatePath("/fatwa");
    revalidatePath("/search");
    if (id) revalidatePath(`/fatwa/${id}`);
  }

  if (resource === "campaigns") {
    revalidatePath("/");
    revalidatePath("/donation");
    revalidatePath("/impact");
    if (id) revalidatePath(`/cause-details/${id}`);
  }
}

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
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 },
    );
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

    revalidateResource(resolvedParams.resource, resolvedParams.id);

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

    await deleteAdminResource({
      supabase: auth.supabase,
      resource: resolvedParams.resource,
      id: resolvedParams.id,
    });

    revalidateResource(resolvedParams.resource, resolvedParams.id);

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 },
    );
  }
}
