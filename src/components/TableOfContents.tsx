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

		const headingElements = headings
			.map(({ id }) => document.getElementById(id))
			.filter((el): el is HTMLElement => el !== null);

		if (headingElements.length === 0) return;

		// IntersectionObserver tracks headings off the main thread without scroll reflows
		const visibleHeadings = new Map<string, number>();

		const observer = new IntersectionObserver(
			(entries) => {
				entries.forEach((entry) => {
					if (entry.isIntersecting) {
						visibleHeadings.set(entry.target.id, entry.boundingClientRect.top);
					} else {
						visibleHeadings.delete(entry.target.id);
					}
				});

				if (visibleHeadings.size > 0) {
					let topHeadingId = '';
					let minTop = Infinity;
					for (const [id, top] of visibleHeadings.entries()) {
						if (top < minTop) {
							minTop = top;
							topHeadingId = id;
						}
					}
					if (topHeadingId) setActiveId(topHeadingId);
				}
			},
			{ rootMargin: '-70px 0px -60% 0px' }
		);

		headingElements.forEach((el) => observer.observe(el));

		return () => observer.disconnect();
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
