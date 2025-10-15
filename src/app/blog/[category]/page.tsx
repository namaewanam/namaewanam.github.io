import Link from 'next/link';
import { getPostsByCategory, getCategories } from '@/lib/markdown';
import { notFound } from 'next/navigation';

export async function generateStaticParams() {
	const categories = getCategories();
	return categories.map((category) => ({
		category: category.slug,
	}));
}

export default function CategoryPage({ params }: { params: { category: string } }) {
	const posts = getPostsByCategory(params.category);

	if (posts.length === 0) {
		notFound();
	}

	const categoryName = params.category.charAt(0).toUpperCase() + params.category.slice(1);

	return (
		<div className="space-y-8">
			{/* Category Header */}
			<div className="space-y-4">
				<Link
					href="/"
					className="inline-flex items-center text-primary hover:text-accent transition-colors font-medium"
				>
					<svg
						className="w-5 h-5 mr-2"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
					>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={2}
							d="M10 19l-7-7m0 0l7-7m-7 7h18"
						/>
					</svg>
					Back to Home
				</Link>
				<h1 className="text-4xl font-bold text-foreground capitalize">{categoryName.replace("-", " ")}</h1>
				<p className="text-muted-foreground">
					{posts.length} {posts.length === 1 ? 'article' : 'articles'} in this category
				</p>
			</div>

			{/* Posts List */}
			<div className="grid gap-6">
				{posts.map((post) => (
					<Link
						key={post.slug}
						href={`/blog/${params.category}/${post.slug}`}
						className="group p-6 rounded-lg bg-card border border-border hover:border-primary hover:shadow-lg hover:shadow-primary/10 transition-all"
					>
						<div className="flex items-start justify-between gap-4">
							<div className="flex-1 space-y-2">
								{post.date && (
									<span className="text-sm text-muted-foreground">
										{new Date(post.date).toLocaleDateString('en-US', {
											year: 'numeric',
											month: 'long',
											day: 'numeric',
										})}
									</span>
								)}
								<h2 className="text-2xl font-semibold text-foreground group-hover:text-primary capitalize">
									{post.title}
								</h2>
								{post.description && (
									<p className="text-muted-foreground">{post.description}</p>
								)}
							</div>
							<svg
								className="w-6 h-6 text-primary group-hover:translate-x-1 transition-transform flex-shrink-0"
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
	);
}
