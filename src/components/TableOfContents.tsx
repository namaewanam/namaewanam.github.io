'use client';

import { useEffect, useState } from 'react';
import type { Heading } from '@/lib/mdx';

/**
 * Sticky Table of Contents sidebar.
 * Desktop: rendered in a dedicated layout column.
 * Mobile: hidden by the parent layout.
 *
 * Uses IntersectionObserver to highlight the currently visible heading.
 */
export default function TableOfContents({ headings }: Readonly<{ headings: Heading[] }>) {
	const [activeId, setActiveId] = useState('');

	useEffect(() => {
		if (headings.length === 0) return;

		const updateActiveHeading = () => {
			const scrollY = window.scrollY;
			const headingElements = headings
				.map(({ id }) => ({
					id,
					element: document.getElementById(id),
				}))
				.filter((item): item is { id: string; element: HTMLElement } => item.element !== null);

			if (headingElements.length === 0) return;

			// Header offset for fixed navbar and top breathing room
			const offset = 120;

			// Find the last heading that has scrolled past the offset line
			let currentActive = headingElements[0]?.id ?? '';
			for (const { id, element } of headingElements) {
				const top = element.getBoundingClientRect().top + scrollY;
				if (scrollY >= top - offset) {
					currentActive = id;
				} else {
					break;
				}
			}

			// If user has scrolled to the bottom of the page, activate the last heading
			const lastHeading = headingElements[headingElements.length - 1];
			if (
				lastHeading &&
				window.innerHeight + scrollY >= document.documentElement.scrollHeight - 50
			) {
				currentActive = lastHeading.id;
			}

			setActiveId(currentActive);
		};

		// Run once on mount
		updateActiveHeading();

		let ticking = false;
		const handleScroll = () => {
			if (!ticking) {
				window.requestAnimationFrame(() => {
					updateActiveHeading();
					ticking = false;
				});
				ticking = true;
			}
		};

		window.addEventListener('scroll', handleScroll, { passive: true });
		return () => window.removeEventListener('scroll', handleScroll);
	}, [headings]);

	return (
		<aside className="toc-sidebar" aria-label="Table of contents">
			<p className="mb-3 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
				on this page
			</p>
			<nav>
				<ul className="space-y-1">
					{headings.map(({ id, text, level }) => (
						<li key={id}>
							<a
								href={`#${id}`}
								onClick={(e) => {
									e.preventDefault();
									document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
									setActiveId(id);
								}}
								className={`toc-link ${level === 3 ? 'toc-link-h3' : ''} ${
									activeId === id ? 'toc-link-active' : ''
								}`}
							>
								{text}
							</a>
						</li>
					))}
				</ul>
			</nav>
		</aside>
	);
}
