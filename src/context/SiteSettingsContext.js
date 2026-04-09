"use client";
import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { DEFAULT_SITE_SETTINGS, mergeSiteSettings } from '@/lib/siteSettings';
import { useLanguage } from '@/context/LanguageContext';
import { localizeSiteSettings } from '@/lib/i18n';

const SiteSettingsContext = createContext(null);
const SITE_SETTINGS_CACHE_KEY = 'irwa-site-settings-cache-v1';

const readCachedSiteSettings = () => {
    if (typeof window === 'undefined') return null;

    try {
        const raw = window.localStorage.getItem(SITE_SETTINGS_CACHE_KEY);
        if (!raw) return null;

        const parsed = JSON.parse(raw);
        if (!Array.isArray(parsed?.data)) return null;

        return parsed.data;
    } catch (error) {
        console.error('Failed to read cached site settings:', error);
        return null;
    }
};

const writeCachedSiteSettings = (data) => {
    if (typeof window === 'undefined') return;

    try {
        window.localStorage.setItem(
            SITE_SETTINGS_CACHE_KEY,
            JSON.stringify({
                savedAt: Date.now(),
                data,
            })
        );
    } catch (error) {
        console.error('Failed to cache site settings:', error);
    }
};

export function SiteSettingsProvider({ children }) {
    const [rawSettings, setRawSettings] = useState(DEFAULT_SITE_SETTINGS);
    const [loading, setLoading] = useState(true);
    const { locale } = useLanguage();

    const refreshSettings = useCallback(async ({ background = false } = {}) => {
        if (!background) {
            setLoading(true);
        }

        try {
            const { data, error } = await supabase.from('site_settings').select('*');
            if (error) throw error;

            const nextData = data || [];
            setRawSettings(mergeSiteSettings(nextData));
            writeCachedSiteSettings(nextData);
        } catch (error) {
            console.error("Failed to load global site settings:", error);
            if (!background) {
                setRawSettings(DEFAULT_SITE_SETTINGS);
            }
        } finally {
            if (!background) {
                setLoading(false);
            }
        }
    }, []);

    useEffect(() => {
        const cachedSettings = readCachedSiteSettings();

        if (cachedSettings) {
            setRawSettings(mergeSiteSettings(cachedSettings));
            setLoading(false);
            refreshSettings({ background: true });
            return;
        }

        refreshSettings();
    }, [refreshSettings]);

    const settings = useMemo(
        () => localizeSiteSettings(rawSettings, locale),
        [rawSettings, locale]
    );

    return (
        <SiteSettingsContext.Provider value={{ settings, rawSettings, loading, refreshSettings }}>
            {children}
        </SiteSettingsContext.Provider>
    );
}

export function useSiteSettings() {
    const context = useContext(SiteSettingsContext);
    if (!context) {
        throw new Error('useSiteSettings must be used within a SiteSettingsProvider');
    }
    return context;
}
