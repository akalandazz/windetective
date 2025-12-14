export const locales = ['en', 'ka'] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = 'en';

export const localeNames: Record<Locale, { native: string; english: string }> = {
  en: { native: 'English', english: 'English' },
  ka: { native: 'ქართული', english: 'Georgian' },
};

export function isValidLocale(locale: string): locale is Locale {
  return locales.includes(locale as Locale);
}
