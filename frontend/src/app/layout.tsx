import type { Metadata, Viewport } from "next";
import { cookies } from "next/headers";
import "./globals.css";
import "./portal.css";
import { LocaleProvider } from "@/components/locale-provider";
import { PwaRegister } from "@/components/pwa-register";
import { QueryProvider } from "@/components/query-provider";
import { SiteChrome } from "@/components/site-chrome";
import { isLocale } from "@/lib/portal-i18n";

export const metadata: Metadata = {
  title: { default: "Towngas 車輛健康門戶", template: "%s · Towngas 車輛健康門戶" },
  description: "Towngas 公開只讀車輛健康資料門戶",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [
      { url: "/icons/icon-192.svg", sizes: "192x192", type: "image/svg+xml" },
      { url: "/icons/icon-512.svg", sizes: "512x512", type: "image/svg+xml" },
    ],
    apple: "/icons/apple-touch-icon.svg",
  },
  robots: { index: false, follow: false },
};
export const viewport: Viewport = { width: "device-width", initialScale: 1, themeColor: "#f6f8f7" };

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const store = await cookies();
  const value = store.get("portal_locale")?.value;
  const locale = isLocale(value) ? value : "zh-HK";
  return (
    <html lang={locale} suppressHydrationWarning>
      <body><QueryProvider><LocaleProvider initialLocale={locale}><PwaRegister /><SiteChrome>{children}</SiteChrome></LocaleProvider></QueryProvider></body>
    </html>
  );
}
