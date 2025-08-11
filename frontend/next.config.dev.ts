import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Remove output: 'export' for development mode
  images: {
    unoptimized: true
  },
  // Enable React strict mode for better debugging
  reactStrictMode: true,
  
  // Experimental features for better hydration handling
  experimental: {
    // Enable better hydration error recovery
    optimisticClientCache: true,
  },

  // Webpack configuration to handle browser extension conflicts
  webpack: (config, { dev, isServer }) => {
    if (dev && !isServer) {
      // Only apply in development client-side
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
      };
    }
    return config;
  },

  // Custom headers for development
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          }
        ],
      },
    ];
  },

  /* config options here */
};

export default nextConfig;