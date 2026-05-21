import { generateFeed, renderRssFeed } from '@/lib/generate-feed';

export const dynamic = 'force-static';

export async function GET() {
	const feed = await generateFeed();
	return new Response(renderRssFeed(feed), {
		headers: {
			'Content-Type': 'application/rss+xml; charset=utf-8',
		},
	});
}
