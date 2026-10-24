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
import { SITE_NAME, SITE_URL, toPostOgSlug } from '@/lib/site';
import JsonLd from '@/components/seo/JsonLd';
import { getBlogPostingSchema, getBreadcrumbSchema } from '@/lib/schema';

export const dynamicParams = false;

export function generateStaticParams() {
	const categories = getCategories();
	const params: { lang: string; category: string; slug: string[] }[] = [];

	categories.forEach((category) => {
		const postsEn = getPostsByCategory(category.slug, 'en');
		const postsVi = getPostsByCategory(category.slug, 'vi');
		const allCategoryPosts = [...postsEn, ...postsVi];
		const seen = new Set<string>();
		allCategoryPosts.forEach((post) => {
			if (seen.has(post.fullPath)) return;
			seen.add(post.fullPath);
			const slugParts = post.fullPath.split('/');
			params.push(
				{ lang: 'en', category: category.slug, slug: slugParts },
				{ lang: 'vi', category: category.slug, slug: slugParts }
			);
		});
	});

	return params;
}

export async function generateMetadata({
	params,
}: {
	params: Promise<{ lang: string; category: string; slug: string[] }>;
}): Promise<Metadata> {
	const resolvedParams = await params;
	const fullSlug = resolvedParams.slug.join('/');
	const post = getPostBySlug(resolvedParams.category, fullSlug, resolvedParams.lang);

	if (!post) {
		return { title: 'Not Found · nam' };
	}

	const lang = resolvedParams.lang || 'en';
	const canonicalUrl = `/${lang}/blog/${post.category}/${post.fullPath}`;
	const imageUrl = `${SITE_URL}/og/posts/${toPostOgSlug(post.category, post.fullPath)}.png`;

	return {
		metadataBase: new URL(SITE_URL),
		title: `${post.title} · ${SITE_NAME}`,
		description: post.description ?? `${post.title} — notes from a backend developer`,
		openGraph: {
			title: post.title,
			description: post.description ?? post.title,
			type: 'article',
			url: canonicalUrl,
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
		alternates: {
			canonical: canonicalUrl,
			languages: {
				en: `/en/blog/${post.category}/${post.fullPath}`,
				vi: `/vi/blog/${post.category}/${post.fullPath}`,
				'x-default': `/en/blog/${post.category}/${post.fullPath}`,
			},
		},
	};
}

export default async function PostPage({
	params,
}: Readonly<{
	params: Promise<{ lang: string; category: string; slug: string[] }>;
}>) {
	const resolvedParams = await params;
	const fullSlug = resolvedParams.slug.join('/');
	const post = getPostBySlug(resolvedParams.category, fullSlug, resolvedParams.lang);

	if (!post) {
		notFound();
	}

	// Pre-render markdown to HTML at build time
	const html = await renderMarkdown(post.content, { category: post.category });
	const headings = extractHeadings(html);

	// Adjacent posts for prev/next navigation
	const adjacentPosts = getAdjacentPosts(resolvedParams.category, post, resolvedParams.lang);
	const relatedPosts = getRelatedPosts(post, 3, resolvedParams.lang);

	// Series info: all posts in same category for "Part X of Y" nav
	const categoryPosts = getPostsByCategory(resolvedParams.category, resolvedParams.lang);
	const currentIndex = categoryPosts.findIndex((p) => p.fullPath === post.fullPath);
	const seriesInfo =
		categoryPosts.length > 1 && currentIndex !== -1
			? {
					current: currentIndex + 1,
					total: categoryPosts.length,
					posts: categoryPosts,
				}
			: undefined;

	const lang = resolvedParams.lang || 'en';
	const breadcrumbs = [
		{ name: 'Home', url: `${SITE_URL}/${lang}/` },
		{ name: 'Blog', url: `${SITE_URL}/${lang}/blog/` },
		{
			name: post.categoryName || post.category,
			url: `${SITE_URL}/${lang}/blog/${post.category}/`,
		},
		{
			name: post.title,
			url: `${SITE_URL}/${lang}/blog/${post.category}/${post.fullPath}/`,
		},
	];

	return (
		<>
			<JsonLd data={[getBlogPostingSchema(post, lang), getBreadcrumbSchema(breadcrumbs)]} />
			<PostLayout
				post={post}
				html={html}
				headings={headings}
				adjacentPosts={adjacentPosts}
				relatedPosts={relatedPosts}
				requestedLang={lang}
				{...(seriesInfo ? { seriesInfo } : {})}
			/>
		</>
	);
}
