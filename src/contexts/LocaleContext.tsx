import React, { createContext, useContext, useState, useCallback } from 'react';
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

const locales: Record<Locale, any> = {
  ru: ruLocale,
  en: enLocale,
  de: deLocale,
  es: esLocale,
};

export const LocaleProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [locale, setLocaleState] = useState<Locale>('ru');

  const setLocale = useCallback((newLocale: Locale) => {
    setLocaleState(newLocale);
    localStorage.setItem('monopolyLocale', newLocale);
  }, []);

  const t = useCallback(
    (key: string, params?: Record<string, string | number>): string => {
      const keys = key.split('.');
      let value: any = locales[locale];

      for (const k of keys) {
        value = value?.[k];
        if (value === undefined) break;
      }

      if (typeof value !== 'string') return key;

      if (params) {
        return Object.entries(params).reduce(
          (str, [paramKey, paramValue]) => str.replace(`{{${paramKey}}}`, String(paramValue)),
          value
        );
      }

      return value;
    },
    [locale]
  );

  return (
    <LocaleContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </LocaleContext.Provider>
  );
};
