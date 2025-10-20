import { getPostBySlug, getPostsByCategory, getCategories, getAdjacentPosts } from '@/lib/markdown';
import { notFound } from 'next/navigation';
import PostLayout from '@/components/PostLayout';

export async function generateStaticParams() {
	const categories = getCategories();
	const params: { category: string; slug: string[] }[] = [];

	categories.forEach((category) => {
		const posts = getPostsByCategory(category.slug);
		posts.forEach((post) => {
			// Support nested paths by splitting fullPath
			const slugParts = post.fullPath.split('/');
			params.push({
				category: category.slug,
				slug: slugParts,
			});
		});
	});

	return params;
}

export default async function PostPage({
	params,
}: {
	params: Promise<{ category: string; slug: string[] }>;
}) {
	const resolvedParams = await params;

	// Join slug array to handle nested paths
	const fullSlug = resolvedParams.slug.join('/');
	const post = getPostBySlug(resolvedParams.category, fullSlug);

	if (!post) {
		notFound();
	}

	// Get adjacent posts for navigation
	const adjacentPosts = getAdjacentPosts(resolvedParams.category, post);

	return <PostLayout post={post} adjacentPosts={adjacentPosts} />;
}
