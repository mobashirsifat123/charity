"use client";
import { useState } from "react";
import HeaderOne from "@/components/HeaderOne";
import FooterOne from "@/components/FooterOne";
import BreadcrumbOne from "@/components/BreadcrumbOne";
import { useSiteSettings } from "@/context/SiteSettingsContext";

export default function FAQPage() {
  const { settings } = useSiteSettings();
  const [openIndex, setOpenIndex] = useState(0);
  const faqs = [
    {
      question: settings.faq_1_question || "How do donations work on IRWA?",
      answer: settings.faq_1_answer || "Donations are processed securely through Stripe. Completed payments are verified after checkout and recorded for your dashboard.",
    },
    {
      question: settings.faq_2_question || "Can I read articles and fatwas without an account?",
      answer: settings.faq_2_answer || "Yes. Public articles and fatwas are available without signing in. An account is only needed for donation and dashboard features.",
    },
    {
      question: settings.faq_3_question || "How can I contact the IRWA team?",
      answer: settings.faq_3_answer || "Use the contact page for direct contact details and email information.",
    },
  ];

  return (
    <section className="page-wrapper">
      <HeaderOne />
      <BreadcrumbOne
        title="FAQ"
        links={[
          { name: "Home", link: "/" },
          { name: "FAQ", link: "/faq" },
        ]}
      />
      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-lg-8">
            {faqs.map((item, index) => (
              <div key={item.question} className="card border-0 shadow-sm rounded-4 mb-3">
                <div className="card-body p-0">
                  <button
                    type="button"
                    className="btn w-100 text-start p-4 border-0"
                    onClick={() => setOpenIndex(openIndex === index ? -1 : index)}
                  >
                    <span className="fw-bold">{item.question}</span>
                  </button>
                  {openIndex === index ? (
                    <div className="px-4 pb-4 text-muted">{item.answer}</div>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <FooterOne />
    </section>
  );
}
