import FooterOne from "@/components/FooterOne";
import HeaderOne from "@/components/HeaderOne";
import TafseerDirectoryClient from "@/components/quran/TafseerDirectoryClient";
import TopBarOne from "@/components/TopBarOne";
import { fetchSurahDirectory } from "@/lib/server/quran";

export const metadata = {
  title: "Tafseer of Quran",
  description:
    "Browse Surah introductions and ayah-range Tafseer managed by IRWAA scholars and admins.",
  alternates: {
    canonical: "/quran/tafseer",
  },
};

export const revalidate = 21600;

export default async function TafseerPage() {
  const surahs = await fetchSurahDirectory();

  return (
    <main className="page-wrapper">
      <TopBarOne />
      <HeaderOne />
      <TafseerDirectoryClient surahs={surahs} />
      <FooterOne />
    </main>
  );
}
