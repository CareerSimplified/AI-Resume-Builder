import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Turbopack config (default bundler in Next.js 16)
  turbopack: {
    resolveAlias: {
      canvas: { browser: '' },
      'node-canvas': { browser: '' },
    },
  },
  experimental: {
    // Other experimental features would go here
  },

  // Webpack aliasing (fallback when using --webpack flag)
  // @ts-ignore
  webpack: (config: any, { isServer }: any) => {
    if (isServer) {
      config.externals = [...(config.externals || []), 'canvas', 'jsdom'];
    }
    config.resolve.alias = {
      ...config.resolve.alias,
      canvas: false,
      'node-canvas': false,
    };
    return config;
  },
};

export default nextConfig;

