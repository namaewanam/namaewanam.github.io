import Link from 'next/link';
import type { Post } from '@/lib/markdown';
import type { SeriesMetadata } from '@/lib/markdown';

export default function SeriesLanding({
	categorySlug,
	categoryName,
	posts,
	seriesMetadata,
	seriesHtml,
}: Readonly<{
	categorySlug: string;
	categoryName: string;
	posts: Post[];
	seriesMetadata?: SeriesMetadata | null;
	seriesHtml?: string;
}>) {
	const totalMinutes = posts.reduce((sum, post) => sum + post.readingTimeMin, 0);
	const groupedBySubcategory = posts.reduce(
		(acc, post) => {
			const key = post.subcategory || 'root';
			if (!acc[key]) acc[key] = [];
			acc[key].push(post);
			return acc;
		},
		{} as Record<string, Post[]>
	);

	return (
		<section className="space-y-5 rounded border border-border bg-card/40 p-4 sm:p-5">
			<div className="space-y-2">
				<p className="font-mono text-[10px] uppercase tracking-widest text-primary">
					series landing
				</p>
				<h2 className="text-lg font-semibold text-foreground sm:text-xl">
					{seriesMetadata?.title ?? categoryName.replace(/-/g, ' ')}
				</h2>
				{seriesMetadata?.description ? (
					<p className="max-w-xl text-sm leading-relaxed text-muted-foreground">
						{seriesMetadata.description}
					</p>
				) : (
					<p className="max-w-xl text-sm leading-relaxed text-muted-foreground">
						A compact map of this topic: browse parts in order, jump into a subtopic, and estimate
						total reading time before diving in.
					</p>
				)}
			</div>

			<div className="flex flex-wrap gap-2 font-mono text-[11px] text-muted-foreground">
				<span className="rounded border border-border px-2 py-0.5">
					{posts.length} part{posts.length !== 1 ? 's' : ''}
				</span>
				<span className="rounded border border-border px-2 py-0.5">~{totalMinutes} min total</span>
				<span className="rounded border border-border px-2 py-0.5">/{categorySlug}</span>
			</div>

			<div className="rounded border border-border/70 bg-background/40 p-3">
				{seriesHtml ? (
					<div
						className="prose prose-sm max-w-none prose-p:my-2 prose-p:text-foreground/80 prose-a:text-accent prose-a:no-underline hover:prose-a:underline prose-strong:text-foreground prose-code:rounded prose-code:bg-muted/80 prose-code:px-1 prose-code:py-0.5 prose-code:font-mono prose-code:text-[12px] prose-code:before:content-none prose-code:after:content-none"
						dangerouslySetInnerHTML={{ __html: seriesHtml }}
					/>
				) : (
					<p className="text-sm leading-relaxed text-muted-foreground">
						No dedicated series note yet. For now, this page acts as the map: start at part 1,
						follow the order, and dip into subtopics when needed.
					</p>
				)}
			</div>

			<div className="space-y-5">
				{Object.entries(groupedBySubcategory).map(([subcategory, groupPosts]) => (
					<div key={subcategory} className="space-y-2">
						<p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground/70">
							{subcategory === 'root'
								? 'overview'
								: subcategory
										.split('/')
										.map((part) => part.replace(/-/g, ' '))
										.join(' / ')}
						</p>
						<div className="space-y-1.5">
							{groupPosts.map((post, index) => (
								<Link
									key={post.fullPath}
									href={`/blog/${categorySlug}/${post.fullPath}`}
									className="flex items-center justify-between gap-4 rounded border border-transparent px-2 py-1.5 transition-all hover:border-border hover:bg-background/60"
								>
									<span className="min-w-0 truncate text-sm text-foreground">
										<span className="mr-2 font-mono text-xs text-muted-foreground">
											{String(post.order ?? index + 1).padStart(2, '0')}.
										</span>
										{post.title}
									</span>
									<span className="shrink-0 font-mono text-[10px] text-muted-foreground/70">
										~{post.readingTimeMin}m
									</span>
								</Link>
							))}
						</div>
					</div>
				))}
			</div>
		</section>
	);
}
