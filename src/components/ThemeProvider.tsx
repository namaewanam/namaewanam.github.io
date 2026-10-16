'use client';

import {
	createContext,
	useContext,
	useEffect,
	useLayoutEffect,
	useState,
	useCallback,
} from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextType {
	theme: Theme;
	toggleTheme: () => void;
	mounted: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Module-level persistent cache across Next.js layout remounts in client
let cachedTheme: Theme | null = null;
let isClientMounted = false;

function readSavedTheme(): Theme {
	if (typeof window === 'undefined') return 'light';
	if (cachedTheme) return cachedTheme;
	try {
		const saved = localStorage.getItem('theme');
		if (saved === 'dark' || saved === 'light') {
			cachedTheme = saved;
			return saved;
		}
		if (
			document.documentElement.classList.contains('dark') ||
			window.matchMedia('(prefers-color-scheme: dark)').matches
		) {
			cachedTheme = 'dark';
			return 'dark';
		}
	} catch {
		// ignore
	}
	cachedTheme = 'light';
	return 'light';
}

/**
 * Inline script that runs before React hydration.
 * Sets the correct class on <html> to prevent FOUC,
 * but does NOT affect React's server-rendered output.
 */
const themeScript = `(function(){try{var t=localStorage.getItem('theme');var d=t||(window.matchMedia('(prefers-color-scheme:dark)').matches?'dark':'light');document.documentElement.classList.remove('light','dark');document.documentElement.classList.add(d)}catch(e){}})()`;

export function ThemeScript() {
	return <script suppressHydrationWarning dangerouslySetInnerHTML={{ __html: themeScript }} />;
}

// Universal layout effect hook safe for SSR
const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

export function ThemeProvider({ children }: Readonly<{ children: React.ReactNode }>) {
	// On initial SSR/hydration, start with 'light' to prevent hydration mismatch.
	// On subsequent client-side layout swaps (like language toggle), immediately use cached theme.
	const [theme, setTheme] = useState<Theme>(() => {
		if (!isClientMounted) return 'light';
		return readSavedTheme();
	});

	const [mounted, setMounted] = useState<boolean>(isClientMounted);

	// Synchronously apply theme before paint
	useIsomorphicLayoutEffect(() => {
		const activeTheme = readSavedTheme();
		cachedTheme = activeTheme;
		isClientMounted = true;

		setTheme(activeTheme);
		setMounted(true);

		const root = document.documentElement;
		if (!root.classList.contains(activeTheme)) {
			root.classList.remove('light', 'dark');
			root.classList.add(activeTheme);
		}
	}, []);

	// Sync theme changes to DOM, localStorage, and module cache
	useIsomorphicLayoutEffect(() => {
		if (!mounted) return;
		cachedTheme = theme;
		const root = document.documentElement;
		if (!root.classList.contains(theme)) {
			root.classList.remove('light', 'dark');
			root.classList.add(theme);
		}
		try {
			localStorage.setItem('theme', theme);
		} catch {
			// ignore
		}
	}, [theme, mounted]);

	// Guard against Next.js route reconciliation clearing 'dark'/'light' from <html>
	useEffect(() => {
		const root = document.documentElement;
		const observer = new MutationObserver(() => {
			const active = cachedTheme || 'light';
			if (!root.classList.contains(active)) {
				root.classList.remove('light', 'dark');
				root.classList.add(active);
			}
		});

		observer.observe(root, {
			attributes: true,
			attributeFilter: ['class'],
		});

		return () => observer.disconnect();
	}, []);

	const toggleTheme = useCallback(() => {
		setTheme((prev) => {
			const next = prev === 'light' ? 'dark' : 'light';
			cachedTheme = next;
			return next;
		});
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
