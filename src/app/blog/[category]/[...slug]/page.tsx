import { getPostBySlug, getPostsByCategory, getCategories, getAdjacentPosts } from '@/lib/markdown';
import { notFound } from 'next/navigation';
import PostLayout from '@/components/PostLayout';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

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

async function getInitialViews(postId: string): Promise<number> {
	try {
		const viewDocRef = doc(db, 'pageViews', postId);
		const viewDoc = await getDoc(viewDocRef);

		if (viewDoc.exists()) {
			return viewDoc.data().count || 0;
		}
		return 0;
	} catch (error) {
		console.error('Failed to fetch initial views:', error);
		return 0;
	}
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

	const postId = `${post.categoryName.toLowerCase()}-${post.fullPath.replaceAll('/', '-')}`;
	// Fetch views on the server
	const initialViews = await getInitialViews(postId);

	return <PostLayout post={post} adjacentPosts={adjacentPosts} initialViews={initialViews} />;
}
