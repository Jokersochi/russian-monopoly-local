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

const locales: Record<Locale, Record<string, unknown>> = {
  ru: ruLocale as Record<string, unknown>,
  en: enLocale as Record<string, unknown>,
  de: deLocale as Record<string, unknown>,
  es: esLocale as Record<string, unknown>,
};

// Helper function to flatten nested translation objects at module load time
const flattenTranslations = (obj: Record<string, unknown>, prefix = ''): Map<string, string> => {
  const map = new Map<string, string>();
  for (const [key, value] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (typeof value === 'string') {
      map.set(fullKey, value);
    } else if (value && typeof value === 'object') {
      const subMap = flattenTranslations(value as Record<string, unknown>, fullKey);
      subMap.forEach((v, k) => map.set(k, v));
    }
  }
  return map;
};

// Pre-flattened locale lookup maps for O(1) translation access
const flatLocales: Record<Locale, Map<string, string>> = {
  ru: flattenTranslations(locales.ru),
  en: flattenTranslations(locales.en),
  de: flattenTranslations(locales.de),
  es: flattenTranslations(locales.es),
};

export const LocaleProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [locale, setLocaleState] = useState<Locale>('ru');

  const setLocale = useCallback((newLocale: Locale) => {
    setLocaleState(newLocale);
    localStorage.setItem('monopolyLocale', newLocale);
  }, []);

  // O(1) lookup using pre-flattened translation maps without key splitting or object traversal
  const t = useCallback(
    (key: string, params?: Record<string, string | number>): string => {
      const value = flatLocales[locale].get(key);

      if (value === undefined) return key;

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
