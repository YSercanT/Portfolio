import { Geist, Geist_Mono } from "next/font/google";
import "@/app/globals.css";

// next/font downloads the fonts at build time, so no request to Google later.
// latin-ext is needed for Turkish letters like ı, ş, ğ.
const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin", "latin-ext"], display: "swap" });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin", "latin-ext"], display: "swap" });

// The <html> and <body> used by all root layouts. There are three of them
// ([lang], admin, login) because only the [lang] one knows which lang to put on <html>.
export function RootDocument({ lang, children }: { lang: string; children: React.ReactNode }) {
  return (
    <html lang={lang} className="dark">
      <body className={`${geistSans.variable} ${geistMono.variable} min-h-dvh font-sans`}>{children}</body>
    </html>
  );
}
