"use client";

import React from "react";
import { QueryProvider } from "./QueryProvider";
import { AuthProvider } from "@/app/Context/AuthContext";

interface AppProvidersProps {
  children: React.ReactNode;
}

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <QueryProvider>
      <AuthProvider>
        {children}
      </AuthProvider>
    </QueryProvider>
  );
}

export default AppProviders;
