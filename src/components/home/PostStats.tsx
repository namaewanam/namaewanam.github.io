import { getAllPosts } from '@/lib/markdown';

/**
 * Post stats dashboard — displays blog statistics as a compact card.
 * Server component that reads post data at build time.
 */
export default function PostStats({ lang = 'en' }: { lang?: string }) {
	const posts = getAllPosts(lang);

	const totalPosts = posts.length;
	const uniqueCategories = new Set(posts.map((p) => p.category)).size;

	let totalWords = 0;
	let totalCodeBlocks = 0;
	let totalReadingTime = 0;
	const tagCounts: Record<string, number> = {};

	posts.forEach((post) => {
		totalWords += post.content.split(/\s+/).length;
		totalReadingTime += post.readingTimeMin;

		const codeMatches = post.content.match(/```/g);
		if (codeMatches) {
			totalCodeBlocks += Math.floor(codeMatches.length / 2);
		}

		post.tags?.forEach((tag) => {
			tagCounts[tag] = (tagCounts[tag] || 0) + 1;
		});
	});

	const avgReadingTime = totalPosts > 0 ? Math.round(totalReadingTime / totalPosts) : 0;

	const topTags = Object.entries(tagCounts)
		.sort((a, b) => b[1] - a[1])
		.slice(0, 3)
		.map(([tag]) => `#${tag}`)
		.join(' ');

	const formatWords = (count: number) => {
		if (count >= 1000) return `~${Math.round(count / 1000)}k`;
		return count.toString();
	};

	if (totalPosts === 0) return null;

	return (
		<div className="rounded border border-border/70 bg-card/40 p-4 font-mono text-xs">
			<div className="mb-2 text-primary">stats</div>
			<div className="flex flex-col gap-1 text-muted-foreground">
				<div>
					{totalPosts} posts · {uniqueCategories} topics · {formatWords(totalWords)} words
				</div>
				<div>
					avg {avgReadingTime} min read · {totalCodeBlocks} code blocks
				</div>
				{topTags && <div>top: {topTags}</div>}
			</div>
		</div>
	);
}
