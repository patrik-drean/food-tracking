/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    typedRoutes: true,
  },
  env: {
    NEXT_PUBLIC_GRAPHQL_ENDPOINT: process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT || 'http://localhost:4000/graphql',
  },
  // Static export configuration for GitHub Pages
  output: process.env.NODE_ENV === 'production' ? 'export' : undefined,
  trailingSlash: true,
  images: {
    unoptimized: process.env.NODE_ENV === 'production',
  },
  // Base path for GitHub Pages (if repo name is not username.github.io)
  basePath: process.env.NODE_ENV === 'production' ? '/food-tracking' : '',
  assetPrefix: process.env.NODE_ENV === 'production' ? '/food-tracking/' : '',
}

module.exports = nextConfig