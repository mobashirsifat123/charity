"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@supabase/supabase-js";

import {
  getExcerpt,
  normalizeStatus,
  normalizeTags,
  saveContentRecord,
  slugify,
} from "@/lib/content-utils";
import { isApprovedAdminEmail, normalizeEmail } from "@/lib/adminEmails";

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co";
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder";
const supabaseServiceRoleKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY || "placeholder_key";

const clientOptions = {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
};

const authClient = createClient(supabaseUrl, supabaseAnonKey, clientOptions);
const adminClient = createClient(
  supabaseUrl,
  supabaseServiceRoleKey,
  clientOptions,
);

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

async function getAuthorizedAdminProfile(
  formData,
  allowedRoles = ["admin", "scholar"],
) {
  const accessToken = String(formData.get("accessToken") || "").trim();

  if (!accessToken) {
    throw new Error("Your admin session is missing. Please log in again.");
  }

  const { data: authData, error: authError } =
    await authClient.auth.getUser(accessToken);
  if (authError || !authData?.user?.email) {
    throw new Error(
      "Your session could not be verified. Please refresh and log in again.",
    );
  }

  const email = normalizeEmail(authData.user.email);
  const isApprovedAdmin = isApprovedAdminEmail(email);

  const { data: profile, error: profileError } = await adminClient
    .from("users")
    .select("id, email, role, name")
    .eq("email", email)
    .maybeSingle();

  if (profileError) {
    throw new Error(
      profileError.message || "Unable to load your admin profile.",
    );
  }

  if (isApprovedAdmin && !profile) {
    return {
      authUser: authData.user,
      profile: {
        id: authData.user.id,
        email,
        name:
          authData.user.user_metadata?.full_name ||
          authData.user.user_metadata?.name ||
          email,
        role: "admin",
      },
    };
  }

  if (isApprovedAdmin && profile?.role !== "admin") {
    const { data: updatedProfile } = await adminClient
      .from("users")
      .update({ role: "admin" })
      .eq("email", email)
      .select("id, email, role, name")
      .maybeSingle();

    return {
      authUser: authData.user,
      profile: updatedProfile || {
        ...profile,
        role: "admin",
      },
    };
  }

  if (!profile) {
    throw new Error("Unable to load your admin profile.");
  }

  if (!allowedRoles.includes(profile.role)) {
    throw new Error("You do not have permission to perform this action.");
  }

  return {
    authUser: authData.user,
    profile,
  };
}

async function uploadAdminFile({
  file,
  bucket = "public_assets",
  folder = "admin",
}) {
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
  const baseName = slugify(file.name.replace(/\.[^.]+$/, "")) || "image";
  const path = `${folder}/${Date.now()}-${baseName}.${extension}`;
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  const { data: uploadData, error: uploadError } = await adminClient.storage
    .from(bucket)
    .upload(path, buffer, {
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

export async function uploadAdminImage(formData, bucket = "public_assets") {
  await getAuthorizedAdminProfile(formData);

  const file =
    formData.get("file") ||
    formData.get("coverImage") ||
    formData.get("avatar");

  const folder = String(formData.get("folder") || "admin").trim();
  const publicUrl = await uploadAdminFile({
    file,
    bucket,
    folder,
  });

  return {
    success: true,
    publicUrl,
  };
}

export async function createScholarProfile(formData) {
  const { profile } = await getAuthorizedAdminProfile(formData);

  const name = String(formData.get("name") || "").trim();
  const bio = String(formData.get("bio") || "").trim();
  const credentials = String(formData.get("credentials") || "").trim();
  const avatarFile = formData.get("avatar");

  if (!name) {
    return { success: false, error: "Scholar name is required." };
  }

  let avatarUrl = "";
  if (avatarFile && avatarFile.size) {
    avatarUrl = await uploadAdminFile({
      file: avatarFile,
      bucket: "public_assets",
      folder: "scholars",
    });
  }

  const basePayload = {
    name,
    bio,
    avatar_url: avatarUrl || null,
    credentials: credentials || null,
  };

  let insertResult = await adminClient
    .from("scholar_profiles")
    .insert(basePayload)
    .select()
    .single();

  if (insertResult.error) {
    const message = String(insertResult.error.message || "").toLowerCase();

    if (message.includes("user_id")) {
      insertResult = await adminClient
        .from("scholar_profiles")
        .insert({
          ...basePayload,
          user_id: profile.id,
        })
        .select()
        .single();
    }
  }

  if (insertResult.error) {
    const message = String(insertResult.error.message || "");

    if (
      message.toLowerCase().includes("duplicate") ||
      message.toLowerCase().includes("unique")
    ) {
      return {
        success: false,
        error:
          "This database still links scholar profiles to a specific platform user. Add a dedicated scholar account or relax the unique user constraint before creating another linked scholar profile.",
      };
    }

    return {
      success: false,
      error: message || "Unable to create the scholar profile.",
    };
  }

  revalidatePath("/admin/scholars");
  revalidatePath("/admin/scholars/new");

  return {
    success: true,
    scholarId: insertResult.data?.id,
  };
}

export async function createArticle(formData) {
  const { profile } = await getAuthorizedAdminProfile(formData);

  const title = String(formData.get("title") || "").trim();
  const content = String(formData.get("content") || "").trim();
  const categoryName = String(formData.get("categoryName") || "").trim();
  const categorySlug = String(formData.get("categorySlug") || "").trim();
  const scholarId = String(formData.get("scholarId") || "").trim();
  const status = normalizeStatus(String(formData.get("status") || "draft"));
  const tags = normalizeTags(String(formData.get("tags") || ""));
  const summary = String(formData.get("summary") || "").trim();
  const featured = String(formData.get("featured") || "") === "on";
  const coverImage = formData.get("coverImage");

  if (!title) {
    return { success: false, error: "Article title is required." };
  }

  if (!content) {
    return { success: false, error: "Article content is required." };
  }

  let coverImageUrl = "";
  if (coverImage && coverImage.size) {
    coverImageUrl = await uploadAdminFile({
      file: coverImage,
      bucket: "public_assets",
      folder: "articles",
    });
  }

  let scholarProfile = null;
  if (scholarId) {
    const { data } = await adminClient
      .from("scholar_profiles")
      .select("id, name, bio, credentials")
      .eq("id", scholarId)
      .maybeSingle();

    scholarProfile = data || null;
  }

  const basePayload = {
    title,
    content,
    status,
    image_url: coverImageUrl || "",
  };

  const optionalPayload = {
    author_id: profile.id || null,
    category: categoryName || null,
    primary_category_slug: categorySlug || null,
    category_slugs: categorySlug ? [categorySlug] : [],
    tags,
    featured,
    slug: slugify(title),
    author_name:
      scholarProfile?.name || profile.name || profile.email || "IRWA Team",
    author_role: scholarProfile?.credentials || "Scholar",
    author_bio: scholarProfile?.bio || "",
    seo_title: title,
    seo_description: getExcerpt(content, 165),
    social_image: coverImageUrl || "",
    summary: summary || getExcerpt(content, 220),
  };

  const saveResult = await saveContentRecord({
    supabase: adminClient,
    table: "blogs",
    basePayload,
    optionalPayload,
  });

  if (!saveResult) {
    return { success: false, error: "Unable to save the article." };
  }

  revalidatePath("/admin/blogs");
  revalidatePath("/admin/articles");
  revalidatePath("/");
  revalidatePath("/blog-grid");
  revalidatePath("/search");

  return {
    success: true,
    optionalFieldsSaved: saveResult.optionalFieldsSaved,
  };
}
