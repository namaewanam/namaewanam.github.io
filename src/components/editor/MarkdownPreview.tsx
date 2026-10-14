'use client';

import { useEffect, useState } from 'react';
import { renderMarkdown } from '@/lib/mdx';
import { Loader2 } from 'lucide-react';

interface MarkdownPreviewProps {
	markdown: string;
}

export default function MarkdownPreview({ markdown }: Readonly<MarkdownPreviewProps>) {
	const [html, setHtml] = useState<string>('');
	const [isLoading, setIsLoading] = useState<boolean>(true);

	useEffect(() => {
		let isMounted = true;
		setIsLoading(true);

		const timer = setTimeout(async () => {
			try {
				const rendered = await renderMarkdown(markdown || '*No content yet.*');
				if (isMounted) {
					setHtml(rendered);
					setIsLoading(false);
				}
			} catch (err) {
				console.error('Markdown preview rendering error:', err);
				if (isMounted) {
					setHtml('<p class="text-destructive">Preview error: invalid markdown format.</p>');
					setIsLoading(false);
				}
			}
		}, 150);

		return () => {
			isMounted = false;
			clearTimeout(timer);
		};
	}, [markdown]);

	return (
		<div className="relative min-h-[300px] w-full rounded-md border border-border bg-background p-4 sm:p-6">
			{isLoading && (
				<div className="absolute right-3 top-3 flex items-center gap-1.5 rounded-full bg-muted/80 px-2 py-0.5 text-[11px] text-muted-foreground">
					<Loader2 className="h-3 w-3 animate-spin" />
					<span>Rendering...</span>
				</div>
			)}
			<div
				className="prose prose-sm max-w-none sm:prose-base prose-headings:font-semibold prose-headings:tracking-tight prose-headings:text-foreground prose-h1:mb-4 prose-h1:mt-8 prose-h1:text-xl prose-h2:mb-3 prose-h2:mt-6 prose-h2:border-b prose-h2:border-border prose-h2:pb-2 prose-h2:text-lg prose-h3:mb-2 prose-h3:mt-4 prose-h3:text-base prose-p:mb-4 prose-p:leading-[1.8] prose-p:text-foreground/85 prose-a:font-medium prose-a:text-accent prose-code:rounded prose-code:bg-muted/80 prose-code:px-1.5 prose-code:py-0.5 prose-code:font-mono prose-code:text-[13px] prose-pre:my-4 prose-pre:rounded-lg prose-pre:border prose-pre:border-border prose-pre:bg-card prose-pre:p-4"
				// eslint-disable-next-line react/no-danger
				dangerouslySetInnerHTML={{ __html: html }}
			/>
		</div>
	);
}
