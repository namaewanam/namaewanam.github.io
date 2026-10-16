'use client';

import { createContext, useContext, useEffect, useState, useCallback } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextType {
	theme: Theme;
	toggleTheme: () => void;
	mounted: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

/**
 * Inline script that runs before React hydration.
 * Sets the correct class on <html> to prevent FOUC,
 * but does NOT affect React's server-rendered output.
 */
const themeScript = `(function(){try{var t=localStorage.getItem('theme');var d=t||(window.matchMedia('(prefers-color-scheme:dark)').matches?'dark':'light');document.documentElement.classList.add(d)}catch(e){}})()`;

export function ThemeScript() {
	return <script suppressHydrationWarning dangerouslySetInnerHTML={{ __html: themeScript }} />;
}

export function ThemeProvider({ children }: Readonly<{ children: React.ReactNode }>) {
	// IMPORTANT: Always initialize to 'light' on both server AND client
	// to prevent hydration mismatch. The actual theme is synced in useEffect.
	const [theme, setTheme] = useState<Theme>('light');
	const [mounted, setMounted] = useState(false);

	// On mount, read theme from localStorage first, then DOM/media query
	useEffect(() => {
		let initialTheme: Theme = 'light';
		try {
			const saved = localStorage.getItem('theme');
			if (saved === 'dark' || saved === 'light') {
				initialTheme = saved;
			} else if (
				document.documentElement.classList.contains('dark') ||
				window.matchMedia('(prefers-color-scheme: dark)').matches
			) {
				initialTheme = 'dark';
			}
		} catch {
			initialTheme = document.documentElement.classList.contains('dark') ? 'dark' : 'light';
		}

		setTheme(initialTheme);
		document.documentElement.classList.remove('light', 'dark');
		document.documentElement.classList.add(initialTheme);
		setMounted(true);
	}, []);

	// Sync theme changes to DOM and localStorage
	useEffect(() => {
		if (!mounted) return;
		const root = document.documentElement;
		root.classList.remove('light', 'dark');
		root.classList.add(theme);
		localStorage.setItem('theme', theme);
	}, [theme, mounted]);

	const toggleTheme = useCallback(() => {
		setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
	}, []);

	return (
		<ThemeContext.Provider value={{ theme, toggleTheme, mounted }}>
			{children}
		</ThemeContext.Provider>
	);
}

export function useTheme() {
	const context = useContext(ThemeContext);
	if (context === undefined) {
		throw new Error('useTheme must be used within a ThemeProvider');
	}
	return context;
}
