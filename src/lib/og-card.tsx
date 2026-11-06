import "server-only";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { ImageResponse } from "next/og";
import { OG_IMAGE_SIZE, SITE_NAME, SITE_URL } from "@/lib/site";

// The 1200x630 share image, drawn with next/og.
// It only supports part of CSS: flexbox, inline styles, hex/rgba colors.

const FONT_DIR = path.join(process.cwd(), "src", "assets", "fonts");
// bundle the Geist font so the image matches the site and Turkish letters work
let fonts: Promise<{ name: string; data: Buffer; weight: 400 | 600; style: "normal" }[]> | undefined;
const loadFonts = () =>
  (fonts ??= Promise.all([
    readFile(path.join(FONT_DIR, "Geist-Regular.ttf")).then((data) => ({ name: "Geist", data, weight: 400 as const, style: "normal" as const })),
    readFile(path.join(FONT_DIR, "Geist-SemiBold.ttf")).then((data) => ({ name: "Geist", data, weight: 600 as const, style: "normal" as const })),
  ]));

const C = {
  bg: "#070a10",
  fg: "#f1f5f9",
  muted: "#94a3b8",
  cyan: "#22d3ee",
  blue: "#3b82f6",
  border: "rgba(255,255,255,0.10)",
};

const clip = (s: string, max: number) => (s.length > max ? `${s.slice(0, max - 1).trimEnd()}…` : s);

export interface OgCardProps {
  eyebrow: string;
  title: string;
  subtitle?: string;
  chips?: string[];
  footer?: string;
}

export async function renderOgCard({ eyebrow, title, subtitle, chips = [], footer }: OgCardProps) {
  const titleSize = title.length > 40 ? 60 : 76;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "64px 72px",
          fontFamily: "Geist",
          color: C.fg,
          backgroundColor: C.bg,
          backgroundImage: `radial-gradient(circle at 12% 0%, rgba(34,211,238,0.28), transparent 45%), radial-gradient(circle at 100% 100%, rgba(59,130,246,0.22), transparent 50%)`,
        }}
      >
        {/* top */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14, fontSize: 28, fontWeight: 600 }}>
            <div style={{ width: 14, height: 14, borderRadius: 4, background: C.cyan, boxShadow: `0 0 24px ${C.cyan}` }} />
            {SITE_NAME}
          </div>
          <div
            style={{
              display: "flex",
              padding: "8px 18px",
              borderRadius: 999,
              border: `1px solid rgba(34,211,238,0.45)`,
              color: C.cyan,
              fontSize: 22,
              fontWeight: 600,
              letterSpacing: 2,
              textTransform: "uppercase",
            }}
          >
            {eyebrow}
          </div>
        </div>

        {/* middle */}
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div
            style={{
              display: "flex",
              fontSize: titleSize,
              fontWeight: 600,
              lineHeight: 1.05,
              letterSpacing: -2,
              backgroundImage: `linear-gradient(100deg, ${C.fg} 35%, ${C.cyan} 80%, ${C.blue})`,
              backgroundClip: "text",
              color: "transparent",
            }}
          >
            {clip(title, 70)}
          </div>
          {subtitle && (
            <div style={{ display: "flex", fontSize: 30, lineHeight: 1.35, color: C.muted, maxWidth: 1000 }}>
              {clip(subtitle, 150)}
            </div>
          )}
          {chips.length > 0 && (
            <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
              {chips.slice(0, 5).map((chip) => (
                <div
                  key={chip}
                  style={{
                    display: "flex",
                    padding: "8px 18px",
                    borderRadius: 10,
                    background: "rgba(255,255,255,0.06)",
                    border: `1px solid ${C.border}`,
                    fontSize: 24,
                    fontWeight: 600,
                  }}
                >
                  {clip(chip, 24)}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* bottom */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div
            style={{
              display: "flex",
              height: 2,
              width: "100%",
              backgroundImage: `linear-gradient(90deg, transparent, ${C.cyan}, ${C.blue}, transparent)`,
            }}
          />
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 24, color: C.muted }}>
            <span>{footer ?? ""}</span>
            <span>{SITE_URL.host}</span>
          </div>
        </div>
      </div>
    ),
    {
      ...OG_IMAGE_SIZE,
      fonts: await loadFonts(),
      headers: {
        // cache for a day
        "Cache-Control": "public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800",
      },
    },
  );
}
