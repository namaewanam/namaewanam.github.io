/** @type {import('next').NextConfig} */
const isProd = process.env.NODE_ENV === 'production';

const nextConfig = {
  output: isProd ? 'export' : undefined,
  images: {
    unoptimized: true,
  },
  basePath: isProd ? '/namaewanam.github.io' : '',
  assetPrefix: isProd ? '/namaewanam.github.io/' : '',
  trailingSlash: true,
}

module.exports = nextConfig
