import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {},

  webpack: (config, { isServer }) => {
    // Exclude canvas from pdfjs-dist bundle
    config.resolve.alias = {
      ...config.resolve.alias,
      canvas: false,
    };
    
    if (!isServer) {
      config.externals = [
        ...(Array.isArray(config.externals) ? config.externals : []),
        'canvas',
      ];
    }
    
    return config;
  },
};

export default nextConfig;
