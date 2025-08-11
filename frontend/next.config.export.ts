import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
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

      // Add plugin to handle hydration issues in development
      config.plugins.push(
        new (class HydrationMismatchPlugin {
          apply(compiler: any) {
            compiler.hooks.done.tap('HydrationMismatchPlugin', () => {
              // This runs after compilation
              if (typeof window !== 'undefined') {
                // Client-side cleanup of extension attributes
                setTimeout(() => {
                  const problematicAttributes = [
                    'rtrvr-listeners',
                    'data-rtrvr',
                    'grammalecte',
                    'data-lt-installed'
                  ];
                  
                  problematicAttributes.forEach(attr => {
                    document.querySelectorAll(`[${attr}]`).forEach(el => {
                      el.removeAttribute(attr);
                    });
                  });
                }, 100);
              }
            });
          }
        })()
      );
    }
    return config;
  },

  // Custom headers for better extension compatibility
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
          },
          // Prevent some extensions from modifying content
          {
            key: 'Content-Security-Policy',
            value: "script-src 'self' 'unsafe-inline' 'unsafe-eval'; object-src 'none';"
          }
        ],
      },
    ];
  },

  /* config options here */
};

export default nextConfig;
