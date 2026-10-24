import type { Metadata } from 'next';
import { getAllPosts } from '@/lib/markdown';
import { SITE_NAME, SITE_URL } from '@/lib/site';
import ReadingListClient from '@/components/ReadingListClient';
import { getDictionary } from '@/lib/i18n/server';
import { Locale } from '@/lib/i18n/translations';

export const metadata: Metadata = {
	metadataBase: new URL(SITE_URL),
	title: `reading list · ${SITE_NAME}`,
	description: 'Your bookmarked posts for later reading.',
};

export function generateStaticParams() {
	return [{ lang: 'en' }, { lang: 'vi' }];
}

export default async function ReadingListPage({
	params,
}: Readonly<{ params: Promise<{ lang: string }> }>) {
	const resolvedParams = await params;
	const lang = (resolvedParams.lang === 'vi' ? 'vi' : 'en') as Locale;
	const t = getDictionary(lang);
	const posts = getAllPosts(lang).map((p) => ({
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
				<p className="font-mono text-xs uppercase tracking-widest text-primary">
					{t('readingList.title')}
				</p>
				<h1 className="text-2xl font-bold text-foreground">{t('readingList.title')}</h1>
				<p className="text-sm text-muted-foreground">{t('readingList.subtitle')}</p>
			</section>
			<ReadingListClient posts={posts} lang={lang} />
		</div>
	);
}
