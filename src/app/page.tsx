import Link from 'next/link';
import { getAllPosts, getCategories } from '@/lib/markdown';

export default function Home() {
	const posts = getAllPosts();
	const categories = getCategories();

	return (
		<div className="space-y-12">
			{/* Hero Section */}
			<section className="text-center py-12 space-y-4">
				<h1 className="text-5xl font-bold text-primary">
					Welcome to my note pages
				</h1>
				<p className="text-xl text-muted-foreground max-w-2xl mx-auto">
					Exploring the world of programming, one article at a time
				</p>
			</section>

			{/* Categories Grid */}
			<section className="space-y-6">
				<h2 className="text-3xl font-bold text-foreground">Categories</h2>
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
					{categories.map((category) => (
						<Link
							key={category.slug}
							href={`/blog/${category.slug}`}
							className="group p-6 rounded-lg bg-card border border-border hover:border-primary hover:shadow-lg hover:shadow-primary/10 transition-all"
						>
							<h3 className="text-xl font-semibold text-primary group-hover:text-accent capitalize mb-2">
								{category.name.replace("-", " ")}
							</h3>
							<p className="text-muted-foreground">
								{category.count} {category.count === 1 ? 'article' : 'articles'}
							</p>
						</Link>
					))}
				</div>
			</section>

			{/* Recent Posts */}
			<section className="space-y-6">
				<h2 className="text-3xl font-bold text-foreground">Recent Articles</h2>
				<div className="grid gap-6">
					{posts.slice(0, 10).map((post) => (
						<Link
							key={`${post.category}-${post.slug}`}
							href={`/blog/${post.category}/${post.slug}`}
							className="group p-6 rounded-lg bg-card border border-border hover:border-primary hover:shadow-lg hover:shadow-primary/10 transition-all"
						>
							<div className="flex items-start justify-between gap-4">
								<div className="flex-1 space-y-2">
									<div className="flex items-center gap-3">
										<span className="px-3 py-1 text-sm rounded-full bg-primary/10 text-primary border border-primary/30 capitalize font-medium">
											{post.categoryName.replace("-", " ")}
										</span>
										{post.date && (
											<span className="text-sm text-muted-foreground">
												{new Date(post.date).toLocaleDateString('en-US', {
													year: 'numeric',
													month: 'long',
													day: 'numeric',
												})}
											</span>
										)}
									</div>
									<h3 className="text-xl font-semibold text-foreground group-hover:text-primary capitalize">
										{post.title}
									</h3>
									{post.description && (
										<p className="text-muted-foreground line-clamp-2">{post.description}</p>
									)}
								</div>
								<svg
									className="w-6 h-6 text-primary group-hover:translate-x-1 transition-transform"
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
