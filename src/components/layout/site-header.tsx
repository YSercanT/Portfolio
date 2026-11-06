import Link from "next/link";
import { Sparkles } from "lucide-react";
import { LanguageSwitcher } from "@/components/layout/language-switcher";
import { SiteNav } from "@/components/layout/site-nav";
import type { Dictionary, Locale } from "@/i18n";

export function SiteHeader({ locale, labels }: { locale: Locale; labels: Dictionary["nav"] }) {
  return (
    <header className="sticky top-0 z-40 border-b bg-background/70 backdrop-blur-md supports-[backdrop-filter]:bg-background/55">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-2 px-4 sm:px-6">
        <Link href={`/${locale}`} className="group flex shrink-0 items-center gap-2 font-semibold tracking-tight whitespace-nowrap">
          <Sparkles className="size-4 text-primary transition-[rotate] duration-500 ease-out-expo motion-safe:group-hover:rotate-12" />
          The Hub
        </Link>
        <div className="flex items-center gap-1 sm:gap-3">
          <SiteNav locale={locale} labels={labels} />
          <LanguageSwitcher locale={locale} label={labels.language} />
        </div>
      </div>
      {/* Hairline accent under the header. */}
      <div aria-hidden className="h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
    </header>
  );
}
