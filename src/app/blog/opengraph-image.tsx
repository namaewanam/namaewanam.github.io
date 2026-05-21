import { buildOgImage, OG_IMAGE_SIZE } from '@/lib/og';

export const size = OG_IMAGE_SIZE;
export const contentType = 'image/png';
export const alt = 'nam blog';
export const dynamic = 'force-static';

export default function OpenGraphImage() {
	return buildOgImage({
		eyebrow: 'blog',
		title: 'Writing about backend systems, tracing, Spring Boot, and notes worth re-reading.',
		description:
			'Compact field notes on APIs, observability, architecture, and the boring parts that matter in production.',
		meta: 'notes // java // go // systems',
		path: '~/blog',
	});
}
