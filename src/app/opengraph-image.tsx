import { buildOgImage, OG_IMAGE_SIZE } from '@/lib/og';
import { HOME_SIGNATURE } from '@/lib/site';

export const size = OG_IMAGE_SIZE;
export const contentType = 'image/png';
export const alt = 'nam homepage';
export const dynamic = 'force-static';

export default function OpenGraphImage() {
	return buildOgImage({
		eyebrow: 'whoami',
		title: 'nam',
		description: HOME_SIGNATURE,
		meta: 'backend dev // vietnam',
		path: '~/',
	});
}
