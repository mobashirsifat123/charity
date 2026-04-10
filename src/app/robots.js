const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://irwaa.com";

export default function robots() {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/admin/",
          "/dashboard",
          "/login",
          "/register",
          "/reset-password",
          "/request-fatwa",
          "/api/",
        ],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  };
}
