/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: false, // Fix TS errors instead of hiding them
  },
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [360, 640, 750, 1080, 1200, 1920],
    minimumCacheTTL: 60,
  },
  experimental: {
    optimizeCss: true,
  },
  compress: true,
}

export default nextConfig
