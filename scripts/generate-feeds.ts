/**
 * Build-time script: generates sitemap.xml and feed.xml in public/.
 * Run via: pnpm build:feeds (automatically runs before `pnpm build`).
 */
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

import { buildOgImage } from '../src/lib/og';
import { toPostOgSlug } from '../src/lib/site';
import type { Category, Post } from '../src/lib/markdown';

const SITE_URL = 'https://ntnam1605.github.io';
const SITE_TITLE = 'nam · backend dev';
const SITE_DESCRIPTION = 'Notes, articles and thoughts from a backend developer';

const publicDir = path.join(process.cwd(), 'public');
const postOgDir = path.join(publicDir, 'og', 'posts');
const postMetadataPath = path.join(publicDir, '_content', 'post-metadata.json');
const docsDir = path.join(process.cwd(), 'docs');

interface PostMetaManifest {
	generatedAt: string;
	posts: Record<string, { lastUpdated: string }>;
}

function getStagedMarkdownFiles(): string[] {
	try {
		const output = execSync('git diff --cached --name-only --diff-filter=ACMR -- docs', {
			encoding: 'utf8',
			stdio: ['pipe', 'pipe', 'ignore'],
		});

		return output
			.split('\n')
			.map((line) => line.trim())
			.filter((line) => line.endsWith('.md') && !line.endsWith('_series.md'))
			.map((line) => path.join(process.cwd(), line));
	} catch {
		return [];
	}
}

function listMarkdownFiles(dir: string, filesList: string[] = []): string[] {
	const files = fs.readdirSync(dir);

	files.forEach((file) => {
		const filePath = path.join(dir, file);
		const stat = fs.statSync(filePath);

		if (stat.isDirectory()) {
			listMarkdownFiles(filePath, filesList);
			return;
		}

		if (file.endsWith('.md') && file !== '_series.md') {
			filesList.push(filePath);
		}
	});

	return filesList;
}

function buildPostKeyFromFilePath(filePath: string): string {
	const relative = path.relative(docsDir, filePath);
	const parts = relative.split(path.sep);
	const [category = '', ...rest] = parts;
	const fullPath = rest.join('/').replace(/\.md$/, '').toLowerCase();
	return `${category.toLowerCase()}/${fullPath}`;
}

function collectLastUpdatedManifest(): PostMetaManifest {
	const now = new Date().toISOString();
	const manifest: PostMetaManifest = {
		generatedAt: now,
		posts: {},
	};
	const allFiles = listMarkdownFiles(docsDir);

	if (allFiles.length === 0) {
		return manifest;
	}

	try {
		const output = execSync('git log --format=__COMMIT__%cI --name-only -- docs', {
			encoding: 'utf8',
			stdio: ['pipe', 'pipe', 'ignore'],
		});
		const lines = output.split('\n');
		let currentCommitDate = '';

		lines.forEach((line) => {
			if (!line.trim()) return;
			if (line.startsWith('__COMMIT__')) {
				currentCommitDate = line.replace('__COMMIT__', '').trim();
				return;
			}

			if (!line.endsWith('.md') || line.endsWith('_series.md') || !currentCommitDate) return;
			const absolutePath = path.join(process.cwd(), line);
			const key = buildPostKeyFromFilePath(absolutePath);
			if (!manifest.posts[key]) {
				manifest.posts[key] = { lastUpdated: currentCommitDate };
			}
		});
	} catch {
		allFiles.forEach((filePath) => {
			const stats = fs.statSync(filePath);
			const key = buildPostKeyFromFilePath(filePath);
			manifest.posts[key] = { lastUpdated: stats.mtime.toISOString() };
		});
	}

	if (process.env.USE_STAGED_LAST_UPDATED === '1') {
		const stagedFiles = getStagedMarkdownFiles();

		stagedFiles.forEach((filePath) => {
			if (!fs.existsSync(filePath)) return;
			const key = buildPostKeyFromFilePath(filePath);
			manifest.posts[key] = { lastUpdated: now };
		});
	}

	return manifest;
}

function generatePostMetadata(): void {
	const manifest = collectLastUpdatedManifest();
	fs.mkdirSync(path.dirname(postMetadataPath), { recursive: true });
	fs.writeFileSync(postMetadataPath, JSON.stringify(manifest, null, 2), 'utf8');
	console.log(`✓ Generated post metadata for ${Object.keys(manifest.posts).length} post(s)`);
}

// ── Sitemap ─────────────────────────────────────────────────────────────

function generateSitemap(posts: Post[], categories: Category[]): void {
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

function generateRssFeed(posts: Post[]): void {
	const latestPosts = posts.slice(0, 20); // Latest 20 posts

	const items = latestPosts.map((post) => {
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

async function generatePostOgImages(posts: Post[]): Promise<void> {
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
	generatePostMetadata();
	const { getAllPosts, getCategories } = await import('../src/lib/markdown');
	const posts = getAllPosts();
	const categories = getCategories();
	generateSitemap(posts, categories);
	generateRssFeed(posts);
	await generatePostOgImages(posts);
}

main().catch((error) => {
	console.error('Failed to generate build artifacts', error);
	process.exitCode = 1;
});
