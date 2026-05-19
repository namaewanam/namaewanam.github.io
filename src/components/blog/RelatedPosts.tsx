import Link from 'next/link';
import type { Post } from '@/lib/markdown';

export default function RelatedPosts({
	posts,
}: Readonly<{
	posts: Post[];
}>) {
	if (posts.length === 0) return null;

	return (
		<section className="border-t border-border pt-6">
			<div className="mb-4 space-y-1">
				<p className="font-mono text-[10px] uppercase tracking-wider text-primary">related posts</p>
				<p className="text-sm text-muted-foreground">
					More from the same neighborhood: shared tags, same lane, nearby ideas.
				</p>
			</div>

			<div className="grid gap-3 sm:grid-cols-2">
				{posts.map((post) => (
					<Link
						key={`${post.category}-${post.fullPath}`}
						href={`/blog/${post.category}/${post.fullPath}`}
						className="group rounded border border-border bg-card/30 p-3 transition-all hover:border-primary hover:bg-card/60"
					>
						<div className="mb-2 flex flex-wrap items-center gap-2 font-mono text-[10px] text-muted-foreground/70">
							<span>#{post.categoryName.toLowerCase()}</span>
							<span>·</span>
							<span>~{post.readingTimeMin} min</span>
						</div>
						<h3 className="text-sm font-semibold text-foreground transition-colors group-hover:text-primary">
							{post.title}
						</h3>
						{post.description && (
							<p className="mt-1 text-xs leading-relaxed text-muted-foreground">
								{post.description}
							</p>
						)}
					</Link>
				))}
			</div>
		</section>
	);
}
