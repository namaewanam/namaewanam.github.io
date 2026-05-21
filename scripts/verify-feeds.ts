import fs from 'fs';
import path from 'path';
import { XMLParser } from 'fast-xml-parser';
import { FEED_PATHS } from '../src/lib/feed-paths';
import { SITE_URL } from '../src/lib/site';

const outDir = path.join(process.cwd(), 'out', 'feeds');
const rssPath = path.join(outDir, path.basename(FEED_PATHS.rss));
const atomPath = path.join(outDir, path.basename(FEED_PATHS.atom));
const jsonPath = path.join(outDir, path.basename(FEED_PATHS.json));

function assert(condition: unknown, message: string): asserts condition {
	if (!condition) {
		throw new Error(message);
	}
}

function ensureAbsoluteUrl(url: string, label: string) {
	assert(/^https?:\/\//.test(url), `${label} must be an absolute URL: ${url}`);
}

function asArray<T>(value: T | T[] | undefined): T[] {
	if (!value) return [];
	return Array.isArray(value) ? value : [value];
}

function verifyRss() {
	const parser = new XMLParser({ ignoreAttributes: false });
	const rss = parser.parse(fs.readFileSync(rssPath, 'utf8'));
	const channel = rss?.rss?.channel;
	assert(channel, 'RSS channel is missing');
	assert(channel.title === 'nam · backend dev', 'RSS title is incorrect');
	assert(
		channel['atom:link']?.['@_href'] === `${SITE_URL}${FEED_PATHS.rss}`,
		'RSS self link is missing or incorrect'
	);

	const items = asArray(channel.item);
	assert(items.length > 0, 'RSS has no items');

	for (const [index, item] of items.entries()) {
		assert(item.title, `RSS item ${index} is missing title`);
		ensureAbsoluteUrl(item.link, `RSS item ${index} link`);
		ensureAbsoluteUrl(item.guid?.['#text'] ?? item.guid, `RSS item ${index} guid`);
		assert(
			item.guid?.['@_isPermaLink'] === 'true',
			`RSS item ${index} guid should be marked as permalink`
		);
	}

	return items.length;
}

function verifyAtom(expectedCount: number) {
	const parser = new XMLParser({ ignoreAttributes: false });
	const atom = parser.parse(fs.readFileSync(atomPath, 'utf8'));
	const feed = atom?.feed;
	assert(feed, 'Atom feed is missing root feed node');
	assert(
		feed.link?.some?.(
			(link: { '@_rel'?: string; '@_href'?: string }) => link['@_rel'] === 'self'
		) ?? false,
		'Atom self link is missing'
	);

	const links = asArray(feed.link);
	const selfLink = links.find((link) => link['@_rel'] === 'self');
	assert(selfLink?.['@_href'] === `${SITE_URL}${FEED_PATHS.atom}`, 'Atom self link is incorrect');

	const entries = asArray(feed.entry);
	assert(entries.length === expectedCount, 'Atom entry count does not match RSS item count');

	for (const [index, entry] of entries.entries()) {
		assert(entry.title, `Atom entry ${index} is missing title`);
		ensureAbsoluteUrl(entry.id, `Atom entry ${index} id`);
		ensureAbsoluteUrl(entry.link?.['@_href'], `Atom entry ${index} link`);
	}
}

function verifyJson(expectedCount: number) {
	const feed = JSON.parse(fs.readFileSync(jsonPath, 'utf8')) as {
		version?: string;
		feed_url?: string;
		home_page_url?: string;
		items?: Array<Record<string, unknown>>;
	};

	assert(feed.version === 'https://jsonfeed.org/version/1', 'JSON Feed version is incorrect');
	assert(feed.feed_url === `${SITE_URL}${FEED_PATHS.json}`, 'JSON Feed self URL is incorrect');
	assert(feed.home_page_url === SITE_URL, 'JSON Feed home_page_url is incorrect');

	const items = feed.items ?? [];
	assert(items.length === expectedCount, 'JSON Feed item count does not match RSS item count');

	for (const [index, item] of items.entries()) {
		assert(
			typeof item.title === 'string' && item.title.length > 0,
			`JSON Feed item ${index} is missing title`
		);
		assert(typeof item.url === 'string', `JSON Feed item ${index} is missing url`);
		assert(typeof item.id === 'string', `JSON Feed item ${index} is missing id`);
		ensureAbsoluteUrl(String(item.url), `JSON Feed item ${index} url`);
		ensureAbsoluteUrl(String(item.id), `JSON Feed item ${index} id`);
		assert(
			typeof item.content_html === 'string' || typeof item.content_text === 'string',
			`JSON Feed item ${index} needs content_html or content_text`
		);
	}
}

function main() {
	assert(fs.existsSync(rssPath), `Missing RSS feed at ${rssPath}`);
	assert(fs.existsSync(atomPath), `Missing Atom feed at ${atomPath}`);
	assert(fs.existsSync(jsonPath), `Missing JSON Feed at ${jsonPath}`);

	const count = verifyRss();
	verifyAtom(count);
	verifyJson(count);
	console.log(`✓ Feed verification passed for ${count} item(s)`);
}

main();
