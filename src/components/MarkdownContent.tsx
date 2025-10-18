'use client';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import rehypeRaw from 'rehype-raw';
import rehypeSlug from 'rehype-slug';
import PreWithCopyButton from './CodeBlockWithCopy';

interface MarkdownContentProps {
	content: string;
}

export default function MarkdownContent({ content }: Readonly<MarkdownContentProps>) {
	return (
		<div className="prose prose-sm md:prose-base lg:prose-lg max-w-none
      prose-headings:text-foreground prose-headings:font-bold
      prose-h1:text-2xl md:prose-h1:text-4xl prose-h1:text-primary
      prose-h2:text-xl md:prose-h2:text-3xl prose-h2:border-b prose-h2:border-border prose-h2:pb-2
      prose-h3:text-lg md:prose-h3:text-2xl
      prose-p:text-foreground/90 prose-p:leading-relaxed
      prose-a:text-primary prose-a:no-underline hover:prose-a:text-accent hover:prose-a:underline prose-a:break-words
      prose-strong:text-foreground prose-strong:font-semibold
      prose-code:text-accent prose-code:bg-muted prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:before:content-none prose-code:after:content-none prose-code:text-xs md:prose-code:text-sm prose-code:break-words
      prose-pre:bg-card prose-pre:border prose-pre:border-border prose-pre:shadow-md prose-pre:overflow-x-auto prose-pre:text-xs md:prose-pre:text-sm
      prose-blockquote:border-l-4 prose-blockquote:border-primary prose-blockquote:bg-muted/50 prose-blockquote:py-1 prose-blockquote:text-muted-foreground prose-blockquote:text-sm md:prose-blockquote:text-base
      prose-ul:text-foreground/90 prose-ol:text-foreground/90
      prose-li:marker:text-primary
      prose-hr:border-border
      prose-table:border prose-table:border-border prose-table:text-sm md:prose-table:text-base prose-table:overflow-x-auto prose-table:block md:prose-table:table
      prose-th:bg-muted prose-th:text-foreground prose-th:font-semibold
      prose-td:border prose-td:border-border prose-td:text-foreground/90
      prose-img:rounded-lg prose-img:shadow-md prose-img:border prose-img:border-border prose-img:max-w-full prose-img:h-auto
			[&_th]:px-2 md:[&_th]:px-4 [&_th]:py-2
      [&_td]:px-2 md:[&_td]:px-4 [&_td]:py-2
    ">
			<ReactMarkdown
				remarkPlugins={[remarkGfm]}
				rehypePlugins={[rehypeSlug, rehypeHighlight, rehypeRaw]}
				components={{
					pre: PreWithCopyButton
				}}
			>
				{content}
			</ReactMarkdown>
		</div>
	);
}
