import { isLocale, type Locale } from "./config";
import { en, type Dictionary } from "./dictionaries/en";
import { tr } from "./dictionaries/tr";

export * from "./config";
export type { Dictionary };

// The dictionaries are tiny, so just import both. Client components get only
// the strings they need passed in as props.
const dictionaries: Record<Locale, Dictionary> = { en, tr };

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale];
}

// returns the locale from the [lang] param, or null for anything else (we 404 on that)
export function parseLocale(value: string): Locale | null {
  return isLocale(value) ? value : null;
}
