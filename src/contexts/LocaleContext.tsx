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

// Pre-flatten nested locale objects into a Map<string, string> at module load time
// for O(1) translation key lookups without runtime string split/traversal allocations.
function flattenLocale(obj: Record<string, unknown>, prefix = ''): Map<string, string> {
  const map = new Map<string, string>();
  for (const [key, value] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (typeof value === 'string') {
      map.set(fullKey, value);
    } else if (value && typeof value === 'object') {
      const childMap = flattenLocale(value as Record<string, unknown>, fullKey);
      childMap.forEach((v, k) => map.set(k, v));
    }
  }
  return map;
}

const flatLocales: Record<Locale, Map<string, string>> = {
  ru: flattenLocale(ruLocale as Record<string, unknown>),
  en: flattenLocale(enLocale as Record<string, unknown>),
  de: flattenLocale(deLocale as Record<string, unknown>),
  es: flattenLocale(esLocale as Record<string, unknown>),
};

export const LocaleProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [locale, setLocaleState] = useState<Locale>('ru');

  const setLocale = useCallback((newLocale: Locale) => {
    setLocaleState(newLocale);
    localStorage.setItem('monopolyLocale', newLocale);
  }, []);

  // Pre-flattened O(1) map lookup
  const t = useCallback(
    (key: string, params?: Record<string, string | number>): string => {
      const value = flatLocales[locale].get(key);

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
