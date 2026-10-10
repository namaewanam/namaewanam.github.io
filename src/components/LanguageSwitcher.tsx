'use client';

import { useLanguage } from '@/lib/i18n/context';

/**
 * Language toggle button — switches between EN and VI.
 */
export default function LanguageSwitcher() {
	const { locale, setLocale } = useLanguage();

	return (
		<button
			type="button"
			onClick={() => setLocale(locale === 'en' ? 'vi' : 'en')}
			className="rounded border border-border px-2 py-1 font-mono text-[11px] text-muted-foreground transition-all hover:border-primary hover:text-foreground"
			aria-label="Toggle language"
		>
			{locale.toUpperCase()}
		</button>
	);
}
