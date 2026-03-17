"use client";
import BannerOne from "@/components/BannerOne";
import BlogOne from "@/components/BlogOne";
import CampaignDiscovery from "@/components/CampaignDiscovery";
import CauseSliderTwo from "@/components/CauseSliderTwo";
import CommunityOne from "@/components/CommunityOne";
import CtaSectionOne from "@/components/CtaSectionOne";
import DifferenceOne from "@/components/DifferenceOne";
import DifferenceTwo from "@/components/DifferenceTwo";
import FooterOne from "@/components/FooterOne";
import HeaderOne from "@/components/HeaderOne";
import HelpOne from "@/components/HelpOne";
import PartnerOne from "@/components/PartnerOne";
import Preloader from "@/components/Preloader";
import TeamOne from "@/components/TeamOne";
import TestimonialOne from "@/components/TestimonialOne";
import TopBarOne from "@/components/TopBarOne";
import AOSWrap from "@/helper/AOSWrap";
import CustomCursor from "@/helper/CustomCursor";

const Page = () => {
  return (
    <AOSWrap>
      <section className='page-wrapper'>
        {/* Preloader */}
        <Preloader />

        {/* CustomCursor  */}
        <CustomCursor />

        {/* TopBarOne */}
        <TopBarOne />

        {/* HeaderOne */}
        <HeaderOne />

        {/* BannerOne */}
        <BannerOne />

        {/* PartnerOne */}
        <PartnerOne />

        {/* DifferenceOne */}
        <DifferenceOne />

        {/* HelpOne */}
        <HelpOne />

        {/* CampaignDiscovery - Dynamic with Search/Filter/Pagination */}
        <CampaignDiscovery />

        {/* CtaSectionOne */}
        <CtaSectionOne />

        {/* TeamOne */}
        <TeamOne />

        {/* CommunityOne */}
        <CommunityOne />

        {/* TestimonialOne */}
        <TestimonialOne />

        {/* CauseSliderTwo */}
        <CauseSliderTwo />

        {/* DifferenceTwo */}
        <DifferenceTwo />

        {/* BlogOne */}
        <BlogOne />

        {/* FooterOne */}
        <FooterOne />
      </section>
    </AOSWrap>
  );
};

export default Page;

