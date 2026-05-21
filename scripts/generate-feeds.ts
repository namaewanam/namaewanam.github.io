/**
 * Build-time script: generates post metadata and post OG images in public/.
 * Sitemap generation is handled by Next.js metadata routes in app/sitemap.ts.
 * Feed generation is handled by route handlers in app/feeds/* during build/export.
 * Run via: pnpm build:feeds (automatically runs before `pnpm build`).
 */
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

import { buildOgImage } from '../src/lib/og';
import { toPostOgSlug } from '../src/lib/site';
import type { Post } from '../src/lib/markdown';

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
	const { getAllPosts } = await import('../src/lib/markdown');
	const posts = getAllPosts();
	await generatePostOgImages(posts);
}

main().catch((error) => {
	console.error('Failed to generate build artifacts', error);
	process.exitCode = 1;
});
