import { getSitemapEntries } from '../src/lib/sitemap';
import { SITE_HOSTNAME, SITE_URL } from '../src/lib/site';

const INDEXNOW_KEY = process.env.INDEXNOW_KEY || '040d0997fe294f81a771cc53af3c5e60';
const INDEXNOW_ENDPOINT = 'https://api.indexnow.org/indexnow';

async function submitIndexNow() {
	// If URLs are passed as CLI arguments, use them; otherwise submit all sitemap URLs
	const cliArgs = process.argv.slice(2);
	const urls = cliArgs.length > 0 ? cliArgs : getSitemapEntries().map((entry) => entry.url);

	if (urls.length === 0) {
		console.log('No URLs to submit to IndexNow.');
		return;
	}

	const host = SITE_HOSTNAME || 'namaewanam.github.io';
	const keyLocation = `${SITE_URL}/${INDEXNOW_KEY}.txt`;

	console.log(`Submitting ${urls.length} URL(s) to IndexNow (${INDEXNOW_ENDPOINT})...`);
	console.log(`Host: ${host}`);
	console.log(`Key location: ${keyLocation}`);

	const payload = {
		host,
		key: INDEXNOW_KEY,
		keyLocation,
		urlList: urls,
	};

	const endpoints = [INDEXNOW_ENDPOINT, 'https://www.bing.com/indexnow'];

	for (const endpoint of endpoints) {
		console.log(`Submitting to ${endpoint}...`);
		try {
			const response = await fetch(endpoint, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json; charset=utf-8',
				},
				body: JSON.stringify(payload),
			});

			if (response.ok || response.status === 200 || response.status === 202) {
				console.log(
					`✓ Successfully submitted ${urls.length} URL(s) to IndexNow via ${endpoint}! (HTTP ${response.status})`
				);
				return;
			}

			const body = await response.text();
			console.warn(
				`⚠ IndexNow submission via ${endpoint} returned HTTP ${response.status}: ${body}`
			);
		} catch (error) {
			console.warn(`⚠ Network error connecting to ${endpoint}:`, error);
		}
	}

	console.error('✗ All IndexNow submission attempts failed.');
	process.exitCode = 1;
}

submitIndexNow();
