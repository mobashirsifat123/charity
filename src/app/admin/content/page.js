"use client";
import SiteSettingsEditor from '@/components/admin/SiteSettingsEditor';
import { SITE_BUILDER_SECTION_IDS } from '@/lib/siteSettings';

export default function SiteContent() {
    return (
        <SiteSettingsEditor
            pageTitle="Site Builder"
            pageDescription="Edit the homepage sections, static pages, calls to action, and supporting copy that shape the public site."
            sectionIds={SITE_BUILDER_SECTION_IDS}
        />
    );
}
