import { notFound } from "next/navigation";
import FooterOne from "@/components/FooterOne";
import HeaderOne from "@/components/HeaderOne";
import QuranReaderClient from "@/components/quran/QuranReaderClient";
import TopBarOne from "@/components/TopBarOne";
import {
  getNextSurah,
  getPreviousSurah,
  getSurahById,
} from "@/lib/quran/surah-data";
import { fetchSurahReading } from "@/lib/server/quran";

export const revalidate = 604800;

export async function generateMetadata({ params }) {
  const { surahId } = await params;
  const surah = getSurahById(surahId);

  if (!surah) {
    return {
      title: "Quran Surah",
    };
  }

  return {
    title: `${surah.name} Quran Reading`,
    description: `Read ${surah.name}, ${surah.englishName}, with Arabic text, translation, and recitation on IRWAA.`,
    alternates: {
      canonical: `/quran/${surah.number}`,
    },
  };
}

export default async function QuranSurahPage({ params }) {
  const { surahId } = await params;
  const surah = await fetchSurahReading(surahId);

  if (!surah) notFound();

  return (
    <main className="page-wrapper">
      <TopBarOne />
      <HeaderOne />
      <QuranReaderClient
        surah={surah}
        previousSurah={getPreviousSurah(surah.number)}
        nextSurah={getNextSurah(surah.number)}
      />
      <FooterOne />
    </main>
  );
}
