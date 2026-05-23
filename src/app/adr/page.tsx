import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { renderMarkdown } from '@/lib/mdx';
import type { Metadata } from 'next';
import { SITE_NAME } from '@/lib/site';
import Link from 'next/link';

export const metadata: Metadata = {
	title: `ADR · ${SITE_NAME}`,
	description:
		'Architecture Decision Records — engineering decisions with context and consequences.',
};

interface AdrMeta {
	slug: string;
	title: string;
	date?: string;
	status: 'proposed' | 'accepted' | 'deprecated' | 'superseded';
	deciders?: string[];
	content: string;
	html?: string;
}

const STATUS_COLORS: Record<string, string> = {
	accepted: 'text-emerald-600 dark:text-emerald-400',
	proposed: 'text-amber-600 dark:text-amber-400',
	deprecated: 'text-muted-foreground line-through',
	superseded: 'text-muted-foreground',
};

async function getAdrs(): Promise<AdrMeta[]> {
	const adrDir = path.join(process.cwd(), 'docs', 'adr');

	if (!fs.existsSync(adrDir)) return [];

	const files = fs
		.readdirSync(adrDir)
		.filter((f) => f.endsWith('.md'))
		.sort();

	const adrs = await Promise.all(
		files.map(async (file) => {
			const raw = fs.readFileSync(path.join(adrDir, file), 'utf8');
			const { data, content } = matter(raw);
			const html = await renderMarkdown(content);
			return {
				slug: file.replace(/\.md$/, ''),
				title: (data.title as string | undefined) ?? file.replace(/\.md$/, '').replace(/-/g, ' '),
				...(data.date ? { date: String(data.date) } : {}),
				status: ((data.status as string | undefined) ?? 'proposed') as AdrMeta['status'],
				...(data.deciders ? { deciders: data.deciders as string[] } : {}),
				content,
				...(html ? { html } : {}),
			} as AdrMeta;
		})
	);

	return adrs;
}

export default async function AdrPage() {
	const adrs = await getAdrs();

	return (
		<div className="mx-auto w-full max-w-3xl space-y-10">
			<div className="space-y-2">
				<p className="font-mono text-xs uppercase tracking-widest text-primary">adr</p>
				<h1 className="text-2xl font-bold text-foreground sm:text-3xl">
					Architecture Decision Records
				</h1>
				<p className="text-sm leading-relaxed text-foreground/70 sm:text-base">
					A log of significant engineering decisions — what was decided, why, and what the tradeoffs
					are. Inspired by{' '}
					<a
						href="https://adr.github.io"
						target="_blank"
						rel="noopener noreferrer"
						className="text-accent underline-offset-2 hover:underline"
					>
						adr.github.io
					</a>
					.
				</p>
			</div>

			{adrs.length === 0 ? (
				<div className="rounded border border-dashed border-border px-6 py-10 text-center">
					<p className="font-mono text-sm text-muted-foreground">
						No ADRs yet. Add markdown files to{' '}
						<code className="rounded bg-muted px-1.5 py-0.5 text-xs">docs/adr/</code>.
					</p>
				</div>
			) : (
				<div className="space-y-10">
					{adrs.map((adr) => (
						<article
							key={adr.slug}
							className="space-y-4 rounded border border-border bg-card/30 px-6 py-5"
						>
							<div className="flex flex-wrap items-start justify-between gap-2">
								<div className="space-y-1">
									<h2 className="text-base font-semibold text-foreground sm:text-lg">
										{adr.title}
									</h2>
									<div className="flex flex-wrap gap-3 font-mono text-xs text-muted-foreground">
										{adr.date && (
											<span>
												{new Date(adr.date).toLocaleDateString('en-US', {
													year: 'numeric',
													month: 'short',
													day: 'numeric',
												})}
											</span>
										)}
										{adr.deciders && adr.deciders.length > 0 && (
											<span>by {adr.deciders.join(', ')}</span>
										)}
									</div>
								</div>
								<span
									className={`rounded-full border border-current px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wider ${STATUS_COLORS[adr.status] ?? ''}`}
								>
									{adr.status}
								</span>
							</div>

							{adr.html && (
								<div
									className="prose prose-sm max-w-none text-foreground/85 prose-headings:text-foreground prose-strong:text-foreground prose-code:rounded prose-code:bg-muted prose-code:px-1 prose-code:text-[13px] prose-code:before:content-none prose-code:after:content-none"
									dangerouslySetInnerHTML={{ __html: adr.html }}
								/>
							)}
						</article>
					))}
				</div>
			)}

			<div className="border-t border-border pt-6">
				<Link
					href="/"
					className="font-mono text-xs text-muted-foreground transition-colors hover:text-foreground"
				>
					← home
				</Link>
			</div>
		</div>
	);
}
