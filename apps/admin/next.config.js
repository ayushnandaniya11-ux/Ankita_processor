/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@ankita/ui', '@ankita/types', '@ankita/utils', '@ankita/config', '@ankita/validation'],
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**.amazonaws.com' },
      { protocol: 'https', hostname: '**.cloudinary.com' },
      { protocol: 'http', hostname: 'localhost' },
    ],
  },
}

module.exports = nextConfig
