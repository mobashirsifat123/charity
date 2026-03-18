"use client";
import { useEffect } from "react";
import { AuthProvider } from "@/context/AuthContext";
import { SiteSettingsProvider } from "@/context/SiteSettingsContext";
import InitializeAOS from "@/helper/InitializeAOS";

export default function ClientProviders({ children }) {
    useEffect(() => {
        import("bootstrap/dist/js/bootstrap.bundle.min.js");
    }, []);

    return (
        <SiteSettingsProvider>
            <AuthProvider>
                <InitializeAOS />
                {children}
            </AuthProvider>
        </SiteSettingsProvider>
    );
}
