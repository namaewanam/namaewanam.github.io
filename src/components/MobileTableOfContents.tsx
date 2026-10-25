'use client';

import { useState } from 'react';
import type { Heading } from '@/lib/mdx';
import { ChevronDown, List } from 'lucide-react';

interface MobileTableOfContentsProps {
	headings: Heading[];
	isVi?: boolean;
}

export default function MobileTableOfContents({
	headings,
	isVi = false,
}: Readonly<MobileTableOfContentsProps>) {
	const [isOpen, setIsOpen] = useState(false);

	if (!headings || headings.length === 0) {
		return null;
	}

	const handleHeadingClick = (id: string) => {
		setIsOpen(false);
		const element = document.getElementById(id);
		if (element) {
			element.scrollIntoView({ behavior: 'smooth' });
		}
	};

	return (
		<div className="mb-6 rounded-lg border border-border bg-card/40 lg:hidden">
			<button
				type="button"
				onClick={() => setIsOpen(!isOpen)}
				aria-expanded={isOpen}
				className="flex w-full items-center justify-between p-3.5 text-left transition-colors hover:bg-card/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
			>
				<span className="flex items-center gap-2 font-mono text-xs font-medium text-foreground">
					<List className="h-4 w-4 text-primary" aria-hidden="true" />
					{isVi ? 'Mục lục bài viết' : 'Table of Contents'}
					<span className="py-0.2 rounded bg-muted px-1.5 font-mono text-[10px] text-muted-foreground">
						{headings.length}
					</span>
				</span>
				<ChevronDown
					className={`h-4 w-4 text-muted-foreground transition-transform duration-200 ${
						isOpen ? 'rotate-180' : ''
					}`}
					aria-hidden="true"
				/>
			</button>

			{isOpen && (
				<nav
					aria-label={isVi ? 'Mục lục di động' : 'Mobile table of contents'}
					className="border-t border-border/60 px-3.5 py-2.5"
				>
					<ul className="space-y-1">
						{headings.map(({ id, text, level }) => (
							<li key={id}>
								<a
									href={`#${id}`}
									onClick={(e) => {
										e.preventDefault();
										handleHeadingClick(id);
									}}
									className={`block rounded py-1.5 text-xs transition-colors hover:text-primary ${
										level === 3
											? 'pl-5 text-muted-foreground'
											: 'pl-1 font-medium text-foreground/90'
									}`}
								>
									{text}
								</a>
							</li>
						))}
					</ul>
				</nav>
			)}
		</div>
	);
}
