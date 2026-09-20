const catalog = require('./database/catalog.json')

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // Local images from /public don't need remote patterns
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  // Increase timeout for chunk loading
  onDemandEntries: {
    maxInactiveAge: 25 * 1000,
    pagesBufferLength: 2,
  },
  /**
   * Product URLs that changed with the September 2026 catalogue keep working.
   * The 3.75 Litre coolant became the 4 Liter, so its old address is permanently
   * redirected rather than left to 404 on links already out in the world.
   */
  async redirects() {
    return Object.entries(catalog.slug_redirects || {}).map(([from, to]) => ({
      source: `/products/${from}`,
      destination: `/products/${to}`,
      permanent: true,
    }))
  },
}

module.exports = nextConfig
