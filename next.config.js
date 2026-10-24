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

	// NOTE: Security headers (CSP, HSTS, X-Frame-Options etc.) are defined
	// in public/_headers for the CDN (GitHub Pages / Cloudflare / Netlify).
	// The Next.js headers() API does NOT apply to static exports and was
	// breaking dev mode (unsafe-eval needed for HMR). Removed intentionally.
	turbopack: {},
	trailingSlash: true,
	experimental: {
		agentUpgrade: 'security',
		optimizePackageImports: ['lucide-react'],
	},
	...(process.env.NODE_ENV !== 'production' && {
		async redirects() {
			return [
				{
					source: '/',
					destination: '/en/',
					permanent: false,
				},
				{
					source: '/blog/:path*',
					destination: '/en/blog/:path*',
					permanent: false,
				},
				{
					source: '/snippets/:path*',
					destination: '/en/snippets/:path*',
					permanent: false,
				},
				{
					source: '/stack/:path*',
					destination: '/en/stack/:path*',
					permanent: false,
				},
				{
					source: '/reading-list/:path*',
					destination: '/en/reading-list/:path*',
					permanent: false,
				},
				{
					source: '/editor/:path*',
					destination: '/en/editor/:path*',
					permanent: false,
				},
				{
					source: '/changelog/:path*',
					destination: '/en/changelog/:path*',
					permanent: false,
				},
				{
					source: '/now/:path*',
					destination: '/en/now/:path*',
					permanent: false,
				},
				{
					source: '/adr/:path*',
					destination: '/en/adr/:path*',
					permanent: false,
				},
			];
		},
	}),
};

module.exports = withBundleAnalyzer(nextConfig);
