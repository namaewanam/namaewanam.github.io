import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import remarkRehype from 'remark-rehype';
import rehypeStringify from 'rehype-stringify';
import rehypeHighlight from 'rehype-highlight';
import rehypeRaw from 'rehype-raw';
import rehypeSlug from 'rehype-slug';

/**
 * Pre-renders markdown to HTML at build time.
 * This removes the need to ship react-markdown, remark-*,
 * and rehype-* to the client — saving ~150 kB of JS.
 *
 * The output is static HTML with syntax-highlighted code blocks.
 * Only the copy button remains a client component.
 */
const processor = unified()
	.use(remarkParse)
	.use(remarkGfm)
	.use(remarkRehype, { allowDangerousHtml: true })
	.use(rehypeRaw)
	.use(rehypeSlug)
	.use(rehypeHighlight, { detect: true, ignoreMissing: true })
	.use(rehypeStringify);

function transformCallouts(html: string): string {
	return html.replace(
		/<blockquote>\s*<p>\[!(NOTE|TIP|WARNING|IMPORTANT)\]([\s\S]*?)<\/p>\s*<\/blockquote>/gi,
		(_, rawType: string, rawBody: string) => {
			const type = rawType.toLowerCase();
			const body = rawBody.trim();
			return `<aside class="callout callout-${type}"><p class="callout-title">${type}</p><div class="callout-body">${body}</div></aside>`;
		}
	);
}

export async function renderMarkdown(content: string): Promise<string> {
	const result = await processor.process(content);
	return transformCallouts(String(result));
}

export interface Heading {
	id: string;
	text: string;
	level: 2 | 3;
}

/**
 * Extracts h2 and h3 headings from rendered HTML for the Table of Contents.
 * Runs at build time — never shipped to the client.
 */
export function extractHeadings(html: string): Heading[] {
	const headings: Heading[] = [];
	const regex = /<h([23])\s+id="([^"]*)"[^>]*>(.*?)<\/h[23]>/gi;
	let match;
	while ((match = regex.exec(html)) !== null) {
		const level = Number(match[1]) as 2 | 3;
		const id = match[2] ?? '';
		// Strip any inner HTML tags from the heading text
		const text = (match[3] ?? '').replace(/<[^>]*>/g, '').trim();
		if (id && text) {
			headings.push({ id, text, level });
		}
	}
	return headings;
}
