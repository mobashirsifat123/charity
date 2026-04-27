"use client";
import Link from "next/link";
import KnowledgeSearchBar from "@/components/KnowledgeSearchBar";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { useLanguage } from "@/context/LanguageContext";
import { useSiteSettings } from "@/context/SiteSettingsContext";

const BannerOne = () => {
  const { t } = useLanguage();
  const { settings } = useSiteSettings();
  const stats = [
    {
      value: settings.hero_stat_1_value || "New",
      label: settings.hero_stat_1_label || "Fatwas & Guidance",
    },
    {
      value: settings.hero_stat_2_value || "Weekly",
      label: settings.hero_stat_2_label || "Articles & Reminders",
    },
    {
      value: settings.hero_stat_3_value || "Active",
      label: settings.hero_stat_3_label || "Community Causes",
    },
  ];
  const systemPills = [
    {
      label: settings.hero_pill_1 || "Quran Learning",
      tone: "signal-chip__dot--green",
    },
    { label: settings.hero_pill_2 || "Fatwas & Guidance", tone: "" },
    {
      label: settings.hero_pill_3 || "Courses & Articles",
      tone: "signal-chip__dot--soft",
    },
    {
      label: settings.hero_pill_4 || "Charity With Impact",
      tone: "signal-chip__dot--green",
    },
  ];
  const cards = [
    {
      icon: "fa-book-open",
      title: settings.hero_card_1_title || "Articles",
      color: "var(--primary-color)",
      meta: settings.hero_card_1_meta || "Reflections & learning",
      href: "/blog-grid",
    },
    {
      icon: "fa-scale-balanced",
      title: settings.hero_card_2_title || "Fatwas",
      color: "var(--accent-color)",
      meta: settings.hero_card_2_meta || "Trusted answers",
      href: "/fatwa",
    },
    {
      icon: "fa-book-quran",
      title: settings.hero_card_3_title || "Quran Topics",
      color: "var(--secondary-color)",
      meta: settings.hero_card_3_meta || "Learn and reflect",
      href: "/quran",
    },
    {
      icon: "fa-graduation-cap",
      title: settings.hero_card_4_title || "Courses",
      color: "var(--accent-color)",
      meta: settings.hero_card_4_meta || "Structured learning",
      href: "/courses",
    },
    {
      icon: "fa-book",
      title: settings.hero_card_5_title || "E-Books",
      color: "var(--primary-color)",
      meta: settings.hero_card_5_meta || "Readable library",
      href: "/ebooks",
    },
    {
      icon: "fa-magnifying-glass",
      title: settings.hero_card_6_title || "Search",
      color: "var(--secondary-color)",
      meta: settings.hero_card_6_meta || "Find answers fast",
      href: "/search",
    },
  ];

  return (
    <section
      className="banner aurora-grid mobile-first-hero"
      style={{
        background: settings.hero_bg_image
          ? `linear-gradient(rgba(8, 35, 26, 0.72), rgba(8, 35, 26, 0.72)), url(${settings.hero_bg_image}) center/cover no-repeat`
          : "linear-gradient(135deg, #07261d 0%, #0b3d2e 52%, #145a32 100%)",
        minHeight: "78vh",
        display: "flex",
        alignItems: "center",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Decorative circles */}
      <div
        style={{
          position: "absolute",
          top: "10%",
          right: "8%",
          width: 320,
          height: 320,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(200,169,81,0.18) 0%, rgba(200,169,81,0) 68%)",
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: "5%",
          left: "4%",
          width: 260,
          height: 260,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0) 72%)",
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: "12% 10% auto auto",
          width: 180,
          height: 180,
          borderRadius: "50%",
          border: "1px solid rgba(255,255,255,0.08)",
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: "auto auto 14% 8%",
          width: 140,
          height: 140,
          borderRadius: "50%",
          border: "1px solid rgba(255,255,255,0.06)",
          pointerEvents: "none",
        }}
      />

      <div className="container" style={{ position: "relative", zIndex: 1 }}>
        <div className="row align-items-center gy-5">
          <div className="col-lg-6" data-aos="fade-right">
            <span
              className="badge mb-3 px-3 py-2 rounded-pill fw-semibold"
              style={{
                background: "rgba(200, 169, 81, 0.18)",
                color: "#f7e5ae",
                border: "1px solid rgba(200, 169, 81, 0.25)",
              }}
            >
              {settings.hero_subtitle ||
                "IRWAA: Knowledge, Guidance, and Community"}
            </span>
            <div className="mb-4 hero-language-picker">
              <div className="small text-uppercase fw-semibold mb-2 hero-language-picker__label">
                {t("language", "Language")}
              </div>
              <LanguageSwitcher className="hero-language-switcher" />
            </div>
            <h1
              className="text-white fw-bold mb-4"
              style={{ fontSize: "clamp(2rem, 5vw, 3.5rem)", lineHeight: 1.2 }}
            >
              {settings.hero_title ||
                "Knowledge That Guides, Causes That Matter"}
            </h1>
            <p
              className="text-white mb-4"
              style={{ fontSize: "1.1rem", maxWidth: 520, opacity: 0.82 }}
            >
              {settings.hero_description ||
                "Build a stronger Muslim community through beneficial articles, trusted fatwas, and causes that turn faith into action."}
            </p>

            <KnowledgeSearchBar
              className="mb-4 hero-main-search"
              variant="hero"
              placeholder={
                settings.hero_search_placeholder ||
                "Search articles, fatwas, Quran topics..."
              }
            />

            <div className="d-flex flex-wrap gap-3 hero-cta-group">
              <Link
                href={settings.hero_primary_cta_link || "/fatwa"}
                className="btn btn-warning btn-lg fw-bold px-5 rounded-pill btn-ripple"
              >
                {settings.hero_primary_cta_text || "Explore Fatwas"}{" "}
                <i className="fa-solid fa-arrow-right ms-2" />
              </Link>
              <Link
                href={settings.hero_secondary_cta_link || "/blog-grid"}
                className="btn btn-outline-light btn-lg px-5 rounded-pill btn-ripple"
              >
                {settings.hero_secondary_cta_text || "Read Articles"}
              </Link>
            </div>

            <div className="d-flex flex-wrap gap-3 mt-4">
              <Link
                href={settings.hero_support_cta_link || "/quran"}
                className="text-white text-decoration-none fw-semibold"
              >
                {settings.hero_support_cta_text || "Learn Quran"}{" "}
                <i className="fa-solid fa-arrow-right ms-2" />
              </Link>
            </div>

            <div className="d-flex flex-wrap gap-2 mt-4 d-none d-lg-flex">
              {systemPills.map((pill) => (
                <div key={pill.label} className="signal-chip">
                  <span className={`signal-chip__dot ${pill.tone}`}></span>
                  <span>{pill.label}</span>
                </div>
              ))}
            </div>

            <div className="hero-quick-grid d-grid d-lg-none mt-4">
              {cards.map((card) => (
                <Link
                  key={card.title}
                  href={card.href}
                  className="hero-quick-card text-decoration-none"
                >
                  <span className="hero-quick-card__icon">
                    <i
                      className={`fa-solid ${card.icon}`}
                      style={{ color: card.color }}
                    />
                  </span>
                  <span className="hero-quick-card__title">{card.title}</span>
                  <span className="hero-quick-card__meta">{card.meta}</span>
                </Link>
              ))}
            </div>

            <div className="row mt-4 mt-lg-5 gy-3 hero-stats-row">
              {stats.map((stat) => (
                <div key={stat.label} className="col-4">
                  <h3
                    className="fw-bold mb-0"
                    style={{ color: "var(--accent-color)" }}
                  >
                    {stat.value}
                  </h3>
                  <small className="text-white" style={{ opacity: 0.64 }}>
                    {stat.label}
                  </small>
                </div>
              ))}
            </div>
          </div>

          <div className="col-lg-6 d-none d-lg-block" data-aos="fade-left">
            <div className="glass-surface workflow-panel p-4 p-xl-5">
              <div className="d-flex align-items-center justify-content-between gap-3 mb-4">
                <div>
                  <div
                    className="text-uppercase small fw-semibold mb-2"
                    style={{
                      color: "rgba(255,255,255,0.62)",
                      letterSpacing: "0.12em",
                    }}
                  >
                    {t("guidedExperience", "Guided Experience")}
                  </div>
                  <h5 className="text-white fw-bold mb-0">
                    {t(
                      "heroWorkflowTitle",
                      "A clearer path for learning, guidance, and giving",
                    )}
                  </h5>
                </div>
                <span
                  className="badge px-3 py-2 rounded-pill"
                  style={{
                    background: "rgba(255,255,255,0.08)",
                    color: "#ecf7f1",
                    border: "1px solid rgba(255,255,255,0.08)",
                  }}
                >
                  {t("livePlatform", "Live Platform")}
                </span>
              </div>

              <div className="row g-3">
                {cards.map((card) => (
                  <div key={card.title} className="col-md-6 workflow-node">
                    <div
                      className="rounded-4 p-4 hover-lift"
                      style={{
                        background: "rgba(255,255,255,0.05)",
                        border: "1px solid rgba(255,255,255,0.1)",
                      }}
                    >
                      <div className="d-flex align-items-center gap-3">
                        <div
                          className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0"
                          style={{
                            width: 56,
                            height: 56,
                            background: `color-mix(in srgb, ${card.color} 16%, white)`,
                          }}
                        >
                          <i
                            className={`fa-solid ${card.icon} fs-4`}
                            style={{ color: card.color }}
                          />
                        </div>
                        <div className="flex-grow-1">
                          <div className="d-flex justify-content-between align-items-center gap-3">
                            <h6 className="text-white fw-bold mb-1">
                              {card.title}
                            </h6>
                            <span
                              className="small"
                              style={{ color: card.color }}
                            >
                              Active
                            </span>
                          </div>
                          <Link
                            href={card.href}
                            className="small text-decoration-none"
                            style={{ color: "rgba(255,255,255,0.74)" }}
                          >
                            {card.meta}
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BannerOne;
