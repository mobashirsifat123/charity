"use client";

import Link from 'next/link';
import SiteSettingsEditor from '@/components/admin/SiteSettingsEditor';
import { GLOBAL_SETTINGS_SECTION_IDS } from '@/lib/siteSettings';

export default function SiteSettingsPage() {
    return (
        <div className="d-flex flex-column gap-4">
            <div className="card border-0 shadow-sm rounded-4">
                <div className="card-body p-4">
                    <h2 className="fw-bold mb-2">Brand & Contact Settings</h2>
                    <p className="text-muted mb-3">
                        Update the organization identity, footer details, and social links used across the public site.
                    </p>
                    <div className="d-flex flex-wrap gap-2">
                        <Link href="/admin/content" className="btn btn-outline-primary rounded-pill">
                            Open Site Builder
                        </Link>
                        <Link href="/admin/images" className="btn btn-outline-secondary rounded-pill">
                            Manage Images
                        </Link>
                    </div>
                </div>
            </div>

            <SiteSettingsEditor
                pageTitle="Global Settings"
                pageDescription="Control the brand, contact details, footer content, and social presence that appear throughout the site."
                sectionIds={GLOBAL_SETTINGS_SECTION_IDS}
            />
        </div>
    );
}
