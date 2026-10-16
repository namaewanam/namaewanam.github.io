import { getAllPosts, getCategories } from '@/lib/markdown';
import { SITE_URL } from '@/lib/site';

export const PRIMARY_SITEMAP_PATH = '/sitemap.xml';

export interface SitemapEntry {
	url: string;
	lastModified?: string | Date;
	changeFrequency?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
	priority?: number;
}

export function getSitemapEntries(): SitemapEntry[] {
	const posts = getAllPosts();
	const categories = getCategories();
	const latestPostDate = posts[0]?.lastUpdated ?? posts[0]?.date ?? new Date().toISOString();

	const staticRoutes = [
		{ path: '', priority: 1.0, freq: 'weekly' as const },
		{ path: '/blog', priority: 0.9, freq: 'weekly' as const },
		{ path: '/blog/tags', priority: 0.7, freq: 'weekly' as const },
		{ path: '/stack', priority: 0.7, freq: 'monthly' as const },
		{ path: '/reading-list', priority: 0.6, freq: 'monthly' as const },
		{ path: '/changelog', priority: 0.6, freq: 'monthly' as const },
		{ path: '/now', priority: 0.6, freq: 'monthly' as const },
		{ path: '/snippets', priority: 0.6, freq: 'monthly' as const },
		{ path: '/adr', priority: 0.6, freq: 'monthly' as const },
	];

	const staticEntries: SitemapEntry[] = [
		{
			url: `${SITE_URL}/`,
			lastModified: latestPostDate,
			changeFrequency: 'weekly',
			priority: 1,
		},
	];

	for (const lang of ['en', 'vi']) {
		for (const route of staticRoutes) {
			staticEntries.push({
				url: `${SITE_URL}/${lang}${route.path}/`,
				lastModified: latestPostDate,
				changeFrequency: route.freq,
				priority: route.priority,
			});
		}
	}

	const categoryEntries: SitemapEntry[] = [];
	for (const category of categories) {
		const latestCategoryPost = posts.find((post) => post.category === category.slug);
		const catDate = latestCategoryPost?.lastUpdated ?? latestCategoryPost?.date ?? latestPostDate;
		for (const lang of ['en', 'vi']) {
			categoryEntries.push({
				url: `${SITE_URL}/${lang}/blog/${category.slug}/`,
				lastModified: catDate,
				changeFrequency: 'weekly',
				priority: 0.7,
			});
		}
	}

	const postEntries: SitemapEntry[] = posts.map((post) => ({
		url: `${SITE_URL}/${post.lang || 'en'}/blog/${post.category}/${post.fullPath}/`,
		lastModified: post.lastUpdated ?? post.date ?? latestPostDate,
		changeFrequency: 'monthly' as const,
		priority: 0.8,
	}));

	return [...staticEntries, ...categoryEntries, ...postEntries];
}

export function getSitemapUrls(): string[] {
	return [`${SITE_URL}/sitemap.xml`];
}
