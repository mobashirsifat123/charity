import dynamic from "next/dynamic";
import BannerOne from "@/components/BannerOne";
import BlogOne from "@/components/BlogOne";
import CampaignDiscovery from "@/components/CampaignDiscovery";
import LiveDonationToast from "@/components/charity/LiveDonationToast";
import FatwaHighlights from "@/components/FatwaHighlights";
import FooterOne from "@/components/FooterOne";
import HeaderOne from "@/components/HeaderOne";
import PrayerTimesWidget from "@/components/home/PrayerTimesWidget";
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

  return (
    <section className='page-wrapper'>
      <LiveDonationToast />
      <TopBarOne />
      <HeaderOne />
      <BannerOne />
      <PrayerTimesWidget initialData={fallbackPrayerTimes} />
      <FatwaHighlights />
      <BlogOne />
      <PartnerOne />
      <DifferenceOne />
      <HelpOne />
      <CampaignDiscovery />
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
