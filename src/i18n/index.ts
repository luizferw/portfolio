import en from './en.json';
import pt from './pt.json';

export type Locale = 'en' | 'pt';
export const locales: Locale[] = ['en', 'pt'];
export const dictionaries = { en, pt } as const;
export const defaultLocale: Locale = 'en';

export function t(locale: Locale) {
  return dictionaries[locale];
}
