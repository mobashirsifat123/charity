import dynamic from "next/dynamic";
import BannerOne from "@/components/BannerOne";
import BlogOne from "@/components/BlogOne";
import CampaignDiscovery from "@/components/CampaignDiscovery";
import LiveDonationToast from "@/components/charity/LiveDonationToast";
import FatwaHighlights from "@/components/FatwaHighlights";
import FooterOne from "@/components/FooterOne";
import HeaderOne from "@/components/HeaderOne";
import HadithExplorer from "@/components/HadithExplorer";
import PrayerTimesWidget from "@/components/home/PrayerTimesWidget";
import MobileHomeDashboard from "@/components/mobile/MobileHomeDashboard";
import {
  fetchPublishedBlogs,
  fetchPublishedFatwas,
  fetchPublishedCampaigns,
} from "@/lib/content-data";
import QuranLearningShowcase from "@/components/QuranLearningShowcase";
import TopBarOne from "@/components/TopBarOne";
import { getFallbackPrayerTimes } from "@/lib/server/prayer-times";

const PartnerOne = dynamic(() => import("@/components/PartnerOne"));
const DifferenceOne = dynamic(() => import("@/components/DifferenceOne"));
const HelpOne = dynamic(() => import("@/components/HelpOne"));
const CtaSectionOne = dynamic(() => import("@/components/CtaSectionOne"));
const TeamOne = dynamic(() => import("@/components/TeamOne"));
const CommunityOne = dynamic(() => import("@/components/CommunityOne"));
const TestimonialOne = dynamic(() => import("@/components/TestimonialOne"));
const DifferenceTwo = dynamic(() => import("@/components/DifferenceTwo"));

const Page = async () => {
  const fallbackPrayerTimes = await getFallbackPrayerTimes();
  let initialBlogs = null;
  let initialFatwas = null;
  let initialCampaigns = null;

  try {
    initialBlogs = await fetchPublishedBlogs(3);
  } catch (err) {
    console.error("Failed to fetch initial blogs", err);
  }

  try {
    initialFatwas = await fetchPublishedFatwas(3);
  } catch (err) {
    console.error("Failed to fetch initial fatwas", err);
  }

  try {
    initialCampaigns = await fetchPublishedCampaigns(6);
  } catch (err) {
    console.error("Failed to fetch initial campaigns", err);
  }

  return (
    <section className="page-wrapper">
      <LiveDonationToast />
      <TopBarOne />
      <HeaderOne />
      <MobileHomeDashboard
        articles={initialBlogs || []}
        fatwas={initialFatwas || []}
        prayerData={fallbackPrayerTimes}
      />
      <BannerOne />
      <HadithExplorer />
      <PrayerTimesWidget initialData={fallbackPrayerTimes} />
      <FatwaHighlights initialFatwas={initialFatwas} />
      <BlogOne initialBlogs={initialBlogs} />
      <PartnerOne />
      <DifferenceOne />
      <HelpOne />
      <CampaignDiscovery initialCampaigns={initialCampaigns} />
      <CtaSectionOne />
      <TeamOne />
      <CommunityOne />
      <TestimonialOne />
      <QuranLearningShowcase />
      <DifferenceTwo />
      <FooterOne />
    </section>
  );
};

export default Page;
