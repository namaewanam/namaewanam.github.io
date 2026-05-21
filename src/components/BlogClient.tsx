'use client';

import { useDeferredValue, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import type { BlogSearchPost, Category } from '@/lib/markdown';
import BlogResults from '@/components/blog/BlogResults';
import BlogRssBadge from '@/components/blog/BlogRssBadge';
import BlogSearchInput from '@/components/blog/BlogSearchInput';

interface BlogClientProps {
	posts: BlogSearchPost[];
	categories: Category[];
	allTags: { tag: string; count: number }[];
}

export default function BlogClient({ posts, categories, allTags }: BlogClientProps) {
	const [query, setQuery] = useState('');
	const [activeTag, setActiveTag] = useState('');
	const searchRef = useRef<HTMLInputElement>(null);
	const deferredQuery = useDeferredValue(query);

	useEffect(() => {
		const handleKeydown = (event: KeyboardEvent) => {
			if (event.defaultPrevented) return;
			const target = event.target as HTMLElement | null;
			const isTypingField =
				target instanceof HTMLInputElement ||
				target instanceof HTMLTextAreaElement ||
				target?.isContentEditable;

			if (isTypingField || event.metaKey || event.ctrlKey || event.altKey) return;
			if (event.key !== '/') return;

			event.preventDefault();
			searchRef.current?.focus();
		};

		window.addEventListener('keydown', handleKeydown);
		return () => window.removeEventListener('keydown', handleKeydown);
	}, []);

	const filtered = useMemo(() => {
		const q = deferredQuery.toLowerCase().trim();
		const tag = activeTag.toLowerCase();

		return posts.filter((post) => {
			const matchTag = !tag || post.tags?.includes(tag) || post.category === tag;
			const matchSearch = !q || post.searchText.includes(q);
			return matchTag && matchSearch;
		});
	}, [activeTag, deferredQuery, posts]);

	return (
		<div className="space-y-8">
			{/* Header */}
			<div className="space-y-3">
				<div className="space-y-1">
					<p className="font-mono text-xs uppercase tracking-widest text-primary">blog</p>
					<h1 className="text-xl font-bold text-foreground sm:text-2xl">Writing</h1>
					<p className="text-xs text-muted-foreground sm:text-sm">
						{posts.length} articles · {categories.length} topics
					</p>
				</div>
				<BlogRssBadge />
			</div>

			{/* Search */}
			<BlogSearchInput
				ref={searchRef}
				query={query}
				activeTag={activeTag}
				onQueryChange={(value) => {
					setQuery(value);
					setActiveTag('');
				}}
				onClear={() => {
					setQuery('');
					setActiveTag('');
				}}
			/>

			{/* Tags */}
			<div className="space-y-2">
				<p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
					#tags
				</p>
				<div className="flex flex-wrap gap-1.5">
					{allTags.map(({ tag, count }) => (
						<button
							key={tag}
							type="button"
							onClick={() => {
								setActiveTag(activeTag === tag ? '' : tag);
								setQuery('');
							}}
							className={`rounded border px-2 py-0.5 font-mono text-[11px] transition-all ${
								activeTag === tag
									? 'border-primary bg-primary text-primary-foreground'
									: 'border-border text-muted-foreground hover:border-primary hover:text-foreground'
							}`}
						>
							#{tag}
							<span className={`ml-1 ${activeTag === tag ? 'opacity-70' : 'opacity-50'}`}>
								{count}
							</span>
						</button>
					))}
				</div>
			</div>

			{/* Categories */}
			<div className="space-y-2 border-b border-border pb-6">
				<p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
					directories
				</p>
				<div className="grid gap-2 sm:grid-cols-2">
					{categories.map((cat) => (
						<article
							key={cat.slug}
							className="rounded border border-border bg-card/30 px-3 py-2 transition-all hover:border-accent hover:bg-card/60"
						>
							<div className="flex items-baseline justify-between gap-3">
								<Link
									href={`/blog/${cat.slug}`}
									className="font-mono text-[11px] text-foreground transition-colors hover:text-primary"
								>
									/{cat.slug}
								</Link>
								<span className="font-mono text-[10px] text-muted-foreground">
									{cat.count} {cat.count === 1 ? 'post' : 'posts'}
								</span>
							</div>
							<p className="mt-1 text-xs leading-relaxed text-muted-foreground">
								{cat.description}
							</p>
							{cat.startHere && (
								<Link
									href={`/blog/${cat.slug}/${cat.startHere.fullPath}`}
									className="mt-2 inline-flex items-center gap-1 font-mono text-[10px] text-muted-foreground transition-colors hover:text-foreground"
								>
									start here →<span className="text-foreground">{cat.startHere.title}</span>
								</Link>
							)}
						</article>
					))}
				</div>
			</div>

			{/* Results */}
			<div>
				<BlogResults posts={filtered} query={query} activeTag={activeTag} />
			</div>
		</div>
	);
}
