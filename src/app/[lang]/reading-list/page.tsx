import type { Metadata } from 'next';
import { getAllPosts } from '@/lib/markdown';
import { SITE_NAME } from '@/lib/site';
import ReadingListClient from '@/components/ReadingListClient';

export const metadata: Metadata = {
	title: `reading list · ${SITE_NAME}`,
	description: 'Your bookmarked posts for later reading.',
};

export function generateStaticParams() {
	return [{ lang: 'en' }, { lang: 'vi' }];
}
export default function ReadingListPage() {
	const posts = getAllPosts().map((p) => ({
		slug: p.slug,
		title: p.title,
		category: p.category,
		categoryName: p.categoryName,
		fullPath: p.fullPath,
		date: p.date,
		readingTimeMin: p.readingTimeMin,
	}));

	return (
		<div className="mx-auto w-full max-w-3xl space-y-8">
			<section className="space-y-2">
				<p className="font-mono text-xs uppercase tracking-widest text-primary">reading list</p>
				<h1 className="text-2xl font-bold text-foreground">Saved Posts</h1>
				<p className="text-sm text-muted-foreground">Posts you&apos;ve bookmarked for later.</p>
			</section>
			<ReadingListClient posts={posts} />
		</div>
	);
}
