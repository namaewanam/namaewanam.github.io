'use client';

import { useState, useEffect } from 'react';
import Link from '@/components/LocalizedLink';
import { Menu, X } from 'lucide-react';
import { usePathname } from 'next/navigation';
import type { Category } from '@/lib/markdown';

export default function MobileMenu({ categories }: Readonly<{ categories: Category[] }>) {
	const [isOpen, setIsOpen] = useState(false);
	const pathname = usePathname();

	useEffect(() => {
		setIsOpen(false);
	}, [pathname]);

	useEffect(() => {
		document.body.style.overflow = isOpen ? 'hidden' : 'unset';
		return () => {
			document.body.style.overflow = 'unset';
		};
	}, [isOpen]);

	useEffect(() => {
		if (!isOpen) return;
		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.key === 'Escape') setIsOpen(false);
		};
		window.addEventListener('keydown', handleKeyDown);
		return () => window.removeEventListener('keydown', handleKeyDown);
	}, [isOpen]);

	return (
		<>
			<button
				onClick={() => setIsOpen(!isOpen)}
				className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded border border-border p-2.5 transition-colors hover:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
				aria-expanded={isOpen}
				aria-controls="mobile-nav-drawer"
				aria-label={isOpen ? 'Close menu' : 'Open menu'}
			>
				{isOpen ? (
					<X className="h-4 w-4 text-foreground" />
				) : (
					<Menu className="h-4 w-4 text-foreground" />
				)}
			</button>

			{isOpen && (
				<div
					className="fixed inset-0 z-40 bg-background/60 backdrop-blur-sm"
					onClick={() => setIsOpen(false)}
					aria-hidden="true"
				/>
			)}

			<div
				id="mobile-nav-drawer"
				aria-hidden={!isOpen}
				className={`fixed right-0 top-[57px] z-50 h-[calc(100vh-57px)] w-56 transform border-l border-border bg-card transition-transform duration-200 ease-out ${
					isOpen ? 'translate-x-0' : 'pointer-events-none translate-x-full'
				}`}
			>
				<nav className="flex flex-col space-y-1 p-4" tabIndex={isOpen ? 0 : -1}>
					<Link
						href="/"
						tabIndex={isOpen ? 0 : -1}
						className="flex min-h-[44px] items-center rounded px-3 py-2 font-mono text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
					>
						home
					</Link>
					<Link
						href="/blog"
						tabIndex={isOpen ? 0 : -1}
						className="flex min-h-[44px] items-center rounded px-3 py-2 font-mono text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
					>
						blog
					</Link>
					<div className="my-2 border-t border-border" />
					<p className="px-3 pb-1 font-mono text-[10px] uppercase tracking-widest text-muted-foreground/60">
						topics
					</p>
					{categories.map((category) => (
						<Link
							key={category.slug}
							href={`/blog/${category.slug}`}
							tabIndex={isOpen ? 0 : -1}
							className="flex min-h-[40px] items-center rounded px-3 py-2 font-mono text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
						>
							#{category.name.toLowerCase()}
							<span className="ml-1.5 text-muted-foreground/50">{category.count}</span>
						</Link>
					))}
				</nav>
			</div>
		</>
	);
}
