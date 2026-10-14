import type { Metadata } from 'next';
import { SITE_NAME } from '@/lib/site';
import { getCategories } from '@/lib/markdown';
import { getDictionary } from '@/lib/i18n/server';
import { Locale } from '@/lib/i18n/translations';
import EditorView from '@/components/editor/EditorView';

export const metadata: Metadata = {
	title: `editor · ${SITE_NAME}`,
	description: 'Mobile Markdown Editor for creating and updating blog posts.',
	robots: {
		index: false,
		follow: false,
	},
};

export function generateStaticParams() {
	return [{ lang: 'en' }, { lang: 'vi' }];
}

export default async function EditorPage({ params }: { params: Promise<{ lang: Locale }> }) {
	const { lang } = await params;
	const t = getDictionary(lang);

	const initialCategories = getCategories()
		.map((c) => c.name)
		.sort();

	return (
		<div className="mx-auto w-full max-w-4xl space-y-6">
			<div className="space-y-1 border-b border-border pb-4">
				<p className="font-mono text-xs uppercase tracking-widest text-primary">
					{t('editor.tag')}
				</p>
				<h1 className="text-2xl font-bold text-foreground">{t('editor.title')}</h1>
				<p className="text-xs text-muted-foreground sm:text-sm">{t('editor.subtitle')}</p>
			</div>

			<EditorView initialCategories={initialCategories} lang={lang} />
		</div>
	);
}
