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
		const observer = new IntersectionObserver(
			(entries) => {
				// Find the first heading that is intersecting
				const visible = entries.find((e) => e.isIntersecting);
				if (visible?.target.id) {
					setActiveId(visible.target.id);
				}
			},
			{
				rootMargin: '-80px 0px -70% 0px',
				threshold: 0,
			}
		);

		headings.forEach(({ id }) => {
			const el = document.getElementById(id);
			if (el) observer.observe(el);
		});

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
