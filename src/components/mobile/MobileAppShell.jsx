"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { useSiteSettings } from "@/context/SiteSettingsContext";
import GlobalSiteDrawer from "@/components/GlobalSiteDrawer";
import MobileBottomNav from "@/components/mobile/MobileBottomNav";
import MobileTopBar from "@/components/mobile/MobileTopBar";

export default function MobileAppShell() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { user, loading } = useAuth();
  const { t } = useLanguage();
  const { settings } = useSiteSettings();

  const labels = {
    home: t("home", "Home"),
    quran: settings.nav_quran_label || "Quran",
    search: settings.nav_search_label || t("search", "Search"),
    articles: settings.nav_articles_label || t("articles", "Articles"),
    profile: t("profile", "Profile"),
  };

  return (
    <div className="mobile-app-shell d-md-none">
      <MobileTopBar
        settings={settings}
        user={user}
        loading={loading}
        onMenuOpen={() => setDrawerOpen(true)}
      />
      <MobileBottomNav user={user} loading={loading} labels={labels} />
      <GlobalSiteDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      />
    </div>
  );
}
