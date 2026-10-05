"use client";

import { useEffect } from "react";

/**
 * ServiceWorkerCleaner
 * Unregisters any active or stale Service Workers registered on localhost:3000
 * and purges stale caches, preventing "404 Not Found (from service worker)" errors.
 */
export default function ServiceWorkerCleaner() {
  useEffect(() => {
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      navigator.serviceWorker.getRegistrations().then((registrations) => {
        for (const registration of registrations) {
          registration.unregister().then((unregistered) => {
            if (unregistered) {
              console.info("[ServiceWorkerCleaner] Unregistered stale service worker on localhost");
            }
          });
        }
      });

      if ("caches" in window) {
        caches.keys().then((names) => {
          for (const name of names) {
            caches.delete(name);
          }
        });
      }
    }
  }, []);

  return null;
}
