import type { Metadata } from 'next';
import {
	getPostBySlug,
	getPostsByCategory,
	getCategories,
	getAdjacentPosts,
	getRelatedPosts,
} from '@/lib/markdown';
import { renderMarkdown, extractHeadings } from '@/lib/mdx';
import { notFound } from 'next/navigation';
import PostLayout from '@/components/PostLayout';
import { SITE_NAME, toPostOgSlug } from '@/lib/site';

export const dynamicParams = false;

export async function generateStaticParams() {
	const categories = getCategories();
	const params: { category: string; slug: string[] }[] = [];

	categories.forEach((category) => {
		const posts = getPostsByCategory(category.slug);
		posts.forEach((post) => {
			const slugParts = post.fullPath.split('/');
			params.push({
				category: category.slug,
				slug: slugParts,
			});
		});
	});

	return params;
}

export async function generateMetadata({
	params,
}: {
	params: Promise<{ category: string; slug: string[] }>;
}): Promise<Metadata> {
	const resolvedParams = await params;
	const fullSlug = resolvedParams.slug.join('/');
	const post = getPostBySlug(resolvedParams.category, fullSlug);

	if (!post) {
		return { title: 'Not Found · nam' };
	}

	const url = `/blog/${post.category}/${post.fullPath}`;
	const imageUrl = `/og/posts/${toPostOgSlug(post.category, post.fullPath)}.png`;

	return {
		title: `${post.title} · ${SITE_NAME}`,
		description: post.description ?? `${post.title} — notes from a backend developer`,
		openGraph: {
			title: post.title,
			description: post.description ?? post.title,
			type: 'article',
			url,
			publishedTime: post.date,
			modifiedTime: post.lastUpdated,
			tags: post.tags,
			images: [
				{
					url: imageUrl,
					width: 1200,
					height: 630,
					alt: post.title,
				},
			],
		},
		twitter: {
			card: 'summary_large_image',
			title: post.title,
			description: post.description ?? post.title,
			images: [imageUrl],
		},
		alternates: { canonical: url },
	};
}

export default async function PostPage({
	params,
}: {
	params: Promise<{ category: string; slug: string[] }>;
}) {
	const resolvedParams = await params;
	const fullSlug = resolvedParams.slug.join('/');
	const post = getPostBySlug(resolvedParams.category, fullSlug);

	if (!post) {
		notFound();
	}

	// Pre-render markdown to HTML at build time
	const html = await renderMarkdown(post.content);
	const headings = extractHeadings(html);

	// Adjacent posts for prev/next navigation
	const adjacentPosts = getAdjacentPosts(resolvedParams.category, post);
	const relatedPosts = getRelatedPosts(post);

	// Series info: all posts in same category for "Part X of Y" nav
	const categoryPosts = getPostsByCategory(resolvedParams.category);
	const currentIndex = categoryPosts.findIndex((p) => p.fullPath === post.fullPath);
	const seriesInfo =
		categoryPosts.length > 1 && currentIndex !== -1
			? {
					current: currentIndex + 1,
					total: categoryPosts.length,
					posts: categoryPosts,
				}
			: undefined;

	return (
		<PostLayout
			post={post}
			html={html}
			headings={headings}
			adjacentPosts={adjacentPosts}
			relatedPosts={relatedPosts}
			{...(seriesInfo ? { seriesInfo } : {})}
		/>
	);
}
