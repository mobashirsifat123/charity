export default function manifest() {
  return {
    name: "IRWAA",
    short_name: "IRWAA",
    description: "Islamic knowledge, Quran learning, fatwas, e-books, and community benefit.",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#0b3d2e",
    icons: [
      {
        src: "/branding/irwaa-logo.avif",
        sizes: "512x512",
        type: "image/avif",
      },
    ],
  };
}
