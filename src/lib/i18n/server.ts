import { translations, Locale, TranslationKey } from './translations';

export const i18n = {
	defaultLocale: 'en',
	locales: ['en', 'vi'] as Locale[],
} as const;

export function getDictionary(locale: Locale) {
	return (key: TranslationKey): string => {
		return translations[locale][key] || translations[i18n.defaultLocale][key] || key;
	};
}
