"use client";
import Link from "next/link";
import { Brand } from "@/components/brand";
import { LanguageSwitch } from "@/components/language-switch";
import { useLocale } from "@/components/locale-provider";
export function SiteChrome({ children }: { children: React.ReactNode }) {
  const { messages } = useLocale();
  return <><header className="topbar"><Link href="/" className="brand-link" aria-label={`Towngas ${messages.nav.home}`}><Brand compact /></Link><div className="topbar-title"><strong>{messages.brand}</strong><span>{messages.publicPortal}</span></div><LanguageSwitch /></header>{children}<footer className="footer"><span>© Towngas</span><span>{messages.publicPortal} · robots: noindex, nofollow</span></footer></>;
}
