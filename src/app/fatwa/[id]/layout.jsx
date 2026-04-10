import { fetchFatwaByIdentifier } from "@/lib/content-data";
import { buildArticleMetadata, buildArticleSchema } from "@/lib/seo";

export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  const fatwa = await fetchFatwaByIdentifier(resolvedParams?.id);
  return buildArticleMetadata(fatwa, "fatwa");
}

export default async function FatwaDetailsLayout({ children, params }) {
  const resolvedParams = await params;
  const fatwa = await fetchFatwaByIdentifier(resolvedParams?.id);
  const schema = buildArticleSchema(fatwa, "fatwa");

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
