"use client";

import { useEffect } from "react";

export function PWARegistry() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      if (process.env.NODE_ENV === "production") {
        window.addEventListener("load", () => {
          navigator.serviceWorker
            .register("/sw.js")
            .then((registration) => {
              console.log("Service Worker registered with scope:", registration.scope);
            })
            .catch((error) => {
              console.error("Service Worker registration failed:", error);
            });
        });
      } else {
        // Desregistra o Service Worker em ambiente de desenvolvimento para não quebrar o HMR e o Localhost
        navigator.serviceWorker.getRegistrations().then((registrations) => {
          for (const registration of registrations) {
            registration.unregister();
            console.log("Service Worker desregistrado no ambiente de desenvolvimento.");
          }
        });
      }
    }
  }, []);

  return null;
}
