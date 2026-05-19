'use client';

import { useTheme } from './ThemeProvider';

export default function ThemeToggle() {
	const { theme, toggleTheme, mounted } = useTheme();

	return (
		<button
			onClick={toggleTheme}
			className="rounded border border-border p-2 transition-colors hover:border-primary"
			aria-label="Toggle theme"
			suppressHydrationWarning
		>
			{/* Render a fixed icon during SSR/pre-mount to avoid hydration mismatch.
			    The ThemeScript already sets the correct class on <html>,
			    so the visual theme is correct even before this updates. */}
			{!mounted ? (
				<svg
					className="h-4 w-4 text-foreground"
					fill="none"
					viewBox="0 0 24 24"
					stroke="currentColor"
				>
					<path
						strokeLinecap="round"
						strokeLinejoin="round"
						strokeWidth={2}
						d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
					/>
				</svg>
			) : theme === 'light' ? (
				<svg
					className="h-4 w-4 text-foreground"
					fill="none"
					viewBox="0 0 24 24"
					stroke="currentColor"
				>
					<path
						strokeLinecap="round"
						strokeLinejoin="round"
						strokeWidth={2}
						d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
					/>
				</svg>
			) : (
				<svg
					className="h-4 w-4 text-foreground"
					fill="none"
					viewBox="0 0 24 24"
					stroke="currentColor"
				>
					<path
						strokeLinecap="round"
						strokeLinejoin="round"
						strokeWidth={2}
						d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
					/>
				</svg>
			)}
		</button>
	);
}
