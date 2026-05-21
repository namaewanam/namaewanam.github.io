import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/site';
import { getSitemapUrls } from '@/lib/sitemap';

export const dynamic = 'force-static';

export default function robots(): MetadataRoute.Robots {
	return {
		rules: {
			userAgent: '*',
			allow: '/',
		},
		sitemap: getSitemapUrls(),
		host: SITE_URL,
	};
}
