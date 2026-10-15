import { translations, Locale, TranslationKey } from './translations';

export const i18n = {
	defaultLocale: 'en',
	locales: ['en', 'vi'] as Locale[],
} as const;

export function getDictionary(locale?: string | null) {
	const validLocale =
		locale && i18n.locales.includes(locale as Locale) ? (locale as Locale) : i18n.defaultLocale;
	const dict = translations[validLocale] || translations[i18n.defaultLocale];
	return (key: TranslationKey): string => {
		return dict?.[key] || translations[i18n.defaultLocale]?.[key] || key;
	};
}
