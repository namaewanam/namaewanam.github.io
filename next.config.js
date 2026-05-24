/** @type {import('next').NextConfig} */
const withBundleAnalyzer = require('@next/bundle-analyzer')({
	enabled: process.env.ANALYZE === 'true',
});

const nextConfig = {
	// Output
	// Static HTML export for GitHub Pages CDN hosting.
	// Keep dev mode on the normal Next.js server so invalid dynamic params
	// can fall through to the app's not-found handling instead of hard errors.
	output: process.env.NODE_ENV === 'production' ? 'export' : undefined,

	// Performance
	compress: true,
	reactStrictMode: true,
	productionBrowserSourceMaps: false,

	images: {
		unoptimized: true,
		deviceSizes: [640, 750, 828, 1080, 1200, 1920],
		imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
	},
	eslint: {
		ignoreDuringBuilds: true,
	},

	// NOTE: Security headers (CSP, HSTS, X-Frame-Options etc.) are defined
	// in public/_headers for the CDN (GitHub Pages / Cloudflare / Netlify).
	// The Next.js headers() API does NOT apply to static exports and was
	// breaking dev mode (unsafe-eval needed for HMR). Removed intentionally.
};

module.exports = withBundleAnalyzer(nextConfig);
