import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import remarkRehype from 'remark-rehype';
import rehypeStringify from 'rehype-stringify';
import rehypeHighlight from 'rehype-highlight';
import rehypeKatex from 'rehype-katex';
import rehypeRaw from 'rehype-raw';
import rehypeSlug from 'rehype-slug';

/**
 * Pre-renders markdown to HTML at build time.
 * This removes the need to ship react-markdown, remark-*,
 * and rehype-* to the client — saving ~150 kB of JS.
 *
 * The output is static HTML with syntax-highlighted code blocks and KaTeX math.
 * Only the copy button remains a client component.
 */
const processor = unified()
	.use(remarkParse)
	.use(remarkGfm)
	.use(remarkMath)
	.use(remarkRehype, { allowDangerousHtml: true })
	.use(rehypeRaw)
	.use(rehypeSlug)
	.use(rehypeKatex, { strict: false })
	.use(rehypeHighlight, { detect: true, ignoreMissing: true })
	.use(rehypeStringify);

const CALLOUT_ICONS: Record<string, string> = {
	note: '📝',
	tip: '💡',
	warning: '⚠️',
	important: '🔔',
	caution: '🚨',
	architecture: '🏗️',
	gotcha: '🪤',
	tradeoff: '⚖️',
	production: '🚀',
	'deep-dive': '🔬',
};

function transformCallouts(html: string): string {
	return html.replace(
		/\u003cblockquote\u003e([\s\S]*?)\u003c\/blockquote\u003e/gi,
		(fullMatch, innerHtml: string) => {
			const headerMatch = innerHtml.match(
				/^\s*\u003cp\u003e\[!(NOTE|TIP|WARNING|IMPORTANT|CAUTION|ARCHITECTURE|GOTCHA|TRADEOFF|PRODUCTION|DEEP-DIVE)\]/i
			);
			if (!headerMatch) {
				return fullMatch;
			}
			const rawType = headerMatch[1] ?? 'note';
			const restAfterMarker = innerHtml.slice(headerMatch[0].length).trimStart();
			const type = rawType.toLowerCase();
			const icon = CALLOUT_ICONS[type] ?? '';
			const body = restAfterMarker.startsWith('</p>')
				? restAfterMarker.slice(4).trim()
				: `<p>${restAfterMarker.trim()}`;

			return `<aside class="callout callout-${type}"><p class="callout-title"><span class="callout-icon" aria-hidden="true">${icon}</span>${type.replace('-', '\u2011')}</p><div class="callout-body">${body}</div></aside>`;
		}
	);
}

function addImagePerformanceAttributes(html: string): string {
	return html.replace(/<img\b([^>]*?)(\/?>)/gi, (_, attrs: string, closing: string) => {
		let updated = attrs;
		if (!/\bloading=/i.test(updated)) {
			updated = ` loading="lazy"${updated}`;
		}
		if (!/\bdecoding=/i.test(updated)) {
			updated = ` decoding="async"${updated}`;
		}
		return `<img${updated}${closing}`;
	});
}

function applyCustomHeadingIds(html: string): string {
	return html.replace(
		/<h([1-6])([^>]*)>([\s\S]*?)<\/h\1>/gi,
		(fullMatch, level: string, attrs: string, inner: string) => {
			const trimmedInner = inner.trimEnd();
			const idMatch = trimmedInner.match(/\{#([a-zA-Z0-9_-]+)\}$/);
			if (!idMatch) {
				return fullMatch;
			}
			const customId = idMatch[1] ?? '';
			const cleanInner = trimmedInner.slice(0, trimmedInner.length - idMatch[0].length).trimEnd();
			const cleanAttrs = attrs.replace(/ id="[^"]*"/i, '');
			return `<h${level} id="${customId}"${cleanAttrs}>${cleanInner}</h${level}>`;
		}
	);
}

function decodeHtmlEntities(text: string): string {
	return text
		.replace(/&#x([0-9a-fA-F]+);/g, (_, hex: string) =>
			String.fromCodePoint(Number.parseInt(hex, 16))
		)
		.replace(/&#(\d+);/g, (_, dec: string) => String.fromCodePoint(Number.parseInt(dec, 10)))
		.replace(/&quot;/g, '"')
		.replace(/&apos;/g, "'")
		.replace(/&lt;/g, '<')
		.replace(/&gt;/g, '>')
		.replace(/&nbsp;/g, ' ')
		.replace(/&amp;/g, '&');
}

export async function renderMarkdown(
	content: string,
	options?: { category?: string }
): Promise<string> {
	let processed = content;
	if (options?.category) {
		const category = options.category;
		// Rewrite markdown images with relative path ./images/ or images/ to /docs/<category>/images/
		// Supports optional title: ![Alt](./images/pic.png "Image Title")
		processed = processed
			.replace(
				/!\[([^\]]*)\]\((?:\.\/)?images\/([^\s)]+)(?:\s+(".*?"|'.*?'))?\)/g,
				(_, alt, filename, title) => {
					const titlePart = title ? ` ${title}` : '';
					return `![${alt}](/docs/${category}/images/${filename}${titlePart})`;
				}
			)
			.replace(/(src=["'])(?:\.\/)?images\/([^"'\s]+)(["'])/gi, `$1/docs/${category}/images/$2$3`);
	}

	const result = await processor.process(processed);
	return addImagePerformanceAttributes(applyCustomHeadingIds(transformCallouts(String(result))));
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
	const regex = /<h([23])\s+id="([^"]*)"[^>]*>(.*?)<\/h\1>/gi;
	let match;
	while ((match = regex.exec(html)) !== null) {
		const level = Number(match[1]) as 2 | 3;
		const id = match[2] ?? '';
		// Strip KaTeX MathML duplicate and inner HTML tags, then decode HTML entities
		const rawInner = (match[3] ?? '').replace(/<span class="katex-mathml">[\s\S]*?<\/span>/gi, '');
		const text = decodeHtmlEntities(rawInner.replace(/<[^<>]*>/g, '')).trim();
		if (id && text) {
			headings.push({ id, text, level });
		}
	}
	return headings;
}
