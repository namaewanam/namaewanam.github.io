import Link from '@/components/LocalizedLink';
import type { BlogSearchPost } from '@/lib/markdown';

interface BlogResultsProps {
	posts: BlogSearchPost[];
	query: string;
	activeTag: string;
	isVi?: boolean;
	popularTags?: { tag: string; count: number }[];
	onSelectTag?: (tag: string) => void;
	onReset?: () => void;
}

export default function BlogResults({
	posts,
	query,
	activeTag,
	isVi = false,
	popularTags = [],
	onSelectTag,
	onReset,
}: Readonly<BlogResultsProps>) {
	if (posts.length === 0) {
		const currentFilter = query || activeTag || (isVi ? 'bộ lọc hiện tại' : 'current filter');

		return (
			<div
				role="status"
				aria-live="polite"
				className="flex flex-col items-center gap-4 rounded-xl border border-dashed border-border/80 bg-card/30 px-6 py-12 text-center font-mono"
			>
				<div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
					<span className="text-lg" aria-hidden="true">
						⌕
					</span>
				</div>
				<div className="space-y-1">
					<p className="text-sm text-foreground">
						{isVi
							? `Không tìm thấy bài viết nào cho "${currentFilter}"`
							: `No articles found matching "${currentFilter}"`}
					</p>
					<p className="text-xs text-muted-foreground">
						{isVi
							? 'Hãy thử tìm kiếm với từ khóa khác hoặc duyệt theo các thẻ gợi ý bên dưới.'
							: 'Try a different search query or explore one of the popular topics below.'}
					</p>
				</div>

				{popularTags.length > 0 && (
					<div className="flex flex-wrap items-center justify-center gap-1.5 pt-1">
						{popularTags.map(({ tag }) => (
							<button
								key={tag}
								type="button"
								onClick={() => onSelectTag?.(tag)}
								className="rounded border border-border bg-background/60 px-2.5 py-1 text-xs text-muted-foreground transition-all hover:border-primary hover:text-primary focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
							>
								#{tag}
							</button>
						))}
					</div>
				)}

				<div className="pt-2">
					{onReset ? (
						<button
							type="button"
							onClick={onReset}
							className="inline-flex min-h-[40px] items-center justify-center rounded border border-border px-4 py-1.5 text-xs text-muted-foreground transition-all hover:border-primary hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
						>
							{isVi ? '← Xem tất cả bài viết' : '← Reset filter & view all'}
						</button>
					) : (
						<Link
							href="/blog"
							className="inline-flex min-h-[40px] items-center justify-center rounded border border-border px-4 py-1.5 text-xs text-muted-foreground transition-all hover:border-primary hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
						>
							{isVi ? '← Xem tất cả bài viết' : '← Reset filter & view all'}
						</Link>
					)}
				</div>
			</div>
		);
	}

	const englishResultText = `${posts.length} ${posts.length === 1 ? 'result' : 'results'}`;
	const resultText = isVi ? `${posts.length} kết quả` : englishResultText;

	return (
		<>
			{(query || activeTag) && (
				<p
					aria-live="polite"
					aria-atomic="true"
					className="mb-3 font-mono text-[10px] text-muted-foreground"
				>
					{resultText}
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
									{new Date(post.date).toLocaleDateString(
										isVi || post.lang === 'vi' ? 'vi-VN' : 'en-US',
										{
											year: 'numeric',
											month: 'short',
										}
									)}
								</span>
							)}
						</div>
					</Link>
				))}
			</div>
		</>
	);
}
