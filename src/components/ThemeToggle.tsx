'use client';

import { Moon, Sun } from 'lucide-react';
import { useTheme } from './ThemeProvider';

function getAriaLabel(mounted: boolean, theme: string): string {
	if (!mounted) return 'Toggle theme';
	return theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode';
}

export default function ThemeToggle() {
	const { theme, toggleTheme, mounted } = useTheme();
	const isDark = mounted && theme === 'dark';

	return (
		<button
			onClick={toggleTheme}
			className="group inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded border border-border p-2.5 transition-all duration-200 hover:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary active:scale-95"
			aria-label={getAriaLabel(mounted, theme)}
			suppressHydrationWarning
		>
			{/* Render a fixed icon during SSR/pre-mount to avoid hydration mismatch */}
			<span className="transition-transform duration-200 ease-out group-hover:rotate-12">
				{isDark ? (
					<Sun className="h-4 w-4 text-foreground" aria-hidden="true" />
				) : (
					<Moon className="h-4 w-4 text-foreground" aria-hidden="true" />
				)}
			</span>
		</button>
	);
}
