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

	return (
		<>
			{cfToken && (
				<Script
					defer
					src="https://static.cloudflareinsights.com/beacon.min.js"
					data-cf-beacon={JSON.stringify({ token: cfToken })}
					strategy="afterInteractive"
				/>
			)}
			{umamiWebsiteId && (
				<Script defer src={umamiSrc} data-website-id={umamiWebsiteId} strategy="afterInteractive" />
			)}
		</>
	);
}
