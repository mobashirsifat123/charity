import { getAuthorName, getContentCategory, getContentTitle, getExcerpt } from "@/lib/content-utils";

export const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
const defaultImagePath = "/branding/irwaa-logo.avif";

export function toAbsoluteUrl(path = "/") {
  try {
    return new URL(path, siteUrl).toString();
  } catch {
    return siteUrl;
  }
}

export function resolveSeoImage(imageUrl) {
  if (!imageUrl) return toAbsoluteUrl(defaultImagePath);

  if (String(imageUrl).startsWith("http://") || String(imageUrl).startsWith("https://")) {
    return imageUrl;
  }

  return toAbsoluteUrl(imageUrl);
}

export function buildArticleMetadata(record, type) {
  if (!record) {
    return {
      title: type === "blog" ? "Article Not Found" : "Fatwa Not Found",
      description:
        type === "blog"
          ? "The requested IRWAA article could not be found."
          : "The requested IRWAA fatwa could not be found.",
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const isBlog = type === "blog";
  const title = record.seo_title || getContentTitle(record, type);
  const description =
    record.seo_description ||
    getExcerpt(isBlog ? record.content || "" : record.answer || record.content || record.question || "", 160);
  const path = isBlog
    ? `/blog-details/${record.id}--${record.slug || ""}`.replace(/-$/, "")
    : `/fatwa/${record.id}--${record.slug || ""}`.replace(/-$/, "");
  const url = toAbsoluteUrl(path);
  const image = resolveSeoImage(record.image_url || record.cover_image || null);

  return {
    title,
    description,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title,
      description,
      url,
      type: isBlog ? "article" : "website",
      images: [
        {
          url: image,
          alt: title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
  };
}

export function buildArticleSchema(record, type) {
  if (!record) return null;

  const isBlog = type === "blog";
  const title = record.seo_title || getContentTitle(record, type);
  const description =
    record.seo_description ||
    getExcerpt(isBlog ? record.content || "" : record.answer || record.content || record.question || "", 160);
  const url = toAbsoluteUrl(
    isBlog
      ? `/blog-details/${record.id}--${record.slug || ""}`.replace(/-$/, "")
      : `/fatwa/${record.id}--${record.slug || ""}`.replace(/-$/, ""),
  );
  const image = resolveSeoImage(record.image_url || record.cover_image || null);

  return {
    "@context": "https://schema.org",
    "@type": isBlog ? "Article" : "QAPage",
    headline: title,
    description,
    image,
    url,
    datePublished: record.created_at || undefined,
    dateModified: record.updated_at || record.created_at || undefined,
    author: {
      "@type": "Person",
      name: getAuthorName(record, isBlog ? "IRWAA Editorial Team" : "IRWAA Scholar"),
    },
    about: getContentCategory(record),
    publisher: {
      "@type": "Organization",
      name: "IRWAA",
      logo: {
        "@type": "ImageObject",
        url: toAbsoluteUrl(defaultImagePath),
      },
    },
    ...(isBlog
      ? {}
      : {
          mainEntity: {
            "@type": "Question",
            name: record.question || title,
            acceptedAnswer: {
              "@type": "Answer",
              text: getExcerpt(record.answer || record.content || "", 4000),
            },
          },
        }),
  };
}
