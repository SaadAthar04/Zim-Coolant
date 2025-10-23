/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // appDir: true // This is no longer needed in Next.js 14
  },
  images: {
    domains: ['localhost', 'nvwbxrdbppykdguevacb.supabase.co'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'nvwbxrdbppykdguevacb.supabase.co',
        port: '',
        pathname: '/storage/v1/object/sign/**',
      },
    ],
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  // Increase timeout for chunk loading
  onDemandEntries: {
    maxInactiveAge: 25 * 1000,
    pagesBufferLength: 2,
  },
}

module.exports = nextConfig
