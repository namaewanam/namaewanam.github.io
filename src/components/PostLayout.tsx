import Link from '@/components/LocalizedLink';
import MarkdownContent from '@/components/MarkdownContent';
import TableOfContents from '@/components/TableOfContents';
import BookmarkButton from '@/components/blog/BookmarkButton';
import PostReactions from '@/components/blog/PostReactions';
import RelatedPosts from '@/components/blog/RelatedPosts';
import ShareButtons from '@/components/blog/ShareButtons';
import QuoteToShareTooltip from '@/components/blog/QuoteToShareTooltip';
import GiscusComments from '@/components/GiscusComments';
import { features } from '@/lib/features';
import { GISCUS_REPO, GISCUS_REPO_ID, GISCUS_CATEGORY, GISCUS_CATEGORY_ID } from '@/lib/site';
import type { Post, AdjacentPosts } from '@/lib/markdown';
import type { Heading } from '@/lib/mdx';

interface SeriesInfo {
	current: number;
	total: number;
	posts: Post[];
}

const DIFFICULTY_ICONS: Record<string, string> = {
	beginner: '○',
	intermediate: '◑',
	advanced: '●',
};

function getSeriesPrefix(isPractice: boolean, isVi: boolean): string {
	if (isPractice) {
		return isVi ? 'thực hành · series ' : 'practice · series ';
	}
	return isVi ? 'series · phần ' : 'series · part ';
}

function getPrevNavLabel(isPrevTheory: boolean, isVi: boolean): string {
	if (isPrevTheory) {
		return isVi ? '← bài lý thuyết' : '← theory post';
	}
	return isVi ? '← trước' : 'prev';
}

function getSeriesPillClassName(isCurrent: boolean, isPractice: boolean): string {
	if (isCurrent) return 'bg-primary text-primary-foreground font-semibold';
	if (isPractice) return 'border border-primary/40 text-primary hover:bg-primary/10';
	return 'border border-border text-muted-foreground hover:border-primary hover:text-foreground';
}

export default function PostLayout({
	post,
	html,
	headings,
	adjacentPosts,
	relatedPosts,
	seriesInfo,
	requestedLang,
	practicePost,
	theoryPost,
}: Readonly<{
	post: Post;
	html: string;
	headings: Heading[];
	adjacentPosts?: AdjacentPosts;
	relatedPosts?: Post[];
	seriesInfo?: SeriesInfo;
	requestedLang?: string;
	practicePost?: Post | null;
	theoryPost?: Post | null;
}>) {
	const isVi = (requestedLang ?? post.lang) === 'vi';
	const isPractice = post.type === 'practice' || Boolean(post.practiceFor);
	const seriesPrefix = getSeriesPrefix(isPractice, isVi);
	let seriesStep = `${seriesInfo?.current ?? 1} / ${seriesInfo?.total ?? 1}`;
	if (isPractice) {
		seriesStep = theoryPost?.order !== undefined ? `[lab ${theoryPost.order}]` : '[lab]';
	}

	const isPrevTheory = adjacentPosts?.previous?.fullPath === theoryPost?.fullPath;
	const prevLabel = getPrevNavLabel(isPrevTheory, isVi);

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
							{seriesPrefix}
							{seriesStep} {isVi ? 'trong' : 'in'}{' '}
							<Link href={`/blog/${post.category}`} className="text-primary hover:underline">
								{post.categoryName.toLowerCase()}
							</Link>
						</p>
						<div className="flex flex-wrap gap-1">
							{seriesInfo.posts.map((p, i) => {
								const isP = p.type === 'practice' || Boolean(p.practiceFor);
								const pillClass = getSeriesPillClassName(p.fullPath === post.fullPath, isP);
								return (
									<Link
										key={p.fullPath}
										href={`/blog/${p.category}/${p.fullPath}`}
										title={p.title}
										className={`rounded px-1.5 py-0.5 font-mono text-[10px] transition-all ${pillClass}`}
									>
										{isP ? `P${p.order ?? i + 1}` : i + 1}
									</Link>
								);
							})}
						</div>
					</div>
				)}

				{requestedLang && post.lang !== requestedLang && (
					<div className="rounded border border-border/80 bg-card/60 px-3.5 py-2.5 font-mono text-xs text-muted-foreground">
						<span className="text-primary">ℹ </span>
						{requestedLang === 'en'
							? 'This article is currently only available in Vietnamese.'
							: 'Bài viết này hiện chỉ có bản tiếng Anh.'}
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
						{(post.type === 'practice' || post.practiceFor) && (
							<span className="rounded border border-primary/40 bg-primary/10 px-2 py-0.5 font-mono text-xs font-semibold text-primary">
								{isVi ? '🧪 THỰC HÀNH' : '🧪 PRACTICE LAB'}
							</span>
						)}
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
									{DIFFICULTY_ICONS[post.difficulty] ?? '○'} {post.difficulty}
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

				{/* Practice Post Context Banner */}
				{theoryPost && (
					<div className="rounded border border-primary/30 bg-primary/5 px-3.5 py-2.5 font-mono text-xs text-muted-foreground">
						<span className="font-semibold text-primary">
							🧪 {isVi ? 'Lab Thực hành' : 'Practice Lab'}:{' '}
						</span>
						<span>
							{isVi
								? 'Bài viết này là phần thực hành code và ghi chú cho bài '
								: 'This is a hands-on coding and lab companion for '}
							<Link
								href={`/blog/${theoryPost.category}/${theoryPost.fullPath}`}
								className="text-primary underline hover:text-primary/80"
							>
								{theoryPost.title}
							</Link>
						</span>
					</div>
				)}

				{/* Post Content */}
				<article>
					<MarkdownContent html={html} />
				</article>
				<QuoteToShareTooltip articleTitle={post.title} />

				{/* Post Interactions: share, reactions, bookmark */}
				{(features.shareButtons || features.postReactions || features.readingList) && (
					<div className="flex flex-wrap items-center gap-4 border-t border-border pt-5">
						{features.shareButtons && <ShareButtons title={post.title} />}
						{features.postReactions && <PostReactions slug={`${post.category}/${post.fullPath}`} />}
						{features.readingList && (
							<BookmarkButton slug={`${post.category}/${post.fullPath}`} size="md" />
						)}
					</div>
				)}

				{features.relatedPosts && relatedPosts && relatedPosts.length > 0 && (
					<RelatedPosts posts={relatedPosts} />
				)}

				{/* Practice Lab Callout Card (Option B) */}
				{practicePost && (
					<div className="rounded-lg border border-primary/30 bg-primary/5 p-4 transition-all hover:border-primary/50 sm:p-5">
						<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
							<div className="min-w-0 space-y-1.5">
								<div className="flex items-center gap-2">
									<span className="inline-flex items-center gap-1 rounded border border-primary/20 bg-primary/10 px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wider text-primary">
										<svg
											className="h-3 w-3"
											viewBox="0 0 24 24"
											fill="none"
											stroke="currentColor"
											strokeWidth="2"
											strokeLinecap="round"
											strokeLinejoin="round"
										>
											<path d="M10 2v7.31M14 9.3V1.99M8.5 2h7M14 9.3a6.5 6.5 0 1 1-4 0" />
										</svg>
										{isVi ? 'Bài thực hành / Lab' : 'Hands-on Practice Lab'}
									</span>
									<span className="font-mono text-[11px] text-muted-foreground">
										~{practicePost.readingTimeMin} min read
										{practicePost.codePercent > 0 && ` · ${practicePost.codePercent}% code`}
									</span>
								</div>
								<h3 className="text-sm font-semibold text-foreground sm:text-base">
									{practicePost.title}
								</h3>
								{practicePost.description && (
									<p className="line-clamp-2 text-xs leading-relaxed text-muted-foreground">
										{practicePost.description}
									</p>
								)}
							</div>
							<Link
								href={`/blog/${practicePost.category}/${practicePost.fullPath}`}
								className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded border border-primary bg-primary px-3.5 py-2 font-mono text-xs font-medium text-primary-foreground transition-all hover:bg-primary/90"
							>
								<span>{isVi ? 'Làm bài Lab' : 'Start Practice'}</span>
								<svg
									className="h-3.5 w-3.5"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									strokeWidth="2"
									strokeLinecap="round"
									strokeLinejoin="round"
								>
									<path d="M5 12h14M12 5l7 7-7 7" />
								</svg>
							</Link>
						</div>
					</div>
				)}

				{/* Companion Theory Post Callout Card */}
				{theoryPost && (
					<div className="rounded-lg border border-border bg-card/60 p-4 transition-all hover:border-primary/40">
						<div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
							<div className="min-w-0 space-y-1">
								<div className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
									<span className="font-medium text-primary">
										{isVi ? '📖 Bài lý thuyết gốc' : '📖 Companion Theory Post'}
									</span>
								</div>
								<p className="line-clamp-1 text-xs font-medium text-foreground">
									{theoryPost.title}
								</p>
							</div>
							<Link
								href={`/blog/${theoryPost.category}/${theoryPost.fullPath}`}
								className="inline-flex shrink-0 items-center gap-1 font-mono text-xs text-primary transition-colors hover:underline"
							>
								<span>{isVi ? '← Xem lại bài lý thuyết' : '← Back to Theory'}</span>
							</Link>
						</div>
					</div>
				)}

				{/* Navigation: Previous/Next */}
				{adjacentPosts && (adjacentPosts.previous || adjacentPosts.next) && (
					<nav className="border-t border-border pt-6">
						<div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
							<div>
								{adjacentPosts.previous && (
									<Link
										id="post-nav-prev"
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
											<div className="mb-0.5 font-mono text-[10px] text-muted-foreground">
												{prevLabel}
											</div>
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
										id="post-nav-next"
										href={`/blog/${post.category}/${adjacentPosts.next.fullPath}`}
										className="group flex w-full items-start gap-2 rounded border border-border p-3 text-right transition-all hover:border-primary"
									>
										<div className="min-w-0 flex-1">
											<div className="mb-0.5 font-mono text-[10px] text-muted-foreground">
												{isVi ? 'tiếp theo →' : 'next →'}
											</div>
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
				{features.comments && GISCUS_REPO && GISCUS_REPO_ID && GISCUS_CATEGORY_ID && (
					<GiscusComments
						repo={GISCUS_REPO}
						repoId={GISCUS_REPO_ID}
						category={GISCUS_CATEGORY}
						categoryId={GISCUS_CATEGORY_ID}
						mapping="pathname"
						strict="0"
						reactionsEnabled="1"
						emitMetadata="0"
						inputPosition="bottom"
						lang="en"
					/>
				)}
			</div>

			{features.tableOfContents && hasTableOfContents && (
				<div className="hidden self-start lg:sticky lg:top-20 lg:block">
					<TableOfContents headings={headings} />
				</div>
			)}
		</div>
	);
}
