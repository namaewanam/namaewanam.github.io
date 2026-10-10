import { Metadata } from 'next';
import { renderMarkdown } from '@/lib/mdx';
import { SNIPPETS } from '@/lib/snippets';
import MarkdownContent from '@/components/MarkdownContent';
import { SITE_NAME } from '@/lib/site';

export const metadata: Metadata = {
	title: `snippets · ${SITE_NAME}`,
	description: 'A collection of useful code snippets, boilerplates, and patterns.',
};

export default async function SnippetsPage() {
	// Pre-render all markdown contents concurrently
	const renderedSnippets = await Promise.all(
		SNIPPETS.map(async (snippet) => {
			const html = await renderMarkdown(snippet.content);
			return { ...snippet, html };
		})
	);

	return (
		<div className="mx-auto w-full max-w-3xl space-y-12">
			<section className="space-y-4">
				<div className="space-y-1">
					<p className="font-mono text-xs uppercase tracking-widest text-primary">snippets</p>
					<h1 className="text-2xl font-bold leading-tight text-foreground sm:text-3xl">
						Code Library
					</h1>
				</div>
				<p className="text-sm leading-relaxed text-foreground/80 sm:text-base">
					A collection of useful code snippets, boilerplates, and patterns I frequently use. Feel
					free to copy and paste.
				</p>
			</section>

			<div className="space-y-12">
				{renderedSnippets.map((snippet) => (
					<article key={snippet.id} id={snippet.id} className="space-y-4">
						<header className="space-y-2">
							<div className="flex items-center justify-between">
								<h2 className="text-lg font-semibold text-foreground">
									<a href={`#${snippet.id}`} className="hover:text-primary hover:underline">
										{snippet.title}
									</a>
								</h2>
								<div className="flex flex-wrap gap-1.5">
									{snippet.tags.map((tag) => (
										<span
											key={tag}
											className="rounded bg-muted px-1.5 py-0.5 font-mono text-[11px] text-muted-foreground"
										>
											{tag}
										</span>
									))}
								</div>
							</div>
							<p className="text-sm text-foreground/80">{snippet.description}</p>
						</header>

						<div className="snippet-content">
							<MarkdownContent html={snippet.html} />
						</div>
					</article>
				))}
			</div>
		</div>
	);
}
