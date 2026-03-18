"use client";
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { DEFAULT_SITE_SETTINGS, mergeSiteSettings } from '@/lib/siteSettings';

const SiteSettingsContext = createContext(null);

export function SiteSettingsProvider({ children }) {
    const [settings, setSettings] = useState(DEFAULT_SITE_SETTINGS);
    const [loading, setLoading] = useState(true);

    const refreshSettings = useCallback(async () => {
        setLoading(true);

        try {
            const { data, error } = await supabase.from('site_settings').select('*');
            if (error) throw error;

            setSettings(mergeSiteSettings(data || []));
        } catch (error) {
            console.error("Failed to load global site settings:", error);
            setSettings(DEFAULT_SITE_SETTINGS);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        refreshSettings();
    }, [refreshSettings]);

    return (
        <SiteSettingsContext.Provider value={{ settings, loading, refreshSettings }}>
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
