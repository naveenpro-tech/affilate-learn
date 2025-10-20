import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    domains: ['res.cloudinary.com', 'localhost'],
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '8000',
        pathname: '/static/**',
      },
      {
        protocol: 'https',
        hostname: '*.railway.app',
        pathname: '/static/**',
      },
    ],
  },
  // Enable standalone output for Docker
  output: 'standalone',
  // Disable ESLint during builds
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Disable TypeScript errors during builds
  typescript: {
    ignoreBuildErrors: true,
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

