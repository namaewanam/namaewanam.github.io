'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { usePathname, useRouter } from 'next/navigation';

function isTypingField(target: EventTarget | null): boolean {
	return (
		target instanceof HTMLInputElement ||
		target instanceof HTMLTextAreaElement ||
		(target instanceof HTMLElement && target.isContentEditable) ||
		(target instanceof HTMLElement && target.closest('[role="dialog"] input')) !== null
	);
}

export default function KeyboardNavigation() {
	const pathname = usePathname();
	const router = useRouter();
	const isVi = pathname?.startsWith('/vi');
	const lang = isVi ? 'vi' : 'en';

	const [pendingKey, setPendingKey] = useState<string | null>(null);
	const timerRef = useRef<NodeJS.Timeout | null>(null);

	const localize = useCallback(
		(path: string) => {
			return `/${lang}${path === '/' ? '' : path}`;
		},
		[lang]
	);

	useEffect(() => {
		function handleKeyDown(event: KeyboardEvent) {
			if (event.defaultPrevented) return;
			if (event.metaKey || event.ctrlKey || event.altKey) return;
			if (isTypingField(event.target)) return;

			// Handle pending sequence (e.g. `g` followed by something)
			if (pendingKey === 'g') {
				if (timerRef.current) clearTimeout(timerRef.current);
				setPendingKey(null);

				switch (event.key.toLowerCase()) {
					case 'h':
						event.preventDefault();
						router.push(localize('/'));
						return;
					case 'b':
						event.preventDefault();
						router.push(localize('/blog'));
						return;
					case 's':
						event.preventDefault();
						router.push(localize('/stack'));
						return;
					case 'a':
						event.preventDefault();
						router.push(localize('/adr'));
						return;
					case 'n':
						event.preventDefault();
						router.push(localize('/now'));
						return;
					case 'c':
						event.preventDefault();
						router.push(localize('/changelog'));
						return;
					case 'm':
						event.preventDefault();
						router.push(localize('/guestbook'));
						return;
					case 'g':
						event.preventDefault();
						window.scrollTo({ top: 0, behavior: 'smooth' });
						return;
					default:
						break;
				}
			}

			// Single-key navigation
			if (event.key === 'g' && !event.shiftKey) {
				event.preventDefault();
				setPendingKey('g');
				if (timerRef.current) clearTimeout(timerRef.current);
				timerRef.current = setTimeout(() => {
					setPendingKey(null);
				}, 1500);
				return;
			}

			if (event.key === 'G' && event.shiftKey) {
				event.preventDefault();
				window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
				return;
			}

			// Smooth scroll down / up
			if (event.key === 'j') {
				event.preventDefault();
				window.scrollBy({ top: 260, behavior: 'smooth' });
				return;
			}
			if (event.key === 'k') {
				event.preventDefault();
				window.scrollBy({ top: -260, behavior: 'smooth' });
				return;
			}

			// Previous / Next post navigation
			if (event.key === '[') {
				const prevLink = document.getElementById('post-nav-prev');
				if (prevLink) {
					event.preventDefault();
					prevLink.click();
				}
				return;
			}
			if (event.key === ']') {
				const nextLink = document.getElementById('post-nav-next');
				if (nextLink) {
					event.preventDefault();
					nextLink.click();
				}
				return;
			}
		}

		window.addEventListener('keydown', handleKeyDown);
		return () => {
			window.removeEventListener('keydown', handleKeyDown);
			if (timerRef.current) clearTimeout(timerRef.current);
		};
	}, [pendingKey, lang, router, localize]);

	if (!pendingKey) return null;

	return (
		<div className="animate-in fade-in slide-in-from-bottom-2 fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-lg border border-border bg-card/95 px-3 py-1.5 font-mono text-xs text-foreground shadow-2xl backdrop-blur-md">
			<span className="flex h-2 w-2 animate-ping rounded-full bg-primary" />
			<span>
				<strong className="font-bold text-primary">g</strong> → [h]ome [b]log [s]tack [m]guestbook
				[g]top
			</span>
		</div>
	);
}
