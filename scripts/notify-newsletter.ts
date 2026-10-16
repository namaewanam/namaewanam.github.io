/**
 * Automated Newsletter Notification Script
 * Integrates with Buttondown's REST API (free on all plans).
 *
 * Runs in CI after successful deployment to main.
 * Finds newly added markdown articles under docs/ and creates a draft or scheduled
 * email in Buttondown.
 *
 * Safe defaults:
 * - Exits gracefully (code 0) if BUTTONDOWN_API_KEY is not set.
 * - Defaults to status="draft" so you can review before sending (can be set to "about_to_send").
 * - Supports passing a file path manually: tsx scripts/notify-newsletter.ts <path-to-markdown>
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import matter from 'gray-matter';

const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://namaewanam.github.io').replace(
	/\/$/,
	''
);
const SITE_NAME = process.env.NEXT_PUBLIC_SITE_NAME || 'nam';
const BUTTONDOWN_API_KEY = process.env.BUTTONDOWN_API_KEY?.trim();
// Status: "draft" (default) or "about_to_send" (send immediately to subscribers)
const EMAIL_STATUS = (process.env.BUTTONDOWN_EMAIL_STATUS || 'draft').trim();

interface PostDetails {
	filePath: string;
	title: string;
	description?: string | undefined;
	date?: string | undefined;
	category: string;
	url: string;
}

function isSeriesFile(filename: string): boolean {
	return /^_series(?:\.[a-z]{2})?\.md$/i.test(filename);
}

function getNewMarkdownFiles(): string[] {
	// If a specific file or list of files is passed via CLI args:
	const cliArgs = process.argv
		.slice(2)
		.filter((arg) => arg.endsWith('.md') && !isSeriesFile(path.basename(arg)));
	if (cliArgs.length > 0) {
		return cliArgs.filter((f) => fs.existsSync(f));
	}

	try {
		// Detect newly added markdown files in the most recent commit
		const diffOutput = execSync(
			'git diff-tree -r --no-commit-id --name-only --diff-filter=A HEAD',
			{
				encoding: 'utf8',
				stdio: ['pipe', 'pipe', 'ignore'],
			}
		);

		return diffOutput
			.split('\n')
			.map((line) => line.trim())
			.filter(
				(line) =>
					line.startsWith('docs/') &&
					line.endsWith('.md') &&
					!isSeriesFile(path.basename(line)) &&
					fs.existsSync(line)
			);
	} catch (err) {
		console.warn('Could not determine git diff:', err);
		return [];
	}
}

function parsePostDetails(filePath: string): PostDetails | null {
	try {
		const raw = fs.readFileSync(filePath, 'utf8');
		const { data } = matter(raw);

		// Extract relative path inside docs/
		const relPath = path.relative(path.join(process.cwd(), 'docs'), filePath);
		const segments = relPath.split(path.sep);

		// Category is the top-level directory under docs/
		const category = segments[0] || 'Blog';
		// Path without .md extension
		const slugPath = relPath.replace(/\.md$/, '').replace(/\\/g, '/');

		const title = data.title
			? String(data.title)
			: path.basename(filePath, '.md').replace(/-/g, ' ');
		const description = data.description ? String(data.description) : undefined;
		const date = data.date ? String(data.date).slice(0, 10) : undefined;
		const lang = data.lang ? String(data.lang) : 'en';

		// Construct live post URL
		const url = `${SITE_URL}/${lang}/blog/${slugPath}`;

		return {
			filePath,
			title,
			description,
			date,
			category,
			url,
		};
	} catch (err) {
		console.error(`Failed to parse post at ${filePath}:`, err);
		return null;
	}
}

function buildEmailBody(post: PostDetails): string {
	const lines: string[] = [];

	lines.push(`# ${post.title}`);
	lines.push('');

	if (post.description) {
		lines.push(`> ${post.description}`);
		lines.push('');
	}

	lines.push(`A new article has been published on [${SITE_NAME}'s blog](${post.url}).`);
	lines.push('');

	if (post.date) {
		lines.push(`- **Date:** ${post.date}`);
	}
	lines.push(`- **Category:** ${post.category}`);
	lines.push('');
	lines.push('---');
	lines.push('');
	lines.push(`[👉 Read the full article on the blog](${post.url})`);
	lines.push('');
	lines.push('---');
	lines.push(
		`*You received this email because you subscribed to updates on [${SITE_URL}](${SITE_URL}).*`
	);

	return lines.join('\n');
}

async function sendToButtondown(post: PostDetails): Promise<boolean> {
	if (!BUTTONDOWN_API_KEY) {
		console.log('BUTTONDOWN_API_KEY is not set. Skipping newsletter notification.');
		return false;
	}

	const subject = `New post: ${post.title}`;
	const body = buildEmailBody(post);

	const payload = {
		subject,
		body,
		status: EMAIL_STATUS,
	};

	console.log(`Sending to Buttondown API (status: "${EMAIL_STATUS}")...`);
	console.log(`Subject: "${subject}"`);
	console.log(`URL: ${post.url}`);

	try {
		const response = await fetch('https://api.buttondown.com/v1/emails', {
			method: 'POST',
			headers: {
				Authorization: `Token ${BUTTONDOWN_API_KEY}`,
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(payload),
		});

		if (!response.ok) {
			const errorText = await response.text();
			console.error(`Buttondown API error (${response.status}):`, errorText);
			return false;
		}

		const data = (await response.json()) as { id?: string; status?: string };
		console.log(
			`✓ Successfully created Buttondown email (ID: ${data.id ?? 'unknown'}, Status: ${data.status ?? EMAIL_STATUS})`
		);
		return true;
	} catch (err) {
		console.error('Network error calling Buttondown API:', err);
		return false;
	}
}

async function main() {
	const files = getNewMarkdownFiles();

	if (files.length === 0) {
		console.log('No new markdown articles detected in this commit. Nothing to notify.');
		return;
	}

	console.log(`Detected ${files.length} new article(s):`, files);

	if (!BUTTONDOWN_API_KEY) {
		console.log('BUTTONDOWN_API_KEY environment variable is not configured. Skipping API call.');
		console.log(
			'To enable newsletter emails, add BUTTONDOWN_API_KEY to your GitHub repository secrets.'
		);
		return;
	}

	for (const file of files) {
		const post = parsePostDetails(file);
		if (post) {
			await sendToButtondown(post);
		}
	}
}

main().catch((err) => {
	console.error('Unexpected error in newsletter notification script:', err);
	// Exit cleanly so CI deployment doesn't get marked as failed due to newsletter notifications
	process.exit(0);
});
