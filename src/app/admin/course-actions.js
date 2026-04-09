"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@supabase/supabase-js";

import { slugify } from "@/lib/content-utils";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder";
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "placeholder_key";

const clientOptions = {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
};

const authClient = createClient(supabaseUrl, supabaseAnonKey, clientOptions);
const adminClient = createClient(supabaseUrl, supabaseServiceRoleKey, clientOptions);

function resolveFileExtension(fileName = "", mimeType = "") {
  const explicitExtension = String(fileName).split(".").pop();
  if (explicitExtension && explicitExtension !== fileName) {
    return explicitExtension.toLowerCase();
  }

  const typeMap = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
    "image/gif": "gif",
    "image/svg+xml": "svg",
  };

  return typeMap[mimeType] || "jpg";
}

async function getAuthorizedCourseAdmin(input, allowedRoles = ["admin", "scholar"]) {
  const accessToken =
    typeof input === "string"
      ? input.trim()
      : String(input?.get?.("accessToken") || input?.accessToken || "").trim();

  if (!accessToken) {
    throw new Error("Your admin session is missing. Please log in again.");
  }

  const { data: authData, error: authError } = await authClient.auth.getUser(accessToken);
  if (authError || !authData?.user?.email) {
    throw new Error("Your session could not be verified. Please refresh and log in again.");
  }

  const { data: profile, error: profileError } = await adminClient
    .from("users")
    .select("id, email, role, name")
    .eq("email", authData.user.email)
    .maybeSingle();

  if (profileError || !profile) {
    throw new Error(profileError?.message || "Unable to load your admin profile.");
  }

  if (!allowedRoles.includes(profile.role)) {
    throw new Error("You do not have permission to manage courses.");
  }

  return {
    accessToken,
    authUser: authData.user,
    profile,
  };
}

async function uploadCourseImage({ file, bucket = "public_assets", folder = "courses" }) {
  if (!file || typeof file.arrayBuffer !== "function" || !file.size) {
    return "";
  }

  if (file.size > 5 * 1024 * 1024) {
    throw new Error("Please upload an image smaller than 5MB.");
  }

  const allowedMimeTypes = [
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/gif",
    "image/svg+xml",
  ];

  if (!allowedMimeTypes.includes(file.type)) {
    throw new Error("Only JPG, PNG, WEBP, GIF, and SVG images are supported.");
  }

  const extension = resolveFileExtension(file.name, file.type);
  const fileSlug = slugify(file.name.replace(/\.[^.]+$/, "")) || "course-cover";
  const storagePath = `${folder}/${Date.now()}-${fileSlug}.${extension}`;
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  const { data: uploadData, error: uploadError } = await adminClient.storage
    .from(bucket)
    .upload(storagePath, buffer, {
      contentType: file.type,
      upsert: true,
    });

  if (uploadError) {
    throw new Error(uploadError.message || "Image upload failed.");
  }

  const {
    data: { publicUrl },
  } = adminClient.storage.from(bucket).getPublicUrl(uploadData.path);

  return publicUrl;
}

export async function createCourse(formData) {
  await getAuthorizedCourseAdmin(formData);

  const title = String(formData.get("title") || "").trim();
  const description = String(formData.get("description") || "").trim();
  const scholarId = String(formData.get("scholarId") || "").trim();
  const coverImage = formData.get("coverImage");

  if (!title) {
    return { success: false, error: "Course title is required." };
  }

  let coverImageUrl = "";
  if (coverImage && coverImage.size) {
    coverImageUrl = await uploadCourseImage({
      file: coverImage,
      bucket: "public_assets",
      folder: "courses",
    });
  }

  const payload = {
    title,
    description: description || null,
    scholar_id: scholarId ? Number(scholarId) : null,
    cover_image: coverImageUrl || null,
  };

  const { data, error } = await adminClient
    .from("courses")
    .insert(payload)
    .select()
    .single();

  if (error) {
    return { success: false, error: error.message || "Unable to create course." };
  }

  revalidatePath("/admin/courses");

  return {
    success: true,
    courseId: data?.id,
  };
}

export async function createModule(courseId, formData) {
  await getAuthorizedCourseAdmin(formData);

  const title = String(formData.get("title") || "").trim();
  const videoUrl = String(formData.get("videoUrl") || "").trim();
  const orderIndex = Number(formData.get("orderIndex") || 0);
  const contentText = String(formData.get("contentText") || "").trim();

  if (!title) {
    return { success: false, error: "Module title is required." };
  }

  if (!Number.isFinite(orderIndex) || orderIndex < 1) {
    return { success: false, error: "Order number must be at least 1." };
  }

  const { data, error } = await adminClient
    .from("course_modules")
    .insert({
      course_id: Number(courseId),
      title,
      video_url: videoUrl || null,
      order_index: orderIndex,
      content_text: contentText || null,
    })
    .select()
    .single();

  if (error) {
    return { success: false, error: error.message || "Unable to add module." };
  }

  revalidatePath(`/admin/courses/${courseId}/modules`);
  revalidatePath(`/courses/${courseId}`);

  return {
    success: true,
    moduleId: data?.id,
  };
}

export async function updateModule(id, data) {
  const payload = data || {};
  await getAuthorizedCourseAdmin(payload);

  const title = String(payload.title || "").trim();
  const videoUrl = String(payload.videoUrl || "").trim();
  const orderIndex = Number(payload.orderIndex || 0);
  const contentText = String(payload.contentText || "").trim();
  const courseId = Number(payload.courseId || 0);

  if (!title) {
    return { success: false, error: "Module title is required." };
  }

  if (!Number.isFinite(orderIndex) || orderIndex < 1) {
    return { success: false, error: "Order number must be at least 1." };
  }

  const { error } = await adminClient
    .from("course_modules")
    .update({
      title,
      video_url: videoUrl || null,
      order_index: orderIndex,
      content_text: contentText || null,
    })
    .eq("id", id);

  if (error) {
    return { success: false, error: error.message || "Unable to update module." };
  }

  if (courseId) {
    revalidatePath(`/admin/courses/${courseId}/modules`);
    revalidatePath(`/courses/${courseId}`);
  }

  return { success: true };
}

export async function deleteModule(id, formData) {
  await getAuthorizedCourseAdmin(formData);

  const courseId = Number(formData.get("courseId") || 0);

  const { error } = await adminClient
    .from("course_modules")
    .delete()
    .eq("id", id);

  if (error) {
    return { success: false, error: error.message || "Unable to delete module." };
  }

  if (courseId) {
    revalidatePath(`/admin/courses/${courseId}/modules`);
    revalidatePath(`/courses/${courseId}`);
  }

  return { success: true };
}
