import type { MetadataRoute } from 'next';
import { getSitemapEntriesById, getSitemapIds } from '@/lib/sitemap';

export const dynamic = 'force-static';

export function generateSitemaps() {
	return getSitemapIds();
}

export default function sitemap({ id }: { id: number }): MetadataRoute.Sitemap {
	return getSitemapEntriesById(id);
}
