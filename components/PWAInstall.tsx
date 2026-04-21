"use client";
import { useEffect } from "react";

export function PWAInstall() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!("serviceWorker" in navigator)) return;
    // Register after load to avoid blocking first paint.
    const onLoad = () => {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        // ignore — offline shell is nice-to-have
      });
    };
    if (document.readyState === "complete") onLoad();
    else window.addEventListener("load", onLoad, { once: true });
  }, []);
  return null;
}
