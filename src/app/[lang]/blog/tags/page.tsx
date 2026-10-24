import type { Metadata } from 'next';
import Link from '@/components/LocalizedLink';
import { SITE_NAME, SITE_URL } from '@/lib/site';
import { getAllPosts, getAllTags } from '@/lib/markdown';

export async function generateMetadata({
	params,
}: {
	params: Promise<{ lang: string }>;
}): Promise<Metadata> {
	const { lang } = await params;
	const isVi = lang === 'vi';
	return {
		metadataBase: new URL(SITE_URL),
		title: `${isVi ? 'Thẻ' : 'tags'} · ${SITE_NAME}`,
		description: isVi ? 'Duyệt tất cả bài viết theo thẻ tag.' : 'Browse all blog posts by tags.',
	};
}

function formatTagPostCount(count: number, isVi: boolean): string {
	if (isVi) {
		return `${count} bài viết`;
	}
	return `${count} ${count === 1 ? 'post' : 'posts'}`;
}

export function generateStaticParams() {
	return [{ lang: 'en' }, { lang: 'vi' }];
}
export default async function TagsPage({ params }: { params: Promise<{ lang: string }> }) {
	const resolvedParams = await params;
	const lang = resolvedParams.lang;
	const isVi = lang === 'vi';
	const dateLocale = isVi ? 'vi-VN' : 'en-US';
	const tags = getAllTags(lang);
	const posts = getAllPosts(lang);

	// Build a map of tag -> posts
	const postsByTag = new Map<string, typeof posts>();
	tags.forEach((t) => postsByTag.set(t.tag, []));

	posts.forEach((post) => {
		post.tags?.forEach((tag) => {
			if (postsByTag.has(tag)) {
				postsByTag.get(tag)!.push(post);
			}
		});
		// Also index by category if not already tagged
		if (postsByTag.has(post.category) && !post.tags?.includes(post.category)) {
			postsByTag.get(post.category)!.push(post);
		}
	});

	return (
		<div className="mx-auto w-full max-w-3xl space-y-12">
			<section className="space-y-4">
				<div className="space-y-2">
					<p className="font-mono text-xs uppercase tracking-widest text-primary">
						{isVi ? 'khám phá' : 'browse'}
					</p>
					<h1 className="text-2xl font-bold text-foreground">{isVi ? 'Tất cả thẻ' : 'All Tags'}</h1>
					<p className="text-sm leading-relaxed text-muted-foreground">
						{isVi ? 'Khám phá bài viết theo từng chủ đề.' : 'Explore posts across all topics.'}
					</p>
				</div>

				{/* Tag cloud */}
				<div className="flex flex-wrap gap-2 pt-4">
					{tags.map((t) => (
						<a
							key={t.tag}
							href={`#${t.tag}`}
							className="rounded border border-border px-2 py-0.5 font-mono text-[11px] text-foreground/80 transition-colors hover:border-primary hover:text-primary"
						>
							#{t.tag}
							<span className="ml-1.5 text-muted-foreground">{t.count}</span>
						</a>
					))}
				</div>
			</section>

			<hr className="border-border" />

			{/* Posts grouped by tag */}
			<div className="space-y-12">
				{tags.map((t) => {
					const tagPosts = postsByTag.get(t.tag) || [];
					if (tagPosts.length === 0) return null;

					return (
						<section key={t.tag} id={t.tag} className="scroll-mt-20 space-y-4">
							<div className="flex items-baseline gap-2 border-b border-border/50 pb-2">
								<h2 className="font-mono text-lg font-semibold text-foreground">#{t.tag}</h2>
								<span className="font-mono text-xs text-muted-foreground">
									{formatTagPostCount(t.count, isVi)}
								</span>
							</div>

							<div className="grid gap-3 pt-2 sm:grid-cols-2">
								{tagPosts.map((post) => (
									<Link
										key={`${post.category}-${post.slug}`}
										href={`/blog/${post.category}/${post.fullPath}`}
										className="group flex flex-col justify-center space-y-1 rounded border border-border/50 bg-card/20 p-3 transition-colors hover:border-primary/50 hover:bg-card/40"
									>
										<span className="line-clamp-2 text-sm font-medium text-foreground transition-colors group-hover:text-primary">
											{post.title}
										</span>
										<div className="flex items-center gap-2 font-mono text-[10px] text-muted-foreground">
											<span className="uppercase">{post.categoryName}</span>
											{post.date && (
												<>
													<span>·</span>
													<span>
														{new Date(post.date).toLocaleDateString(dateLocale, {
															year: 'numeric',
															month: 'short',
														})}
													</span>
												</>
											)}
										</div>
									</Link>
								))}
							</div>
						</section>
					);
				})}
			</div>

			<hr className="border-border" />
			<Link
				href="/blog"
				className="font-mono text-xs text-muted-foreground transition-colors hover:text-foreground"
			>
				{isVi ? '← quay lại blog' : '← back to blog'}
			</Link>
		</div>
	);
}
