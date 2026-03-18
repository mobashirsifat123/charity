"use client";
import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';

const SiteSettingsContext = createContext(null);

export function SiteSettingsProvider({ children }) {
    const [settings, setSettings] = useState({
        site_name: 'IRWA',
        contact_email: 'info@irwa.org',
        contact_phone: '(+01)-793-7938',
        hero_title: 'Help the Poor, They Need You',
        hero_subtitle: 'Fundraising',
        about_title: 'We Are In A Mission To Help The Helpless',
        cta_title: 'Ready to Make a Difference?',
        cta_subtitle: 'Join thousands of donors who are already changing lives. Start your giving journey today — every donation, big or small, creates real impact.',
        team_title: 'Meet the Changemakers',
        team_subtitle: 'Dedicated professionals working tirelessly behind the scenes to maximize impact.',
        community_title: 'Together We Can Change the World',
        community_subtitle: 'Our global community of donors, volunteers, and campaign creators unites around a shared mission: making the world a better place, one act of generosity at a time.',
        blog_title: 'From Our Blog',
        blog_subtitle: 'Stay updated with stories, tips, and insights from the IRWA community.',
        footer_description: 'Connecting donors with meaningful causes. Empowering change, one donation at a time.',
        social_facebook: 'https://www.facebook.com/',
        social_twitter: 'https://x.com/',
        social_instagram: 'https://www.instagram.com/'
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const { data, error } = await supabase.from('site_settings').select('*');
                if (error) throw error;
                
                if (data && data.length > 0) {
                    const settingsObj = {};
                    data.forEach(item => {
                        try {
                             settingsObj[item.setting_key] = JSON.parse(item.setting_value);
                        } catch(e) {
                             settingsObj[item.setting_key] = item.setting_value.replace(/^"|"$/g, '');
                        }
                    });
                    setSettings(prev => ({ ...prev, ...settingsObj }));
                }
            } catch (error) {
                console.error("Failed to load global site settings:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchSettings();
    }, []);

    return (
        <SiteSettingsContext.Provider value={{ settings, loading }}>
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
