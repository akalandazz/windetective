'use client';

import { NextIntlClientProvider } from 'next-intl';
import { ReactNode, useEffect, useState, createContext, useContext } from 'react';
import { getInitialLocale, setStoredLocale } from './locales';
import type { Locale } from './config';

interface Messages {
  common: Record<string, any>;
  home: Record<string, any>;
  auth: Record<string, any>;
  validation: Record<string, any>;
}

interface LocaleContextType {
  locale: Locale;
  changeLocale: (locale: Locale) => void;
}

const LocaleContext = createContext<LocaleContextType | null>(null);

export function useLocale() {
  const context = useContext(LocaleContext);
  if (!context) {
    throw new Error('useLocale must be used within I18nProvider');
  }
  return context;
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>('en');
  const [messages, setMessages] = useState<Messages | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initLocale = getInitialLocale();
    loadMessages(initLocale);
  }, []);

  const loadMessages = async (newLocale: Locale) => {
    setIsLoading(true);
    try {
      const [common, home, auth, validation] = await Promise.all([
        import(`../../locales/${newLocale}/common.json`),
        import(`../../locales/${newLocale}/home.json`),
        import(`../../locales/${newLocale}/auth.json`),
        import(`../../locales/${newLocale}/validation.json`),
      ]);

      setMessages({
        common: common.default,
        home: home.default,
        auth: auth.default,
        validation: validation.default,
      });
      setLocaleState(newLocale);
      setStoredLocale(newLocale);

      // Update URL parameter
      const url = new URL(window.location.href);
      url.searchParams.set('lang', newLocale);
      window.history.replaceState({}, '', url.toString());

      // Update HTML lang attribute
      document.documentElement.lang = newLocale;
    } catch (error) {
      console.error('Failed to load locale:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const changeLocale = (newLocale: Locale) => {
    loadMessages(newLocale);
  };

  if (isLoading || !messages) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <NextIntlClientProvider
      locale={locale}
      messages={messages}
      timeZone="UTC"
      onError={(error) => {
        // Log missing translation keys but don't crash
        if (error.code === 'MISSING_MESSAGE') {
          console.warn('Missing translation:', error.message);
        } else {
          console.error('i18n error:', error);
        }
      }}
      getMessageFallback={({ namespace, key }) => {
        // Fallback to English key path
        return `${namespace}.${key}`;
      }}
    >
      <LocaleContext.Provider value={{ locale, changeLocale }}>
        {children}
      </LocaleContext.Provider>
    </NextIntlClientProvider>
  );
}
