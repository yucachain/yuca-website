"use client";

import React from "react";
import { QueryProvider } from "./QueryProvider";
import { AuthProvider } from "@/app/Context/AuthContext";
import { MarketplaceRoleProvider } from "@/app/marketplace/context/MarketplaceRoleContext";
import ServiceWorkerCleaner from "@/app/components/ServiceWorkerCleaner";

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
        </MarketplaceRoleProvider>
      </AuthProvider>
    </QueryProvider>
  );
}

export default AppProviders;
