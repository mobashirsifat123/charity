import { notFound } from "next/navigation";
import FooterOne from "@/components/FooterOne";
import HeaderOne from "@/components/HeaderOne";
import TafseerReaderClient from "@/components/quran/TafseerReaderClient";
import TopBarOne from "@/components/TopBarOne";
import { getSurahById } from "@/lib/quran/surah-data";
import { fetchTafseerContent } from "@/lib/server/quran";

export const revalidate = 600;

export async function generateMetadata({ params }) {
  const { surahId, sectionSlug } = await params;
  const surah = getSurahById(surahId);

  if (!surah) {
    return {
      title: "Quran Tafseer",
    };
  }

  return {
    title: `${surah.name} Tafseer`,
    description: `Read Tafseer for ${surah.name}, section ${sectionSlug}, on IRWAA.`,
    alternates: {
      canonical: `/quran/tafseer/${surah.number}/${sectionSlug}`,
    },
  };
}

export default async function TafseerDetailPage({ params }) {
  const { surahId, sectionSlug } = await params;
  const tafseer = await fetchTafseerContent({ surahId, sectionSlug });

  if (!tafseer) notFound();

  return (
    <main className="page-wrapper">
      <TopBarOne />
      <HeaderOne />
      <TafseerReaderClient tafseer={tafseer} />
      <FooterOne />
    </main>
  );
}
