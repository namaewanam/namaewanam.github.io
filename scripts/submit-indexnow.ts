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

	try {
		const response = await fetch(INDEXNOW_ENDPOINT, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json; charset=utf-8',
			},
			body: JSON.stringify(payload),
		});

		if (response.ok || response.status === 200 || response.status === 202) {
			console.log(
				`✓ Successfully submitted ${urls.length} URL(s) to IndexNow! (HTTP ${response.status} ${response.statusText || 'OK'})`
			);
		} else {
			const body = await response.text();
			console.error(
				`✗ IndexNow submission failed with HTTP ${response.status} ${response.statusText}`
			);
			if (body) {
				console.error(`Response details: ${body}`);
			}
			process.exitCode = 1;
		}
	} catch (error) {
		console.error('✗ Network error while connecting to IndexNow:', error);
		process.exitCode = 1;
	}
}

submitIndexNow();
