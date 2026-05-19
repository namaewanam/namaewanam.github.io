import CodeCopyInjector from './CodeCopyInjector';

interface MarkdownContentProps {
	html: string;
}

/**
 * Server component that renders pre-processed HTML.
 * Markdown → HTML conversion happens at build time in the page's
 * generateStaticParams / server component, not on the client.
 *
 * This means react-markdown, remark-*, rehype-* are NEVER
 * shipped to the browser — only static HTML + a tiny copy button.
 */
export default function MarkdownContent({ html }: Readonly<MarkdownContentProps>) {
	return (
		<div className="prose prose-sm max-w-none sm:prose-base prose-headings:font-semibold prose-headings:tracking-tight prose-headings:text-foreground prose-h1:mb-4 prose-h1:mt-10 prose-h1:text-xl prose-h2:mb-3 prose-h2:mt-8 prose-h2:border-b prose-h2:border-border prose-h2:pb-2 prose-h2:text-lg prose-h3:mb-2 prose-h3:mt-6 prose-h3:text-base prose-p:mb-4 prose-p:leading-[1.9] prose-p:text-foreground/85 prose-a:break-words prose-a:font-medium prose-a:text-accent prose-a:no-underline hover:prose-a:underline hover:prose-a:underline-offset-2 prose-blockquote:border-l-2 prose-blockquote:border-primary/50 prose-blockquote:bg-transparent prose-blockquote:py-0 prose-blockquote:text-sm prose-blockquote:italic prose-blockquote:text-muted-foreground prose-strong:font-semibold prose-strong:text-foreground prose-code:break-words prose-code:rounded prose-code:bg-muted/80 prose-code:px-1.5 prose-code:py-0.5 prose-code:font-mono prose-code:text-[13px] prose-code:text-foreground prose-code:before:content-none prose-code:after:content-none prose-pre:my-6 prose-pre:overflow-x-auto prose-pre:rounded-lg prose-pre:border prose-pre:border-border prose-pre:bg-card prose-pre:p-0 prose-pre:text-[13px] prose-pre:leading-[1.7] prose-pre:shadow-none prose-ol:text-foreground/85 prose-ul:text-foreground/85 prose-li:my-1 prose-li:marker:text-primary/60 prose-table:block prose-table:overflow-x-auto prose-table:text-sm prose-th:bg-muted/50 prose-th:text-left prose-th:font-medium prose-th:text-foreground prose-td:border-t prose-td:border-border prose-td:text-foreground/80 prose-img:h-auto prose-img:max-w-full prose-img:rounded prose-img:border prose-img:border-border prose-img:shadow-none prose-hr:my-8 prose-hr:border-border sm:prose-h1:text-2xl sm:prose-h2:text-xl sm:prose-h3:text-lg sm:prose-p:leading-[1.75] sm:prose-table:table [&_td]:px-3 [&_td]:py-2 [&_th]:px-3 [&_th]:py-2">
			<CodeCopyInjector html={html} />
		</div>
	);
}
