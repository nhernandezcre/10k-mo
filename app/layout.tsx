import type { Metadata, Viewport } from "next";
import "./globals.css";
import { PWAInstall } from "@/components/PWAInstall";

export const metadata: Metadata = {
  title: {
    default: "Attached. — AI Attachment Style Quiz",
    template: "%s · Attached.",
  },
  description:
    "Find out your attachment style, then decode anyone in your life. The AI attachment style analyzer that tells you why your relationships keep ending.",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "https://10k-mo.netlify.app"
  ),
  keywords: [
    "attachment style",
    "attachment style quiz",
    "anxious attachment",
    "avoidant attachment",
    "secure attachment",
    "disorganized attachment",
    "relationship quiz",
    "attachment theory",
    "AI relationship analysis",
  ],
  openGraph: {
    title: "Attached. — Understand why your relationships keep ending.",
    description:
      "The AI attachment style decoder. Find out your style, then analyze anyone in your life.",
    url: "/",
    siteName: "Attached.",
    type: "website",
    images: [{ url: "/og.png", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Attached. — The AI attachment style decoder",
    description: "Find out your style, then analyze anyone in your life.",
    images: ["/og.png"],
  },
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    title: "Attached",
    statusBarStyle: "black-translucent",
  },
  icons: {
    icon: [
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/icons/apple-touch-icon.png", sizes: "180x180" }],
  },
  formatDetection: { telephone: false, date: false, email: false, address: false },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#F5EDE1" },
    { media: "(prefers-color-scheme: dark)", color: "#0F0A0D" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Attached" />
        <meta name="mobile-web-app-capable" content="yes" />
      </head>
      <body className="antialiased">
        <div className="phone-shell">{children}</div>
        <PWAInstall />
      </body>
    </html>
  );
}
