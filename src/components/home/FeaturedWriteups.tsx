import Link from 'next/link';
import type { Post } from '@/lib/markdown';

export default function FeaturedWriteups({
	posts,
}: Readonly<{
	posts: Post[];
}>) {
	return (
		<section className="space-y-4">
			<div className="flex items-baseline justify-between">
				<p className="font-mono text-xs uppercase tracking-widest text-primary">
					selected writeups
				</p>
				<Link
					href="/blog"
					className="font-mono text-xs text-muted-foreground transition-colors hover:text-foreground"
				>
					all →
				</Link>
			</div>

			<div className="space-y-3">
				{posts.map((post) => (
					<Link
						key={`${post.category}-${post.fullPath}`}
						href={`/blog/${post.category}/${post.fullPath}`}
						className="block rounded border border-border bg-card/40 p-4 transition-all hover:border-primary"
					>
						<div className="mb-2 flex flex-wrap items-center gap-2 font-mono text-[10px] text-muted-foreground/70">
							<span>#{post.categoryName.toLowerCase()}</span>
							<span>·</span>
							<span>~{post.readingTimeMin} min</span>
							{post.codePercent > 0 && (
								<>
									<span>·</span>
									<span>{post.codePercent}% code</span>
								</>
							)}
						</div>
						<h3 className="text-base font-semibold text-foreground">{post.title}</h3>
						{post.description && (
							<p className="mt-1 text-sm leading-relaxed text-muted-foreground">
								{post.description}
							</p>
						)}
					</Link>
				))}
			</div>
		</section>
	);
}
