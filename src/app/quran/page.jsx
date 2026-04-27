import FooterOne from "@/components/FooterOne";
import HeaderOne from "@/components/HeaderOne";
import QuranHubClient from "@/components/quran/QuranHubClient";
import TopBarOne from "@/components/TopBarOne";
import { fetchSurahDirectory } from "@/lib/server/quran";

export const revalidate = 86400;

export default async function QuranPage() {
  const surahs = await fetchSurahDirectory();

  return (
    <main className="page-wrapper">
      <TopBarOne />
      <HeaderOne />
      <QuranHubClient surahs={surahs} />
      <FooterOne />
    </main>
  );
}
