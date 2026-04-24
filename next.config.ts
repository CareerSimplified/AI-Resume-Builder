import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  // Turbopack aliasing
  // @ts-ignore
  turbo: {
    resolveAlias: {
      canvas: path.resolve(__dirname, 'empty.js'),
    },
  },
  // @ts-ignore
  turbopack: {},
  experimental: {
    // Other experimental features would go here
  },

  // Webpack aliasing
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
