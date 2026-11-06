"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";

// not-found doesn't get params, so read the language from the URL
const TEXT = {
  en: { title: "Page not found", body: "The page you are looking for does not exist or was moved.", home: "Back to home" },
  tr: { title: "Sayfa bulunamadı", body: "Aradığınız sayfa mevcut değil ya da taşınmış.", home: "Ana sayfaya dön" },
} as const;

export default function LocaleNotFound() {
  const segment = usePathname().split("/")[1];
  const lang = segment === "tr" ? "tr" : "en";
  const t = TEXT[lang];

  return (
    <main className="mx-auto flex min-h-[60dvh] max-w-xl flex-col items-start justify-center gap-4 px-6">
      <p className="font-mono text-sm text-primary">404</p>
      <h1 className="text-3xl font-semibold tracking-tight">{t.title}</h1>
      <p className="text-muted-foreground">{t.body}</p>
      <Button asChild>
        <Link href={`/${lang}`}>{t.home}</Link>
      </Button>
    </main>
  );
}
