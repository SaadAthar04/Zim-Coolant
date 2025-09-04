/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // appDir: true // This is no longer needed in Next.js 14
  },
  images: {
    domains: ['localhost'],
  },
  // Increase timeout for chunk loading
  onDemandEntries: {
    maxInactiveAge: 25 * 1000,
    pagesBufferLength: 2,
  },
}

module.exports = nextConfig
