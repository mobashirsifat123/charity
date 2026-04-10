import { fetchBlogByIdentifier } from "@/lib/content-data";
import { buildArticleMetadata, buildArticleSchema } from "@/lib/seo";

export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  const article = await fetchBlogByIdentifier(resolvedParams?.id);
  return buildArticleMetadata(article, "blog");
}

export default async function BlogDetailsLayout({ children, params }) {
  const resolvedParams = await params;
  const article = await fetchBlogByIdentifier(resolvedParams?.id);
  const schema = buildArticleSchema(article, "blog");

  return (
    <>
      {schema ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ) : null}
      {children}
    </>
  );
}
