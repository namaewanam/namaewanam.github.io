/**
 * Build-time script: generates sitemap.xml and feed.xml in public/.
 * Run via: pnpm build:feeds (automatically runs before `pnpm build`).
 */
import fs from 'fs';
import path from 'path';

// Import from source — tsx handles TypeScript transpilation
import { getAllPosts, getCategories } from '../src/lib/markdown';
import { buildOgImage } from '../src/lib/og';
import { toPostOgSlug } from '../src/lib/site';

const SITE_URL = 'https://ntnam1605.github.io';
const SITE_TITLE = 'nam · backend dev';
const SITE_DESCRIPTION = 'Notes, articles and thoughts from a backend developer';

const publicDir = path.join(process.cwd(), 'public');
const postOgDir = path.join(publicDir, 'og', 'posts');

// ── Sitemap ─────────────────────────────────────────────────────────────

function generateSitemap(): void {
	const posts = getAllPosts();
	const categories = getCategories();
	const now = new Date().toISOString();

	const urls: { loc: string; lastmod: string; priority: string }[] = [
		{ loc: '/', lastmod: now, priority: '1.0' },
		{ loc: '/blog', lastmod: now, priority: '0.9' },
	];

	categories.forEach((cat) => {
		urls.push({
			loc: `/blog/${cat.slug}`,
			lastmod: now,
			priority: '0.7',
		});
	});

	posts.forEach((post) => {
		urls.push({
			loc: `/blog/${post.category}/${post.fullPath}`,
			lastmod: post.lastUpdated ?? post.date ?? now,
			priority: '0.8',
		});
	});

	const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
	.map(
		(u) => `  <url>
    <loc>${SITE_URL}${u.loc}</loc>
    <lastmod>${u.lastmod}</lastmod>
    <priority>${u.priority}</priority>
  </url>`
	)
	.join('\n')}
</urlset>`;

	fs.writeFileSync(path.join(publicDir, 'sitemap.xml'), xml, 'utf8');
	console.log('✓ Generated sitemap.xml');
}

// ── RSS Feed ────────────────────────────────────────────────────────────

function escapeXml(str: string): string {
	return str
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&apos;');
}

function generateRssFeed(): void {
	const posts = getAllPosts().slice(0, 20); // Latest 20 posts

	const items = posts.map((post) => {
		const pubDate = post.date ? new Date(post.date).toUTCString() : new Date().toUTCString();
		const link = `${SITE_URL}/blog/${post.category}/${post.fullPath}`;

		return `    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${link}</link>
      <guid isPermaLink="true">${link}</guid>
      <pubDate>${pubDate}</pubDate>
      <description>${escapeXml(post.description ?? post.title)}</description>
      <category>${escapeXml(post.categoryName)}</category>
    </item>`;
	});

	const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(SITE_TITLE)}</title>
    <link>${SITE_URL}</link>
    <description>${escapeXml(SITE_DESCRIPTION)}</description>
    <language>en</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${SITE_URL}/feed.xml" rel="self" type="application/rss+xml"/>
${items.join('\n')}
  </channel>
</rss>`;

	fs.writeFileSync(path.join(publicDir, 'feed.xml'), xml, 'utf8');
	console.log('✓ Generated feed.xml');
}

// ── OG Images ───────────────────────────────────────────────────────────

async function writeImage(filePath: string, image: Response): Promise<void> {
	const buffer = Buffer.from(await image.arrayBuffer());
	fs.mkdirSync(path.dirname(filePath), { recursive: true });
	fs.writeFileSync(filePath, buffer);
}

async function generatePostOgImages(): Promise<void> {
	const posts = getAllPosts();

	await Promise.all(
		posts.map(async (post) => {
			const fileName = `${toPostOgSlug(post.category, post.fullPath)}.png`;
			const filePath = path.join(postOgDir, fileName);
			const image = buildOgImage({
				eyebrow: post.categoryName,
				title: post.title,
				description: post.description ?? `~${post.readingTimeMin} min read`,
				meta: `${post.readingTimeMin} min // ${post.codePercent}% code`,
				path: `~/blog/${post.category}/${post.slug}`,
			});
			await writeImage(filePath, image);
		})
	);

	console.log(`✓ Generated ${posts.length} post OG image(s)`);
}

// ── Run ─────────────────────────────────────────────────────────────────

async function main() {
	generateSitemap();
	generateRssFeed();
	await generatePostOgImages();
}

main().catch((error) => {
	console.error('Failed to generate build artifacts', error);
	process.exitCode = 1;
});
