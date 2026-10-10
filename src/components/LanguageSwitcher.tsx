'use client';

import { usePathname } from 'next/navigation';
import Link from '@/components/LocalizedLink';

/**
 * Language toggle link — switches between EN and VI via sub-paths.
 */
export default function LanguageSwitcher() {
	const pathname = usePathname();
	if (!pathname) return null;

	// Normalize pathname to strip .html (e.g. for LHCI local server)
	const cleanPathname = pathname.replace(/\.html$/, '');

	const isVi = cleanPathname.startsWith('/vi');
	const currentLocale = isVi ? 'vi' : 'en';
	const nextLocale = isVi ? 'en' : 'vi';

	// Replace the locale segment in the pathname
	const segments = cleanPathname.split('/');
	if (segments[1] === 'en' || segments[1] === 'vi') {
		segments[1] = nextLocale;
	} else {
		segments.splice(1, 0, nextLocale);
	}
	const nextPath = segments.join('/') || '/';

	return (
		<Link
			href={nextPath}
			className="rounded border border-border px-2 py-1 font-mono text-[11px] text-muted-foreground transition-all hover:border-primary hover:text-foreground"
			aria-label={`Switch to ${nextLocale.toUpperCase()}`}
		>
			{nextLocale.toUpperCase()}
		</Link>
	);
}
