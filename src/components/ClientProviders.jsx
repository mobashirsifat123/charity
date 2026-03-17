"use client";
import { AuthProvider } from "@/context/AuthContext";
import { SiteSettingsProvider } from "@/context/SiteSettingsContext";

export default function ClientProviders({ children }) {
    return (
        <SiteSettingsProvider>
            <AuthProvider>
                {children}
            </AuthProvider>
        </SiteSettingsProvider>
    );
}
