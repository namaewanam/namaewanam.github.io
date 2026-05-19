import Link from 'next/link';
import { getPostsByCategory, getCategories, getSeriesMetadata } from '@/lib/markdown';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import SeriesLanding from '@/components/blog/SeriesLanding';
import { getCategoryDescription, SITE_NAME } from '@/lib/site';
import { renderMarkdown } from '@/lib/mdx';

export const dynamicParams = false;

export async function generateStaticParams() {
	const categories = getCategories();
	return categories.map((category) => ({
		category: category.slug,
	}));
}

export async function generateMetadata({
	params,
}: {
	params: Promise<{ category: string }>;
}): Promise<Metadata> {
	const resolvedParams = await params;
	const description = getCategoryDescription(resolvedParams.category);
	const categoryTitle = resolvedParams.category.replace(/-/g, ' ');
	return {
		title: `${categoryTitle} · ${SITE_NAME}`,
		description,
		openGraph: {
			title: `${categoryTitle} · ${SITE_NAME}`,
			description,
			type: 'website',
			url: `/blog/${resolvedParams.category}`,
		},
		twitter: {
			card: 'summary_large_image',
			title: `${categoryTitle} · ${SITE_NAME}`,
			description,
		},
	};
}

export default async function CategoryPage({ params }: { params: Promise<{ category: string }> }) {
	const resolvedParams = await params;
	const posts = getPostsByCategory(resolvedParams.category);

	if (posts.length === 0) {
		notFound();
	}

	const categoryName = posts[0]?.categoryName || resolvedParams.category;
	const categoryDescription = getCategoryDescription(resolvedParams.category);
	const seriesMetadata = getSeriesMetadata(resolvedParams.category);
	const seriesHtml = seriesMetadata?.content
		? await renderMarkdown(seriesMetadata.content)
		: undefined;

	// Group posts by subcategory
	const groupedPosts = posts.reduce(
		(acc, post) => {
			const key = post.subcategory || 'root';
			if (!acc[key]) acc[key] = [];
			acc[key].push(post);
			return acc;
		},
		{} as Record<string, typeof posts>
	);

	const sortedGroups = Object.entries(groupedPosts).sort(([a], [b]) => {
		if (a === 'root') return -1;
		if (b === 'root') return 1;
		return a.localeCompare(b);
	});

	return (
		<div className="mx-auto w-full max-w-2xl space-y-10">
			{/* Header */}
			<div className="space-y-3">
				<Link
					href="/blog"
					className="inline-flex items-center gap-1.5 font-mono text-xs text-muted-foreground transition-colors hover:text-foreground"
				>
					← blog
				</Link>
				<div>
					<p className="mb-1 font-mono text-xs uppercase tracking-widest text-primary">category</p>
					<h1 className="text-2xl font-bold text-foreground">{categoryName.replace(/-/g, ' ')}</h1>
					<p className="mt-1 max-w-xl text-sm leading-relaxed text-muted-foreground">
						{categoryDescription}
					</p>
					<p className="mt-2 text-sm text-muted-foreground">
						{posts.length} {posts.length === 1 ? 'article' : 'articles'}
					</p>
				</div>
			</div>

			<SeriesLanding
				categorySlug={resolvedParams.category}
				categoryName={categoryName}
				posts={posts}
				{...(seriesMetadata ? { seriesMetadata } : {})}
				{...(seriesHtml ? { seriesHtml } : {})}
			/>

			{/* Posts grouped by subcategory */}
			<div className="space-y-10">
				{sortedGroups.map(([subcategory, groupPosts]) => (
					<div key={subcategory} className="space-y-1">
						{/* Subcategory label */}
						{subcategory !== 'root' && (
							<p className="mb-3 border-b border-border pb-2 font-mono text-xs text-muted-foreground">
								{subcategory
									.split('/')
									.map((part) => part.replace(/-/g, ' '))
									.join(' / ')}
							</p>
						)}

						{/* Posts */}
						<div className="divide-y divide-border">
							{groupPosts.map((post) => (
								<Link
									key={post.fullPath}
									href={`/blog/${resolvedParams.category}/${post.fullPath}`}
									className="group flex flex-col justify-between gap-1 py-3.5 transition-colors hover:text-primary sm:flex-row sm:items-baseline sm:gap-4"
								>
									<div className="min-w-0 space-y-0.5">
										<span className="block text-sm text-foreground transition-colors group-hover:text-primary">
											{post.order !== undefined && (
												<span className="mr-2 font-mono text-xs text-muted-foreground">
													{String(post.order).padStart(2, '0')}.
												</span>
											)}
											{post.title}
										</span>
										{post.description && (
											<span className="block max-w-md truncate text-xs text-muted-foreground">
												{post.description}
											</span>
										)}
										{post.tags && post.tags.length > 0 && (
											<div className="flex flex-wrap gap-1.5 pt-0.5">
												{post.tags.map((t) => (
													<span key={t} className="font-mono text-[10px] text-muted-foreground/70">
														#{t}
													</span>
												))}
											</div>
										)}
									</div>
									{post.date && (
										<span className="shrink-0 font-mono text-xs text-muted-foreground">
											{new Date(post.date).toLocaleDateString('en-US', {
												year: 'numeric',
												month: 'short',
											})}
										</span>
									)}
								</Link>
							))}
						</div>
					</div>
				))}
			</div>
		</div>
	);
}
