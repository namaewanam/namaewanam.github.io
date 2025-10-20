import Link from 'next/link';
import { getPostsByCategory, getCategories } from '@/lib/markdown';
import { notFound } from 'next/navigation';

export async function generateStaticParams() {
	const categories = getCategories();
	return categories.map((category) => ({
		category: category.slug,
	}));
}

export default async function CategoryPage({ params }: { params: Promise<{ category: string }> }) {
	const resolvedParams = await params;
	const posts = getPostsByCategory(resolvedParams.category);

	if (posts.length === 0) {
		notFound();
	}

	// Get the original category name from posts (preserves case)
	const categoryName = posts[0]?.categoryName || resolvedParams.category;

	// Group posts by subcategory
	const groupedPosts = posts.reduce(
		(acc, post) => {
			const key = post.subcategory || 'root';
			if (!acc[key]) {
				acc[key] = [];
			}
			acc[key].push(post);
			return acc;
		},
		{} as Record<string, typeof posts>
	);

	// Sort groups: root first, then alphabetically
	const sortedGroups = Object.entries(groupedPosts).sort(([a], [b]) => {
		if (a === 'root') return -1;
		if (b === 'root') return 1;
		return a.localeCompare(b);
	});

	return (
		<div className="space-y-8">
			{/* Category Header */}
			<div className="space-y-4">
				<Link
					href="/"
					className="inline-flex items-center font-medium text-primary transition-colors hover:text-accent"
				>
					<svg className="mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={2}
							d="M10 19l-7-7m0 0l7-7m-7 7h18"
						/>
					</svg>
					Back to Home
				</Link>
				<h1 className="text-4xl font-bold text-foreground">{categoryName.replaceAll('-', ' ')}</h1>
				<p className="text-muted-foreground">
					{posts.length} {posts.length === 1 ? 'article' : 'articles'} in this category
				</p>
			</div>

			{/* Posts List - Grouped by subcategory */}
			<div className="space-y-10">
				{sortedGroups.map(([subcategory, groupPosts]) => (
					<div key={subcategory} className="space-y-4">
						{/* Subcategory Header */}
						{subcategory !== 'root' && (
							<h2 className="border-b border-border pb-2 text-2xl font-semibold text-foreground">
								{subcategory
									.split('/')
									.map((part) => part.replaceAll('-', ' '))
									.join(' / ')}
							</h2>
						)}

						{/* Posts in this subcategory */}
						<div className="grid gap-6">
							{groupPosts.map((post) => (
								<Link
									key={post.fullPath}
									href={`/blog/${resolvedParams.category}/${post.fullPath}`}
									className="group rounded-lg border border-border bg-card p-6 transition-all hover:border-primary hover:shadow-lg hover:shadow-primary/10"
								>
									<div className="flex items-start justify-between gap-4">
										<div className="flex-1 space-y-2">
											<div className="flex flex-wrap items-center gap-2">
												{post.date && (
													<span className="text-sm text-muted-foreground">
														{new Date(post.date).toLocaleDateString('en-US', {
															year: 'numeric',
															month: 'long',
															day: 'numeric',
														})}
													</span>
												)}
												{post.order !== undefined && (
													<span className="rounded-full border border-accent/30 bg-accent/10 px-2 py-0.5 text-xs text-accent">
														Part {post.order}
													</span>
												)}
											</div>
											<h3 className="text-2xl font-semibold text-foreground group-hover:text-primary">
												{post.title}
											</h3>
											{post.description && (
												<p className="text-muted-foreground">{post.description}</p>
											)}
										</div>
										<svg
											className="h-6 w-6 flex-shrink-0 text-primary transition-transform group-hover:translate-x-1"
											fill="none"
											viewBox="0 0 24 24"
											stroke="currentColor"
										>
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												strokeWidth={2}
												d="M9 5l7 7-7 7"
											/>
										</svg>
									</div>
								</Link>
							))}
						</div>
					</div>
				))}
			</div>
		</div>
	);
}
