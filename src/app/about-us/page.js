"use client";
import Link from "next/link";
import HeaderOne from "@/components/HeaderOne";
import FooterOne from "@/components/FooterOne";
import BreadcrumbOne from "@/components/BreadcrumbOne";
import { useSiteSettings } from "@/context/SiteSettingsContext";

export default function AboutPage() {
  const { settings } = useSiteSettings();

  return (
    <section className="page-wrapper">
      <HeaderOne />
      <BreadcrumbOne
        title="About Us"
        links={[
          { name: "Home", link: "/" },
          { name: "About Us", link: "/about-us" },
        ]}
      />
      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-lg-9">
            <div className="card border-0 shadow-sm rounded-4">
              <div className="card-body p-4 p-md-5">
                <h2 className="fw-bold mb-4">{settings.about_page_heading || "About IRWA"}</h2>
                <p className="text-muted mb-3">
                  {settings.about_page_paragraph_1 || "IRWA combines beneficial Islamic knowledge, trusted guidance, and community support in one platform."}
                </p>
                <p className="text-muted mb-3">
                  {settings.about_page_paragraph_2 || "We publish articles and fatwas to serve the dawah mission, while also supporting meaningful causes that help people on the ground."}
                </p>
                <p className="text-muted mb-4">
                  {settings.about_page_paragraph_3 || "Explore our latest articles, browse fatwas, or support an active cause through the resources below."}
                </p>
                <div className="d-flex flex-wrap gap-3">
                  <Link href="/blog-grid" className="btn btn-outline-primary rounded-pill px-4">Articles</Link>
                  <Link href="/fatwa" className="btn btn-outline-primary rounded-pill px-4">Fatwas</Link>
                  <Link href="/#campaigns" className="btn btn-primary rounded-pill px-4">Support a Cause</Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <FooterOne />
    </section>
  );
}
