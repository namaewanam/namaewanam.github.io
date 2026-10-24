import Script from 'next/script';

/**
 * Lightweight, privacy-first web analytics component.
 * Automatically activates Cloudflare Web Analytics or Umami when their
 * respective environment variables are provided. Zero cookies, GDPR compliant.
 */
export default function Analytics() {
	const cfToken =
		process.env.NEXT_PUBLIC_CF_ANALYTICS_TOKEN ||
		process.env.NEXT_PUBLIC_CLOUDFLARE_ANALYTICS_TOKEN;
	const umamiWebsiteId = process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID;
	const umamiSrc = process.env.NEXT_PUBLIC_UMAMI_SRC || 'https://cloud.umami.is/script.js';

	if (!cfToken && !umamiWebsiteId) {
		return null;
	}

	return (
		<>
			{cfToken && (
				<Script
					strategy="afterInteractive"
					src="https://static.cloudflareinsights.com/beacon.min.js"
					data-cf-beacon={`{"token": "${cfToken}"}`}
				/>
			)}
			{umamiWebsiteId && (
				<Script strategy="afterInteractive" src={umamiSrc} data-website-id={umamiWebsiteId} />
			)}
		</>
	);
}
