import Link from 'next/link';
import type { BlogSearchPost } from '@/lib/markdown';

export default function BlogResults({
	posts,
	query,
	activeTag,
}: Readonly<{
	posts: BlogSearchPost[];
	query: string;
	activeTag: string;
}>) {
	if (posts.length === 0) {
		return (
			<div className="py-10 text-center font-mono text-sm text-muted-foreground">
				<span className="text-primary">→ </span>
				no results for &ldquo;{query || activeTag}&rdquo;
			</div>
		);
	}

	return (
		<>
			{(query || activeTag) && (
				<p className="mb-3 font-mono text-[10px] text-muted-foreground">
					{posts.length} result{posts.length !== 1 ? 's' : ''}
					{activeTag && (
						<>
							{' '}
							· <span className="text-foreground">#{activeTag}</span>
						</>
					)}
					{query && (
						<>
							{' '}
							· <span className="text-foreground">&ldquo;{query}&rdquo;</span>
						</>
					)}
				</p>
			)}
			<div className="divide-y divide-border">
				{posts.map((post) => (
					<Link
						key={`${post.category}-${post.slug}`}
						href={`/blog/${post.category}/${post.fullPath}`}
						className="group flex flex-col justify-between gap-0.5 py-3 sm:flex-row sm:items-baseline sm:gap-4"
					>
						<div className="min-w-0">
							<span className="block truncate text-sm text-foreground transition-colors group-hover:text-primary">
								{post.title}
							</span>
							{post.description && (
								<span className="block truncate text-xs text-muted-foreground/70">
									{post.description}
								</span>
							)}
						</div>
						<div className="flex shrink-0 items-center gap-2">
							<span className="font-mono text-[10px] text-muted-foreground/50">
								{post.categoryName}
							</span>
							{post.date && (
								<span className="font-mono text-[11px] text-muted-foreground">
									{new Date(post.date).toLocaleDateString('en-US', {
										year: 'numeric',
										month: 'short',
									})}
								</span>
							)}
						</div>
					</Link>
				))}
			</div>
		</>
	);
}
