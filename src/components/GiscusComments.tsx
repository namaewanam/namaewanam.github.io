'use client';

import { useEffect, useRef } from 'react';

interface GiscusCommentsProps {
	repo: string; // e.g. "ntnam1605/namaewanam.github.io"
	repoId: string;
	category: string;
	categoryId: string;
	mapping?: 'pathname' | 'url' | 'title' | 'og:title';
	strict?: '0' | '1';
	reactionsEnabled?: '0' | '1';
	emitMetadata?: '0' | '1';
	inputPosition?: 'top' | 'bottom';
	lang?: string;
}

/**
 * Giscus comments widget (GitHub Discussions).
 *
 * Setup:
 *   1. Enable GitHub Discussions on the repo
 *   2. Go to https://giscus.app to get repo, repoId, category, categoryId
 *   3. Pass them as props here
 *
 * Theme automatically follows the site's dark/light mode.
 */
export default function GiscusComments({
	repo,
	repoId,
	category,
	categoryId,
	mapping = 'pathname',
	strict = '0',
	reactionsEnabled = '1',
	emitMetadata = '0',
	inputPosition = 'bottom',
	lang = 'en',
}: GiscusCommentsProps) {
	const containerRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (!containerRef.current) return;

		const isDark = document.documentElement.classList.contains('dark');
		// Built-in Giscus themes: clean, well-polished, no custom CSS needed
		const theme = isDark ? 'dark_dimmed' : 'light';

		const script = document.createElement('script');
		script.src = 'https://giscus.app/client.js';
		script.setAttribute('data-repo', repo);
		script.setAttribute('data-repo-id', repoId);
		script.setAttribute('data-category', category);
		script.setAttribute('data-category-id', categoryId);
		script.setAttribute('data-mapping', mapping);
		script.setAttribute('data-strict', strict);
		script.setAttribute('data-reactions-enabled', reactionsEnabled);
		script.setAttribute('data-emit-metadata', emitMetadata);
		script.setAttribute('data-input-position', inputPosition);
		script.setAttribute('data-theme', theme);
		script.setAttribute('data-lang', lang);
		script.setAttribute('data-loading', 'lazy');
		script.crossOrigin = 'anonymous';
		script.async = true;

		containerRef.current.appendChild(script);

		// Update theme when site theme changes
		const observer = new MutationObserver(() => {
			const newTheme = document.documentElement.classList.contains('dark')
				? 'dark_dimmed'
				: 'light';
			const iframe = document.querySelector<HTMLIFrameElement>('iframe.giscus-frame');
			if (iframe?.contentWindow) {
				iframe.contentWindow.postMessage(
					{ giscus: { setConfig: { theme: newTheme } } },
					'https://giscus.app'
				);
			}
		});

		observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });

		return () => {
			observer.disconnect();
		};
	}, [
		repo,
		repoId,
		category,
		categoryId,
		mapping,
		strict,
		reactionsEnabled,
		emitMetadata,
		inputPosition,
		lang,
	]);

	return (
		<div ref={containerRef} className="mt-12 border-t border-border pt-8" aria-label="Comments" />
	);
}
