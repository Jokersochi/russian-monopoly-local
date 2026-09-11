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

// Helper to pre-flatten nested translation objects into an O(1) key-value map
const flattenLocale = (obj: Record<string, unknown>, prefix = ''): Map<string, string> => {
  const map = new Map<string, string>();
  const traverse = (current: Record<string, unknown>, currentPrefix: string) => {
    for (const key in current) {
      if (Object.prototype.hasOwnProperty.call(current, key)) {
        const fullKey = currentPrefix ? `${currentPrefix}.${key}` : key;
        const val = current[key];
        if (typeof val === 'string') {
          map.set(fullKey, val);
        } else if (val && typeof val === 'object') {
          traverse(val as Record<string, unknown>, fullKey);
        }
      }
    }
  };
  traverse(obj, prefix);
  return map;
};

// Pre-flatten locale dictionaries at module load time to convert nested tree traversal into O(1) Map lookups
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

  // O(1) translation lookup using pre-flattened locale Map
  const t = useCallback(
    (key: string, params?: Record<string, string | number>): string => {
      const template = flatLocales[locale].get(key) ?? key;

      if (!params) return template;

      return Object.entries(params).reduce(
        (str, [paramKey, paramValue]) => str.replace(`{{${paramKey}}}`, String(paramValue)),
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
