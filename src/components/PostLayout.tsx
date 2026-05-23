import Link from 'next/link';
import MarkdownContent from '@/components/MarkdownContent';
import TableOfContents from '@/components/TableOfContents';
import RelatedPosts from '@/components/blog/RelatedPosts';
import GiscusComments from '@/components/GiscusComments';
import type { Post, AdjacentPosts } from '@/lib/markdown';
import type { Heading } from '@/lib/mdx';

interface SeriesInfo {
	current: number;
	total: number;
	posts: Post[];
}

export default function PostLayout({
	post,
	html,
	headings,
	adjacentPosts,
	relatedPosts,
	seriesInfo,
}: Readonly<{
	post: Post;
	html: string;
	headings: Heading[];
	adjacentPosts?: AdjacentPosts;
	relatedPosts?: Post[];
	seriesInfo?: SeriesInfo;
}>) {
	const showLastUpdated =
		post.lastUpdated &&
		post.date &&
		post.lastUpdated.slice(0, 10) !== new Date(post.date).toISOString().slice(0, 10);
	const hasTableOfContents = headings.length > 0;

	return (
		<div className="lg:grid lg:grid-cols-[minmax(0,1fr)_15rem] lg:items-start lg:gap-16">
			<div className="min-w-0 space-y-8 lg:max-w-3xl">
				{/* Breadcrumb */}
				<nav className="flex items-center gap-1.5 overflow-x-auto font-mono text-xs text-muted-foreground">
					<Link href="/" className="shrink-0 transition-colors hover:text-foreground">
						~
					</Link>
					<span>/</span>
					<Link href="/blog" className="shrink-0 transition-colors hover:text-foreground">
						blog
					</Link>
					<span>/</span>
					<Link
						href={`/blog/${post.categoryName.toLowerCase()}`}
						className="shrink-0 transition-colors hover:text-foreground"
					>
						{post.categoryName.toLowerCase()}
					</Link>
					{post.subcategory && (
						<>
							<span>/</span>
							<span className="truncate text-foreground/50">
								{post.subcategory.split('/').pop()?.toLowerCase()}
							</span>
						</>
					)}
				</nav>

				{/* Series Nav */}
				{seriesInfo && (
					<div className="rounded border border-border bg-card/50 p-3">
						<p className="mb-2 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
							series · part {seriesInfo.current} of {seriesInfo.total} in{' '}
							<Link href={`/blog/${post.category}`} className="text-primary hover:underline">
								{post.categoryName.toLowerCase()}
							</Link>
						</p>
						<div className="flex flex-wrap gap-1">
							{seriesInfo.posts.map((p, i) => (
								<Link
									key={p.fullPath}
									href={`/blog/${p.category}/${p.fullPath}`}
									className={`rounded px-1.5 py-0.5 font-mono text-[10px] transition-all ${
										p.fullPath === post.fullPath
											? 'bg-primary text-primary-foreground'
											: 'border border-border text-muted-foreground hover:border-primary hover:text-foreground'
									}`}
								>
									{i + 1}
								</Link>
							))}
						</div>
					</div>
				)}

				{/* Post Header */}
				<header className="space-y-3 border-b border-border pb-6">
					<div className="flex flex-wrap items-center gap-2">
						<Link
							href={`/blog/${post.category}`}
							className="rounded border border-border px-2 py-0.5 font-mono text-xs text-muted-foreground transition-all hover:border-primary hover:text-primary"
						>
							#{post.categoryName.toLowerCase()}
						</Link>
						{post.tags?.map((t) => (
							<span key={t} className="font-mono text-xs text-muted-foreground/60">
								#{t}
							</span>
						))}
					</div>

					{/* Date + Reading time + Code % */}
					<div className="flex flex-wrap items-center gap-2 font-mono text-xs text-muted-foreground">
						{post.date && (
							<span>
								{new Date(post.date).toLocaleDateString('en-US', {
									year: 'numeric',
									month: 'long',
									day: 'numeric',
								})}
							</span>
						)}
						<span className="text-border">·</span>
						<span>~{post.readingTimeMin} min read</span>
						{post.codePercent > 0 && (
							<>
								<span className="text-border">·</span>
								<span className="text-accent">{post.codePercent}% code</span>
							</>
						)}
						{showLastUpdated && post.lastUpdated && (
							<>
								<span className="text-border">·</span>
								<span className="text-muted-foreground/60">
									updated{' '}
									{new Date(post.lastUpdated).toLocaleDateString('en-US', {
										month: 'short',
										day: 'numeric',
										year: 'numeric',
									})}
								</span>
							</>
						)}
						{post.difficulty && (
							<>
								<span className="text-border">·</span>
								<span className="difficulty-badge" data-level={post.difficulty}>
									{post.difficulty === 'beginner'
										? '○'
										: post.difficulty === 'intermediate'
											? '◑'
											: '●'}{' '}
									{post.difficulty}
								</span>
							</>
						)}
					</div>

					<h1 className="text-xl font-bold leading-tight text-foreground sm:text-2xl">
						{post.title}
					</h1>
					{post.description && (
						<p className="text-sm leading-relaxed text-muted-foreground">{post.description}</p>
					)}
				</header>

				{/* Post Content */}
				<article>
					<MarkdownContent html={html} />
				</article>

				{relatedPosts && relatedPosts.length > 0 && <RelatedPosts posts={relatedPosts} />}

				{/* Navigation: Previous/Next */}
				{adjacentPosts && (adjacentPosts.previous || adjacentPosts.next) && (
					<nav className="border-t border-border pt-6">
						<div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
							<div>
								{adjacentPosts.previous && (
									<Link
										href={`/blog/${post.category}/${adjacentPosts.previous.fullPath}`}
										className="group flex items-start gap-2 rounded border border-border p-3 transition-all hover:border-primary"
									>
										<svg
											className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary transition-transform group-hover:-translate-x-0.5"
											viewBox="0 0 24 24"
											fill="none"
											stroke="currentColor"
											strokeWidth="2"
											strokeLinecap="round"
											strokeLinejoin="round"
										>
											<path d="m15 18-6-6 6-6" />
										</svg>
										<div className="min-w-0">
											<div className="mb-0.5 font-mono text-[10px] text-muted-foreground">prev</div>
											<div className="line-clamp-2 text-xs text-foreground group-hover:text-primary">
												{adjacentPosts.previous.title}
											</div>
										</div>
									</Link>
								)}
							</div>
							<div className="flex justify-end">
								{adjacentPosts.next && (
									<Link
										href={`/blog/${post.category}/${adjacentPosts.next.fullPath}`}
										className="group flex w-full items-start gap-2 rounded border border-border p-3 text-right transition-all hover:border-primary"
									>
										<div className="min-w-0 flex-1">
											<div className="mb-0.5 font-mono text-[10px] text-muted-foreground">next</div>
											<div className="line-clamp-2 text-xs text-foreground group-hover:text-primary">
												{adjacentPosts.next.title}
											</div>
										</div>
										<svg
											className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary transition-transform group-hover:translate-x-0.5"
											viewBox="0 0 24 24"
											fill="none"
											stroke="currentColor"
											strokeWidth="2"
											strokeLinecap="round"
											strokeLinejoin="round"
										>
											<path d="m9 18 6-6-6-6" />
										</svg>
									</Link>
								)}
							</div>
						</div>
					</nav>
				)}

				{/* Back */}
				<div className="border-t border-border pt-5">
					<Link
						href={`/blog/${post.category}`}
						className="font-mono text-xs text-muted-foreground transition-colors hover:text-foreground"
					>
						← back to {post.categoryName.replace(/-/g, ' ').toLowerCase()}
					</Link>
				</div>

				{/* Giscus comments — powered by GitHub Discussions */}
				<GiscusComments
					repo="namaewanam/namaewanam.github.io"
					repoId="R_kgDOQCxDSQ"
					category="Announcements"
					categoryId="DIC_kwDOQCxDSc4C9rol"
					mapping="pathname"
					strict="0"
					reactionsEnabled="1"
					emitMetadata="0"
					inputPosition="bottom"
					lang="en"
				/>
			</div>

			{hasTableOfContents && (
				<div className="hidden self-start lg:sticky lg:top-20 lg:block">
					<TableOfContents headings={headings} />
				</div>
			)}
		</div>
	);
}
