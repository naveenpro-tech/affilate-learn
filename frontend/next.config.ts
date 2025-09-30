import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    domains: ['res.cloudinary.com'],
  },
  // Disable all caching for fresh data on every request
  experimental: {
    staleTimes: {
      dynamic: 0,
      static: 0,
    },
  },
  // Disable static optimization
  generateBuildId: async () => {
    return 'build-' + Date.now();
  },
};

export default nextConfig;

