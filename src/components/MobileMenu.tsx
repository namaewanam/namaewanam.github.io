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
				className="p-2 rounded-lg bg-secondary hover:bg-accent/20 transition-colors border border-border"
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
					className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40"
					onClick={() => setIsOpen(false)}
				/>
			)}

			{/* Mobile Menu Panel */}
			<div
				className={`fixed top-[57px] right-0 h-[calc(100vh-57px)] w-64 bg-card border-l border-border z-50 transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'
					}`}
			>
				<nav className="flex flex-col p-4 space-y-2">
					<Link
						href="/"
						className="px-4 py-3 text-foreground/80 hover:text-primary hover:bg-muted rounded-lg transition-colors font-medium"
					>
						Home
					</Link>
					{categories.map((category) => (
						<Link
							key={category.slug}
							href={`/blog/${category.slug}`}
							className="px-4 py-3 text-foreground/80 hover:text-primary hover:bg-muted rounded-lg transition-colors capitalize font-medium"
						>
							{category.name.replace("-", " ")}
						</Link>
					))}
				</nav>
			</div>
		</>
	);
}
