import { Feed } from 'feed';
import { FEED_PATHS } from '@/lib/feed-paths';
import { renderMarkdown } from '@/lib/mdx';
import { getAllPosts } from '@/lib/markdown';
import { CONTACT_EMAIL, SITE_DESCRIPTION, SITE_NAME, SITE_URL } from '@/lib/site';

const FEED_AUTHOR = {
	name: SITE_NAME,
	email: CONTACT_EMAIL,
	link: SITE_URL,
};

let cachedFeedPromise: Promise<Feed> | null = null;

export function renderRssFeed(feed: Feed): string {
	const rss = feed.rss2();
	const withAtomNamespace = rss.replace(
		/<rss\s+version="2\.0"([^>]*)>/,
		'<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom"$1>'
	);

	return withAtomNamespace
		.replace(
			/(<docs>https:\/\/validator\.w3\.org\/feed\/docs\/rss2\.html<\/docs>)/,
			`$1\n        <atom:link href="${SITE_URL}${FEED_PATHS.rss}" rel="self" type="application/rss+xml"/>`
		)
		.replace(
			/<guid isPermaLink="false">(https?:\/\/[^<]+)<\/guid>/g,
			'<guid isPermaLink="true">$1</guid>'
		);
}

export async function generateFeed(): Promise<Feed> {
	if (cachedFeedPromise) {
		return cachedFeedPromise;
	}

	cachedFeedPromise = (async () => {
		const posts = getAllPosts();
		const latestPosts = posts.slice(0, 20);
		const updatedAt =
			latestPosts[0]?.lastUpdated ?? latestPosts[0]?.date ?? new Date().toISOString();
		const feed = new Feed({
			title: `${SITE_NAME} · backend dev`,
			description: SITE_DESCRIPTION,
			id: SITE_URL,
			link: SITE_URL,
			language: 'en',
			image: `${SITE_URL}/opengraph-image`,
			favicon: `${SITE_URL}/opengraph-image`,
			copyright: `All rights reserved ${new Date().getFullYear()}, ${SITE_NAME}`,
			updated: new Date(updatedAt),
			generator: 'feed',
			feedLinks: {
				rss2: `${SITE_URL}${FEED_PATHS.rss}`,
				atom: `${SITE_URL}${FEED_PATHS.atom}`,
				json: `${SITE_URL}${FEED_PATHS.json}`,
			},
			author: FEED_AUTHOR,
		});

		const feedCategories = new Set<string>();

		await Promise.all(
			latestPosts.map(async (post) => {
				const url = `${SITE_URL}/blog/${post.category}/${post.fullPath}`;
				const html = await renderMarkdown(post.content);
				const categories = [
					{ name: post.categoryName, term: post.categoryName },
					...(post.tags ?? []).map((tag) => ({ name: tag, term: tag })),
				];

				feedCategories.add(post.categoryName);
				post.tags?.forEach((tag) => feedCategories.add(tag));

				feed.addItem({
					title: post.title,
					id: url,
					link: url,
					description: post.description ?? post.title,
					content: html,
					author: [FEED_AUTHOR],
					date: new Date(post.lastUpdated ?? post.date ?? updatedAt),
					published: new Date(post.date ?? post.lastUpdated ?? updatedAt),
					category: categories,
				});
			})
		);

		for (const category of feedCategories) {
			feed.addCategory(category);
		}

		return feed;
	})();

	return cachedFeedPromise;
}
