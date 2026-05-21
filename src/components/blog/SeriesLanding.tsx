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
	const normalizeReference = (reference: string) =>
		reference
			.replace(/\.md$/i, '')
			.replace(/^\/+|\/+$/g, '')
			.toLowerCase();
	const resolveReference = (reference?: string) =>
		reference
			? (posts.find(
					(post) =>
						post.fullPath.toLowerCase() === normalizeReference(reference) ||
						post.slug.toLowerCase() === normalizeReference(reference)
				) ?? null)
			: null;
	const startHerePost = resolveReference(seriesMetadata?.startHere) ?? posts[0] ?? null;
	const nextRecommendedPost =
		resolveReference(seriesMetadata?.nextRecommended) ??
		posts.find((post) => post.fullPath !== startHerePost?.fullPath) ??
		null;
	const prerequisites = seriesMetadata?.prerequisites ?? [];
	const youWillUnderstand = seriesMetadata?.youWillUnderstand ?? [];
	const useItFor = seriesMetadata?.useItFor ?? [];
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

			<div className="grid gap-3 sm:grid-cols-2">
				<div className="space-y-2 rounded border border-border/70 bg-background/40 p-3">
					<p className="font-mono text-[10px] uppercase tracking-wider text-primary">
						reading path
					</p>
					<div className="space-y-2 text-sm">
						{startHerePost && (
							<Link
								href={`/blog/${categorySlug}/${startHerePost.fullPath}`}
								className="block rounded border border-border/70 px-2.5 py-2 transition-all hover:border-primary hover:bg-card/50"
							>
								<span className="block font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
									start here
								</span>
								<span className="mt-1 block text-foreground">{startHerePost.title}</span>
							</Link>
						)}
						{nextRecommendedPost && (
							<Link
								href={`/blog/${categorySlug}/${nextRecommendedPost.fullPath}`}
								className="block rounded border border-border/70 px-2.5 py-2 transition-all hover:border-primary hover:bg-card/50"
							>
								<span className="block font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
									next recommended
								</span>
								<span className="mt-1 block text-foreground">{nextRecommendedPost.title}</span>
							</Link>
						)}
					</div>
				</div>

				<div className="space-y-2 rounded border border-border/70 bg-background/40 p-3">
					<p className="font-mono text-[10px] uppercase tracking-wider text-primary">on-ramp</p>
					<div className="space-y-2 text-sm text-muted-foreground">
						<p>
							<span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground/70">
								difficulty
							</span>
							<span className="mt-1 block text-foreground">
								{seriesMetadata?.difficulty ?? 'Approachable if you already speak the basics.'}
							</span>
						</p>
						<div>
							<p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground/70">
								prerequisites
							</p>
							<div className="mt-1 flex flex-wrap gap-1.5">
								{prerequisites.length > 0 ? (
									prerequisites.map((item) => (
										<span
											key={item}
											className="rounded border border-border px-2 py-0.5 font-mono text-[10px] text-foreground/80"
										>
											{item}
										</span>
									))
								) : (
									<span className="text-sm text-foreground/80">
										Basic backend instincts and a willingness to follow the thread.
									</span>
								)}
							</div>
						</div>
						{(youWillUnderstand.length > 0 || useItFor.length > 0) && (
							<div className="space-y-2 border-t border-border/60 pt-2">
								<p className="font-mono text-[10px] uppercase tracking-wider text-primary">
									estimated payoff
								</p>
								{youWillUnderstand.length > 0 && (
									<div>
										<p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground/70">
											you&apos;ll understand
										</p>
										<div className="mt-1 flex flex-wrap gap-1.5">
											{youWillUnderstand.map((item) => (
												<span
													key={item}
													className="rounded border border-border px-2 py-0.5 font-mono text-[10px] text-foreground/80"
												>
													{item}
												</span>
											))}
										</div>
									</div>
								)}
								{useItFor.length > 0 && (
									<div>
										<p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground/70">
											use it for
										</p>
										<div className="mt-1 flex flex-wrap gap-1.5">
											{useItFor.map((item) => (
												<span
													key={item}
													className="rounded border border-border px-2 py-0.5 font-mono text-[10px] text-foreground/80"
												>
													{item}
												</span>
											))}
										</div>
									</div>
								)}
							</div>
						)}
					</div>
				</div>
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
