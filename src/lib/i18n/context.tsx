'use client';

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { translations, type Locale, type TranslationKey } from './translations';

interface LanguageContextType {
	locale: Locale;
	setLocale: (locale: Locale) => void;
	t: (key: TranslationKey) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: Readonly<{ children: ReactNode }>) {
	const [locale, setLocaleState] = useState<Locale>('en');

	useEffect(() => {
		const stored = localStorage.getItem('preferred-language');
		if (stored === 'en' || stored === 'vi') {
			setLocaleState(stored);
		} else if (navigator.language.startsWith('vi')) {
			setLocaleState('vi');
		}
	}, []);

	const setLocale = (newLocale: Locale) => {
		setLocaleState(newLocale);
		localStorage.setItem('preferred-language', newLocale);
	};

	const t = (key: TranslationKey) => {
		return translations[locale]?.[key] ?? translations.en[key] ?? key;
	};

	return (
		<LanguageContext.Provider value={{ locale, setLocale, t }}>{children}</LanguageContext.Provider>
	);
}

export function useLanguage() {
	const context = useContext(LanguageContext);
	if (context === undefined) {
		throw new Error('useLanguage must be used within a LanguageProvider');
	}
	return context;
}
