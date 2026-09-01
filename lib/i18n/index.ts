import type { Locale, SiteDictionary } from './types';
import { ar } from './ar';
import { en } from './en';

export type { Locale, SiteDictionary };
export { ar, en };

export const dictionaries: Record<Locale, SiteDictionary> = { ar, en };

export function getDictionary(locale: Locale): SiteDictionary {
  return dictionaries[locale] ?? ar;
}

export const locales: Locale[] = ['ar', 'en'];
export const defaultLocale: Locale = 'ar';
