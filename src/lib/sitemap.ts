import { getAllPosts, getCategories } from '@/lib/markdown';
import { SITE_URL } from '@/lib/site';

export const SITEMAP_CHUNK_SIZE = 50_000;
export const PRIMARY_SITEMAP_PATH = '/sitemap/0.xml';

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

	const staticEntries: SitemapEntry[] = [
		{
			url: SITE_URL,
			lastModified: latestPostDate,
			changeFrequency: 'weekly',
			priority: 1,
		},
		{
			url: `${SITE_URL}/blog`,
			lastModified: latestPostDate,
			changeFrequency: 'weekly',
			priority: 0.9,
		},
		{
			url: `${SITE_URL}/stack`,
			lastModified: latestPostDate,
			changeFrequency: 'monthly',
			priority: 0.7,
		},
	];

	const categoryEntries = categories.map((category) => {
		const latestCategoryPost = posts.find((post) => post.category === category.slug);
		return {
			url: `${SITE_URL}/blog/${category.slug}`,
			lastModified: latestCategoryPost?.lastUpdated ?? latestCategoryPost?.date ?? latestPostDate,
			changeFrequency: 'weekly' as const,
			priority: 0.7,
		};
	});

	const postEntries = posts.map((post) => ({
		url: `${SITE_URL}/blog/${post.category}/${post.fullPath}`,
		lastModified: post.lastUpdated ?? post.date ?? latestPostDate,
		changeFrequency: 'monthly' as const,
		priority: 0.8,
	}));

	return [...staticEntries, ...categoryEntries, ...postEntries];
}

export function getSitemapIds(): Array<{ id: number }> {
	const entryCount = getSitemapEntries().length;
	const totalSitemaps = Math.max(1, Math.ceil(entryCount / SITEMAP_CHUNK_SIZE));

	return Array.from({ length: totalSitemaps }, (_, id) => ({ id }));
}

export function getSitemapEntriesById(id: number): SitemapEntry[] {
	const start = id * SITEMAP_CHUNK_SIZE;
	const end = start + SITEMAP_CHUNK_SIZE;
	return getSitemapEntries().slice(start, end);
}

export function getSitemapUrls(): string[] {
	return getSitemapIds().map(({ id }) => `${SITE_URL}/sitemap/${id}.xml`);
}
