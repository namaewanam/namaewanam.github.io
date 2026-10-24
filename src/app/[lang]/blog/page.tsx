import { getBlogSearchPosts, getCategories, getAllTags } from '@/lib/markdown';
import BlogClient from '@/components/BlogClient';
import type { Metadata } from 'next';
import { SITE_NAME, SITE_URL } from '@/lib/site';

export const metadata: Metadata = {
	metadataBase: new URL(SITE_URL),
	title: `Blog · ${SITE_NAME}`,
	description: 'Articles about backend engineering, Go, Java, Spring Boot, and systems design',
	openGraph: {
		title: `Blog · ${SITE_NAME}`,
		description: 'Articles about backend engineering, Go, Java, Spring Boot, and systems design',
		type: 'website',
		url: '/blog',
	},
	twitter: {
		card: 'summary_large_image',
		title: `Blog · ${SITE_NAME}`,
		description: 'Articles about backend engineering, Go, Java, Spring Boot, and systems design',
	},
};

export function generateStaticParams() {
	return [{ lang: 'en' }, { lang: 'vi' }];
}
export default async function BlogPage({
	params,
}: Readonly<{ params: Promise<{ lang: string }> }>) {
	const resolvedParams = await params;
	const posts = getBlogSearchPosts(resolvedParams.lang);
	const categories = getCategories(resolvedParams.lang);
	const allTags = getAllTags(resolvedParams.lang);

	return (
		<div className="mx-auto w-full max-w-3xl">
			<BlogClient posts={posts} categories={categories} allTags={allTags} />
		</div>
	);
}
