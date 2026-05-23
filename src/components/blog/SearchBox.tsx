'use client';

import { useState, useEffect, useCallback } from 'react';
import Fuse from 'fuse.js';
import Link from 'next/link';
import type { BlogSearchPost } from '@/lib/markdown';

interface SearchBoxProps {
	/**
	 * Called when the user clears the search or types nothing.
	 * Pass null to reset to the default listing.
	 */
	onResultsChange: (results: BlogSearchPost[] | null) => void;
}

let fuseInstance: Fuse<BlogSearchPost> | null = null;

async function getOrBuildFuse(): Promise<Fuse<BlogSearchPost>> {
	if (fuseInstance) return fuseInstance;

	const res = await fetch('/_content/post-metadata.json');
	const data = (await res.json()) as {
		posts?: Record<
			string,
			{
				title?: string;
				description?: string;
				searchText?: string;
				tags?: string[];
				category?: string;
				categoryName?: string;
				fullPath?: string;
			}
		>;
	};

	const posts: BlogSearchPost[] = Object.entries(data.posts ?? {}).map(([key, meta]) => {
		const [category = '', ...rest] = key.split('/');
		return {
			slug: rest[rest.length - 1] ?? '',
			category,
			categoryName: meta.categoryName ?? category,
			title: meta.title ?? key,
			...(meta.description ? { description: meta.description } : {}),
			fullPath: rest.join('/'),
			tags: meta.tags ?? [],
			searchText: meta.searchText ?? '',
		} as BlogSearchPost;
	});

	fuseInstance = new Fuse(posts, {
		keys: [
			{ name: 'title', weight: 0.5 },
			{ name: 'description', weight: 0.3 },
			{ name: 'tags', weight: 0.15 },
			{ name: 'searchText', weight: 0.05 },
		],
		threshold: 0.35,
		includeScore: true,
		minMatchCharLength: 2,
	});

	return fuseInstance;
}

export default function SearchBox({ onResultsChange }: SearchBoxProps) {
	const [query, setQuery] = useState('');
	const [loading, setLoading] = useState(false);

	const search = useCallback(
		async (q: string) => {
			if (!q.trim()) {
				onResultsChange(null);
				return;
			}
			setLoading(true);
			try {
				const fuse = await getOrBuildFuse();
				const results = fuse.search(q).map((r) => r.item);
				onResultsChange(results);
			} finally {
				setLoading(false);
			}
		},
		[onResultsChange]
	);

	useEffect(() => {
		const timer = setTimeout(() => void search(query), 180);
		return () => clearTimeout(timer);
	}, [query, search]);

	return (
		<div className="relative">
			<div className="flex items-center gap-2 rounded border border-border bg-card/50 px-3 py-2 transition-colors focus-within:border-primary/60">
				<span className="select-none font-mono text-xs text-muted-foreground">
					{loading ? '…' : '/'}
				</span>
				<input
					type="search"
					value={query}
					onChange={(e) => setQuery(e.target.value)}
					placeholder="search posts…"
					className="min-w-0 flex-1 bg-transparent font-mono text-sm outline-none placeholder:text-muted-foreground/50"
					aria-label="Search blog posts"
					id="blog-search"
				/>
				{query && (
					<button
						type="button"
						onClick={() => setQuery('')}
						className="font-mono text-xs text-muted-foreground hover:text-foreground"
						aria-label="Clear search"
					>
						×
					</button>
				)}
			</div>
		</div>
	);
}

/**
 * Inline search result list — rendered below the SearchBox.
 */
export function SearchResults({ results }: { results: BlogSearchPost[] }) {
	if (results.length === 0) {
		return (
			<p className="py-6 text-center font-mono text-sm text-muted-foreground">no matches found</p>
		);
	}

	return (
		<div className="divide-y divide-border">
			{results.map((post) => (
				<Link
					key={`${post.category}-${post.slug}`}
					href={`/blog/${post.category}/${post.fullPath}`}
					className="group flex flex-col gap-0.5 rounded px-1 py-3 transition-colors hover:bg-muted/30"
				>
					<span className="text-sm font-medium text-foreground transition-colors group-hover:text-primary">
						{post.title}
					</span>
					{post.description && (
						<span className="line-clamp-1 text-xs text-muted-foreground">{post.description}</span>
					)}
					<div className="mt-0.5 flex items-center gap-1.5">
						<span className="font-mono text-[10px] text-primary/70">{post.categoryName}</span>
						{post.tags.slice(0, 3).map((tag) => (
							<span key={tag} className="font-mono text-[10px] text-muted-foreground">
								#{tag}
							</span>
						))}
					</div>
				</Link>
			))}
		</div>
	);
}
