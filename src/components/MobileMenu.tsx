'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
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

	return (
		<>
			<button
				onClick={() => setIsOpen(!isOpen)}
				className="rounded border border-border p-2 transition-colors hover:border-primary"
				aria-label="Toggle menu"
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
				/>
			)}

			<div
				className={`fixed right-0 top-[57px] z-50 h-[calc(100vh-57px)] w-56 transform border-l border-border bg-card transition-transform duration-200 ease-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
			>
				<nav className="flex flex-col space-y-1 p-4">
					<Link
						href="/"
						className="rounded px-3 py-2.5 font-mono text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
					>
						home
					</Link>
					<Link
						href="/blog"
						className="rounded px-3 py-2.5 font-mono text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
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
							className="rounded px-3 py-2 font-mono text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
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
