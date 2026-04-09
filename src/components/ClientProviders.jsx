"use client";
import { AuthProvider } from "@/context/AuthContext";
import { AudioPlayerProvider } from "@/context/AudioPlayerContext";
import { LanguageProvider } from "@/context/LanguageContext";
import { ReadabilityProvider } from "@/context/ReadabilityContext";
import { SiteSettingsProvider } from "@/context/SiteSettingsContext";
import InitializeAOS from "@/helper/InitializeAOS";

export default function ClientProviders({ children }) {
    return (
        <LanguageProvider>
            <AudioPlayerProvider>
                <ReadabilityProvider>
                    <SiteSettingsProvider>
                        <AuthProvider>
                            <InitializeAOS />
                            {children}
                        </AuthProvider>
                    </SiteSettingsProvider>
                </ReadabilityProvider>
            </AudioPlayerProvider>
        </LanguageProvider>
    );
}
