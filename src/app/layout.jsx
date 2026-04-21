import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "aos/dist/aos.css";
import "./globals.scss";

import RouteScrollToTop from "@/helper/RouteScrollToTop";
import ColorPalate from "@/helper/ColorPalate";
import ClientProviders from "@/components/ClientProviders";
import { Toaster } from "react-hot-toast";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://irwaa.com";
const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "IRWAA",
  url: siteUrl,
  logo: `${siteUrl}/branding/irwaa-logo.avif`,
  sameAs: [
    "https://www.facebook.com/",
    "https://www.instagram.com/",
    "https://www.linkedin.com/",
    "https://x.com/",
  ],
};

const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "IRWAA",
  url: siteUrl,
  potentialAction: {
    "@type": "SearchAction",
    target: `${siteUrl}/search?q={search_term_string}`,
    "query-input": "required name=search_term_string",
  },
};

export const metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "IRWAA | Islamic Knowledge, Quran Learning, Fatwas, and E-Books",
    template: "%s | IRWAA",
  },
  description:
    "IRWAA is an Islamic platform for Quran learning, beneficial articles, trusted fatwas, e-books, and charitable support.",
  keywords: [
    "Islamic articles",
    "Islamic fatwas",
    "Quran learning",
    "Islamic e-books",
    "Islamic education platform",
    "IRWAA",
  ],
  alternates: {
    canonical: "/",
  },
  category: "education",
  openGraph: {
    title: "IRWAA | Islamic Knowledge, Quran Learning, Fatwas, and E-Books",
    description:
      "Explore Quran learning, Islamic articles, trusted fatwas, e-books, and community learning through IRWAA.",
    url: siteUrl,
    siteName: "IRWAA",
    type: "website",
    locale: "en_US",
    images: [
      {
        url: `${siteUrl}/branding/irwaa-logo.avif`,
        width: 1200,
        height: 630,
        alt: "IRWAA logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "IRWAA | Islamic Knowledge, Quran Learning, Fatwas, and E-Books",
    description:
      "Explore Quran learning, Islamic articles, trusted fatwas, e-books, and community learning through IRWAA.",
    images: [`${siteUrl}/branding/irwaa-logo.avif`],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" data-scroll-behavior="smooth" className="irwa-fonts">
      <head>
        {/* Font Awesome 6 CDN - replaces missing /assets/fonts/css/all.min.css */}
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css"
          integrity="sha512-DTOQO9RWCH3ppGqcWaEA1BIZOC6xxalwEsw9c2QQeAIftl+Vegovlnee1c9QX4TctnWMn13TZye+giMm8e2LwA=="
          crossOrigin="anonymous"
          referrerPolicy="no-referrer"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationSchema),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
        />
      </head>
      <body suppressHydrationWarning={true} className="irwa-fonts">
        <RouteScrollToTop />
        <ColorPalate />

        <Toaster
          position="bottom-right"
          toastOptions={{
            duration: 4000,
            style: { background: "#333", color: "#fff" },
          }}
        />
        <ClientProviders>{children}</ClientProviders>
      </body>
    </html>
  );
}
