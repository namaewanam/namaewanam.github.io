/** @type {import('next').NextConfig} */
const isProd = process.env.NODE_ENV === 'production';

const nextConfig = {
  output: isProd ? 'export' : undefined,
  images: {
    unoptimized: true,
  },
  basePath: isProd ? '/notes' : '',
  assetPrefix: isProd ? '/notes/' : '',
  trailingSlash: true,
}

module.exports = nextConfig