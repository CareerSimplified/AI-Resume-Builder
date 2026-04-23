import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  // Turbopack aliasing
  turbopack: {
    resolveAlias: {
      canvas: 'false',
    },
  },

  // Webpack aliasing for standard and server builds
  webpack: (config, { isServer }) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      canvas: false,
      'node-canvas': false,
    };

    if (isServer) {
      // Specifically target server-side bundling
      config.externals = [...(config.externals || []), { canvas: 'canvas' }];
    }

    return config;
  },

};

export default nextConfig;
