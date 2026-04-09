import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "aos/dist/aos.css";
import "react-quill/dist/quill.snow.css";
import "./globals.scss";

import RouteScrollToTop from "@/helper/RouteScrollToTop";
import ColorPalate from "@/helper/ColorPalate";
import ClientProviders from "@/components/ClientProviders";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export const metadata = {
  metadataBase: new URL(siteUrl),
  title: "IRWA | Islamic Knowledge, Fatwas, E-Books, and Charity",
  description:
    "IRWA is a modern Islamic platform for beneficial articles, public fatwas, e-books, learning resources, and carefully managed charity campaigns.",
  openGraph: {
    title: "IRWA | Islamic Knowledge, Fatwas, E-Books, and Charity",
    description:
      "Explore Islamic articles, trusted fatwas, e-books, community learning, and charitable causes through IRWA.",
    url: siteUrl,
    siteName: "IRWA",
    type: "website",
  },
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className="irwa-fonts"
    >
      <head>
        {/* Font Awesome 6 CDN - replaces missing /assets/fonts/css/all.min.css */}
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css"
          integrity="sha512-DTOQO9RWCH3ppGqcWaEA1BIZOC6xxalwEsw9c2QQeAIftl+Vegovlnee1c9QX4TctnWMn13TZye+giMm8e2LwA=="
          crossOrigin="anonymous"
          referrerPolicy="no-referrer"
        />
      </head>
      <body
        suppressHydrationWarning={true}
        className="irwa-fonts"
      >
        <RouteScrollToTop />
        <ColorPalate />

        <ClientProviders>
          {children}
        </ClientProviders>
      </body>
    </html>
  );
}
