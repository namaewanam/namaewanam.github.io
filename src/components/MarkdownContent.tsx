'use client';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import rehypeRaw from 'rehype-raw';
import 'highlight.js/styles/atom-one-dark.css';
import rehypeSlug from 'rehype-slug';

interface MarkdownContentProps {
	content: string;
}

export default function MarkdownContent({ content }: Readonly<MarkdownContentProps>) {
	return (
		<div className="prose prose-lg max-w-none
      prose-headings:text-foreground prose-headings:font-bold
      prose-h1:text-4xl prose-h1:text-primary
      prose-h2:text-3xl prose-h2:border-b prose-h2:border-border prose-h2:pb-2
      prose-h3:text-2xl
      prose-p:text-foreground/90 prose-p:leading-relaxed
      prose-a:text-primary prose-a:no-underline hover:prose-a:text-accent hover:prose-a:underline
      prose-strong:text-foreground prose-strong:font-semibold
      prose-code:text-accent prose-code:bg-muted prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:before:content-none prose-code:after:content-none
      prose-pre:bg-card prose-pre:border prose-pre:border-border prose-pre:shadow-md
      prose-blockquote:border-l-4 prose-blockquote:border-primary prose-blockquote:bg-muted/50 prose-blockquote:py-1 prose-blockquote:text-muted-foreground
      prose-ul:text-foreground/90 prose-ol:text-foreground/90
      prose-li:marker:text-primary
      prose-hr:border-border
      prose-table:border prose-table:border-border
      prose-th:bg-muted prose-th:text-foreground prose-th:font-semibold
      prose-td:border prose-td:border-border
      prose-img:rounded-lg prose-img:shadow-md prose-img:border prose-img:border-border
    ">
			<ReactMarkdown
				remarkPlugins={[remarkGfm]}
				rehypePlugins={[rehypeSlug, rehypeHighlight, rehypeRaw]}
			>
				{content}
			</ReactMarkdown>
		</div>
	);
}
