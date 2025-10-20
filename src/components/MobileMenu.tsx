'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';
import { usePathname } from 'next/navigation';

interface Category {
	slug: string;
	name: string;
	count: number;
}

export default function MobileMenu({ categories }: Readonly<{ categories: Category[] }>) {
	const [isOpen, setIsOpen] = useState(false);
	const pathname = usePathname();

	// Close menu when route changes
	useEffect(() => {
		setIsOpen(false);
	}, [pathname]);

	// Prevent body scroll when menu is open
	useEffect(() => {
		if (isOpen) {
			document.body.style.overflow = 'hidden';
		} else {
			document.body.style.overflow = 'unset';
		}
		return () => {
			document.body.style.overflow = 'unset';
		};
	}, [isOpen]);

	return (
		<>
			<button
				onClick={() => setIsOpen(!isOpen)}
				className="rounded-lg border border-border bg-secondary p-2 transition-colors hover:bg-accent/20"
				aria-label="Toggle menu"
			>
				{isOpen ? (
					<X className="h-5 w-5 text-foreground" />
				) : (
					<Menu className="h-5 w-5 text-foreground" />
				)}
			</button>

			{/* Mobile Menu Overlay */}
			{isOpen && (
				<div
					className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm"
					onClick={() => setIsOpen(false)}
				/>
			)}

			{/* Mobile Menu Panel */}
			<div
				className={`fixed right-0 top-[57px] z-50 h-[calc(100vh-57px)] w-64 transform border-l border-border bg-card transition-transform duration-300 ease-in-out ${
					isOpen ? 'translate-x-0' : 'translate-x-full'
				}`}
			>
				<nav className="flex flex-col space-y-2 p-4">
					<Link
						href="/"
						className="rounded-lg px-4 py-3 font-medium text-foreground/80 transition-colors hover:bg-muted hover:text-primary"
					>
						Home
					</Link>
					{categories.map((category) => (
						<Link
							key={category.slug}
							href={`/blog/${category.slug}`}
							className="rounded-lg px-4 py-3 font-medium text-foreground/80 transition-colors hover:bg-muted hover:text-primary"
						>
							{category.name.replace(/-/g, ' ')}
						</Link>
					))}
				</nav>
			</div>
		</>
	);
}
