const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://irwaa.com";

const STATIC_ROUTES = [
  "",
  "/about-us",
  "/blog-grid",
  "/fatwa",
  "/ebooks",
  "/courses",
  "/faq",
  "/impact",
  "/zakat",
];

export default function sitemap() {
  const now = new Date();

  return STATIC_ROUTES.map((path) => ({
    url: `${siteUrl}${path}`,
    lastModified: now,
    changeFrequency: path === "" ? "daily" : "weekly",
    priority: path === "" ? 1 : 0.75,
  }));
}
