import Link from 'next/link';
import { getAllPosts, getCategories } from '@/lib/markdown';

export default function Home() {
	const posts = getAllPosts();
	const categories = getCategories();

	return (
		<div className="space-y-8 md:space-y-12">
			{/* Hero Section */}
			<section className="space-y-3 py-8 text-center md:space-y-4 md:py-12">
				<h1 className="px-4 text-3xl font-bold text-primary md:text-4xl lg:text-5xl">
					Welcome to my note pages
				</h1>
				<p className="mx-auto max-w-2xl px-4 text-base text-muted-foreground md:text-lg lg:text-xl">
					Exploring the world of programming, one article at a time
				</p>
			</section>

			{/* Categories Grid */}
			<section className="space-y-4 md:space-y-6">
				<h2 className="text-2xl font-bold text-foreground md:text-3xl">Categories</h2>
				<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6 lg:grid-cols-3">
					{categories.map((category) => (
						<Link
							key={category.slug}
							href={`/blog/${category.slug}`}
							className="group rounded-lg border border-border bg-card p-4 transition-all hover:border-primary hover:shadow-lg hover:shadow-primary/10 md:p-6"
						>
							<h3 className="mb-2 text-lg font-semibold text-primary group-hover:text-accent md:text-xl">
								{category.name.replace(/-/g, ' ')}
							</h3>
							<p className="text-sm text-muted-foreground md:text-base">
								{category.count} {category.count === 1 ? 'article' : 'articles'}
							</p>
						</Link>
					))}
				</div>
			</section>

			{/* Recent Posts */}
			<section className="space-y-4 md:space-y-6">
				<h2 className="text-2xl font-bold text-foreground md:text-3xl">Recent Articles</h2>
				<div className="grid gap-4 md:gap-6">
					{posts.slice(0, 10).map((post) => (
						<Link
							key={`${post.category}-${post.slug}`}
							href={`/blog/${post.category}/${post.fullPath}`}
							className="group rounded-lg border border-border bg-card p-4 transition-all hover:border-primary hover:shadow-lg hover:shadow-primary/10 md:p-6"
						>
							<div className="flex items-start justify-between gap-3 md:gap-4">
								<div className="min-w-0 flex-1 space-y-2">
									<div className="flex flex-wrap items-center gap-2 md:gap-3">
										<span className="rounded-full border border-primary/30 bg-primary/10 px-2 py-1 text-xs font-medium text-primary md:px-3 md:text-sm">
											{post.categoryName.replace(/-/g, ' ')}
										</span>
										{post.date && (
											<span className="text-xs text-muted-foreground md:text-sm">
												{new Date(post.date).toLocaleDateString('en-US', {
													year: 'numeric',
													month: 'long',
													day: 'numeric',
												})}
											</span>
										)}
									</div>
									<h3 className="text-lg font-semibold text-foreground group-hover:text-primary md:text-xl">
										{post.title}
									</h3>
									{post.description && (
										<p className="line-clamp-2 text-sm text-muted-foreground md:text-base">
											{post.description}
										</p>
									)}
								</div>
								<svg
									className="h-5 w-5 flex-shrink-0 text-primary transition-transform group-hover:translate-x-1 md:h-6 md:w-6"
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
			</section>
		</div>
	);
}
