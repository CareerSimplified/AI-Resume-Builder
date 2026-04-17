import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    resolveAlias: {
      canvas: 'false',
    },
  },

  webpack: (config) => {
    // Prevent canvas from being bundled (pdf-parse dependency)
    config.resolve.alias = {
      ...config.resolve.alias,
      canvas: false,
    };

    return config;
  },

  experimental: {
    optimizePackageImports: ['lucide-react', 'clsx'],
  },
};

export default nextConfig;
