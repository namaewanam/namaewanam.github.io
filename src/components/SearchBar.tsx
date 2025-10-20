'use client';

import { useState, useEffect, useRef } from 'react';
import { Search, X } from 'lucide-react';
import Link from 'next/link';

interface Post {
	title: string;
	category: string;
	categoryName: string;
	description?: string;
	fullPath: string;
}

interface SearchResult {
	title: string;
	category: string;
	categoryName: string;
	description?: string;
	url: string;
}

export default function SearchBar() {
	const [query, setQuery] = useState('');
	const [results, setResults] = useState<SearchResult[]>([]);
	const [isOpen, setIsOpen] = useState(false);
	const [allPosts, setAllPosts] = useState<Post[]>([]);
	const searchRef = useRef<HTMLDivElement>(null);

	// Load all posts on mount
	useEffect(() => {
		// Fetch posts data (we'll need to expose this)
		fetch('/posts.json')
			.then((res) => res.json())
			.then((data) => setAllPosts(data))
			.catch((err) => console.error('Failed to load posts:', err));
	}, []);

	// Close dropdown when clicking outside
	useEffect(() => {
		function handleClickOutside(event: MouseEvent) {
			if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
				setIsOpen(false);
			}
		}

		document.addEventListener('mousedown', handleClickOutside);
		return () => document.removeEventListener('mousedown', handleClickOutside);
	}, []);

	// Search functionality - client-side
	useEffect(() => {
		if (query.trim().length < 2) {
			setResults([]);
			setIsOpen(false);
			return;
		}

		const searchQuery = query.toLowerCase();

		// Filter posts based on query
		const filtered = allPosts
			.filter((post) => {
				const titleMatch = post.title.toLowerCase().includes(searchQuery);
				const descriptionMatch = post.description?.toLowerCase().includes(searchQuery);
				const categoryMatch = post.categoryName.toLowerCase().includes(searchQuery);

				return titleMatch || descriptionMatch || categoryMatch;
			})
			.slice(0, 10) // Limit to 10 results
			.map((post) => ({
				title: post.title,
				category: post.category,
				categoryName: post.categoryName,
				description: post.description,
				url: `/blog/${post.category}/${post.fullPath}`,
			}));

		setResults(filtered);
		setIsOpen(filtered.length > 0 || query.trim().length >= 2);
	}, [query, allPosts]);

	const handleClear = () => {
		setQuery('');
		setResults([]);
		setIsOpen(false);
	};

	const handleResultClick = () => {
		setIsOpen(false);
		setQuery('');
	};

	return (
		<div className="relative w-full" ref={searchRef}>
			<div className="relative">
				<Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
				<input
					type="text"
					value={query}
					onChange={(e) => setQuery(e.target.value)}
					placeholder="Search articles..."
					className="w-full rounded-lg border border-border bg-background py-2 pl-10 pr-10 text-sm transition-all focus:outline-none focus:ring-2 focus:ring-primary"
				/>
				{query && (
					<button
						onClick={handleClear}
						className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
					>
						<X className="h-4 w-4" />
					</button>
				)}
			</div>

			{/* Search Results Dropdown */}
			{isOpen && results.length > 0 && (
				<div className="absolute top-full z-50 mt-2 max-h-96 w-full overflow-y-auto rounded-lg border border-border bg-card shadow-lg">
					{results.map((result, index) => (
						<Link
							key={index}
							href={result.url}
							onClick={handleResultClick}
							className="block border-b border-border p-3 transition-colors last:border-b-0 hover:bg-muted"
						>
							<div className="flex items-start gap-2">
								<div className="min-w-0 flex-1">
									<div className="mb-1 truncate text-sm font-semibold text-foreground">
										{result.title}
									</div>
									{result.description && (
										<div className="line-clamp-2 text-xs text-muted-foreground">
											{result.description}
										</div>
									)}
									<div className="mt-1 text-xs text-primary">
										{result.categoryName.replaceAll('-', ' ')}
									</div>
								</div>
							</div>
						</Link>
					))}
				</div>
			)}

			{/* No Results */}
			{isOpen && query.trim().length >= 2 && results.length === 0 && (
				<div className="absolute top-full z-50 mt-2 w-full rounded-lg border border-border bg-card p-4 shadow-lg">
					<p className="text-center text-sm text-muted-foreground">
						No results found for "{query}"
					</p>
				</div>
			)}
		</div>
	);
}
