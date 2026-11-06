import { intlLocale, type Locale } from "@/i18n/config";

// "2024-09-01" becomes "Sep 2024" (or "Eyl 2024" in Turkish). Uses UTC so the month can't shift.
export function formatMonthYear(isoDate: string, locale: Locale = "en"): string {
  return new Date(`${isoDate}T00:00:00Z`).toLocaleDateString(intlLocale[locale], {
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}

// ("2023-02-01", null) gives "Feb 2023 – Present"
export function formatDateRange(start: string, end: string | null, locale: Locale = "en", present = "Present"): string {
  return `${formatMonthYear(start, locale)} – ${end ? formatMonthYear(end, locale) : present}`;
}
