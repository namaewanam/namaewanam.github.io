import Link from 'next/link';
import { getPostBySlug, getPostsByCategory, getCategories } from '@/lib/markdown';
import { notFound } from 'next/navigation';
import MarkdownContent from '@/components/MarkdownContent';

export async function generateStaticParams() {
	const categories = getCategories();
	const params: { category: string; slug: string }[] = [];

	categories.forEach((category) => {
		const posts = getPostsByCategory(category.slug);
		posts.forEach((post) => {
			params.push({
				category: category.slug,
				slug: post.slug,
			});
		});
	});

	return params;
}

export default function PostPage({
	params,
}: {
	params: { category: string; slug: string };
}) {
	const post = getPostBySlug(params.category, params.slug);

	if (!post) {
		notFound();
	}

	return (
		<div className="max-w-4xl mx-auto space-y-8">
			{/* Breadcrumb */}
			<nav className="flex items-center space-x-2 text-sm text-muted-foreground">
				<Link href="/" className="hover:text-primary transition-colors">
					Home
				</Link>
				<span>/</span>
				<Link
					href={`/blog/${params.category}`}
					className="hover:text-primary transition-colors capitalize"
				>
					{params.category.replace("-", " ")}
				</Link>
				<span>/</span>
				<span className="text-foreground">{post.title}</span>
			</nav>

			{/* Post Header */}
			<header className="space-y-4 pb-8 border-b border-border">
				<div className="flex items-center gap-3">
					<span className="px-3 py-1 text-sm rounded-full bg-primary/10 text-primary border border-primary/30 capitalize font-medium">
						{post.categoryName.replace("-", " ")}
					</span>
					{post.date && (
						<span className="text-muted-foreground">
							{new Date(post.date).toLocaleDateString('en-US', {
								year: 'numeric',
								month: 'long',
								day: 'numeric',
							})}
						</span>
					)}
				</div>
				<h1 className="text-4xl md:text-5xl font-bold text-foreground capitalize">
					{post.title}
				</h1>
				{post.description && (
					<p className="text-xl text-muted-foreground">{post.description}</p>
				)}
			</header>

			{/* Post Content */}
			<article className="pb-12">
				<MarkdownContent content={post.content} />
			</article>

			{/* Back Button */}
			<div className="pt-8 border-t border-border">
				<Link
					href={`/blog/${params.category}`}
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
					Back to {post.categoryName.replace("-", " ")}
				</Link>
			</div>
		</div>
	);
}
