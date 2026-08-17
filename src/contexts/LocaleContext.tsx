import React, { createContext, useCallback, useContext, useState } from 'react';
import ruLocale from '@/data/locales/ru.json';
import enLocale from '@/data/locales/en.json';
import deLocale from '@/data/locales/de.json';
import esLocale from '@/data/locales/es.json';

type Locale = 'ru' | 'en' | 'de' | 'es';

interface LocaleContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
}

const LocaleContext = createContext<LocaleContextType | undefined>(undefined);

export const useLocale = () => {
  const context = useContext(LocaleContext);
  if (!context) throw new Error('useLocale must be used within LocaleProvider');
  return context;
};

const locales: Record<Locale, Record<string, unknown>> = {
  ru: ruLocale,
  en: enLocale,
  de: deLocale,
  es: esLocale,
};

const isLocale = (value: string | null): value is Locale =>
  value === 'ru' || value === 'en' || value === 'de' || value === 'es';

const getInitialLocale = (): Locale => {
  if (typeof window === 'undefined') return 'ru';
  const savedLocale = window.localStorage.getItem('monopolyLocale');
  return isLocale(savedLocale) ? savedLocale : 'ru';
};

const resolveTranslation = (locale: Locale, key: string): string | undefined => {
  let value: unknown = locales[locale];

  for (const segment of key.split('.')) {
    if (!value || typeof value !== 'object') return undefined;
    value = (value as Record<string, unknown>)[segment];
  }

  return typeof value === 'string' ? value : undefined;
};

export const LocaleProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [locale, setLocaleState] = useState<Locale>(getInitialLocale);

  const setLocale = useCallback((newLocale: Locale) => {
    setLocaleState(newLocale);
    window.localStorage.setItem('monopolyLocale', newLocale);
  }, []);

  const t = useCallback(
    (key: string, params?: Record<string, string | number>): string => {
      const template = resolveTranslation(locale, key) ?? resolveTranslation('ru', key);
      if (!template) return key;

      if (!params) return template;

      return Object.entries(params).reduce(
        (result, [paramKey, paramValue]) =>
          result.split(`{{${paramKey}}}`).join(String(paramValue)),
        template
      );
    },
    [locale]
  );

  return (
    <LocaleContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </LocaleContext.Provider>
  );
};
