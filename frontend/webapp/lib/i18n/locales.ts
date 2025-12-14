'use client';

import { locales, defaultLocale, type Locale } from './config';

const LOCALE_STORAGE_KEY = 'windetective_locale';

export function getStoredLocale(): Locale | null {
  if (typeof window === 'undefined') return null;
  const stored = localStorage.getItem(LOCALE_STORAGE_KEY);
  return stored && locales.includes(stored as Locale) ? (stored as Locale) : null;
}

export function setStoredLocale(locale: Locale): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(LOCALE_STORAGE_KEY, locale);
}

export function getInitialLocale(): Locale {
  // Priority: URL param > localStorage > default (English)
  if (typeof window === 'undefined') return defaultLocale;

  const urlParams = new URLSearchParams(window.location.search);
  const urlLocale = urlParams.get('lang');

  if (urlLocale && locales.includes(urlLocale as Locale)) {
    return urlLocale as Locale;
  }

  // Check localStorage
  const storedLocale = getStoredLocale();
  if (storedLocale) {
    return storedLocale;
  }

  // Default to English (no auto-detection as per user requirements)
  return defaultLocale;
}
