"use client";
import { AuthProvider } from "@/context/AuthContext";
import { AudioPlayerProvider } from "@/context/AudioPlayerContext";
import { LanguageProvider } from "@/context/LanguageContext";
import { PersonalizationProvider } from "@/context/PersonalizationContext";
import { ReadabilityProvider } from "@/context/ReadabilityContext";
import { SiteSettingsProvider } from "@/context/SiteSettingsContext";
import InitializeAOS from "@/helper/InitializeAOS";
import PageLanguageTranslator from "@/components/PageLanguageTranslator";

export default function ClientProviders({ children }) {
  return (
    <LanguageProvider>
      <AudioPlayerProvider>
        <ReadabilityProvider>
          <SiteSettingsProvider>
            <AuthProvider>
              <PersonalizationProvider>
                <InitializeAOS />
                <PageLanguageTranslator />
                {children}
              </PersonalizationProvider>
            </AuthProvider>
          </SiteSettingsProvider>
        </ReadabilityProvider>
      </AudioPlayerProvider>
    </LanguageProvider>
  );
}
