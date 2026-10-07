"use client";

import React from "react";
import { QueryProvider } from "./QueryProvider";
import { AuthProvider } from "@/app/Context/AuthContext";
import { MarketplaceRoleProvider } from "@/app/marketplace/context/MarketplaceRoleContext";
import ServiceWorkerCleaner from "@/app/components/ServiceWorkerCleaner";
import { Toaster } from "sonner";

interface AppProvidersProps {
  children: React.ReactNode;
}

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <QueryProvider>
      <AuthProvider>
        <MarketplaceRoleProvider>
          <ServiceWorkerCleaner />
          {children}
          <Toaster
            position="top-right"
            richColors
            closeButton
            duration={4000}
            theme="light"
            toastOptions={{
              style: {
                fontFamily: "var(--font-geist-sans), system-ui, sans-serif",
                borderRadius: "1rem",
              },
            }}
          />
        </MarketplaceRoleProvider>
      </AuthProvider>
    </QueryProvider>
  );
}

export default AppProviders;
