import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Turbopack config (empty to use defaults, but required when webpack config is present)
  turbopack: {},
  
  webpack: (config, { isServer }) => {
    // Exclude canvas from pdfjs-dist client bundle
    if (!isServer) {
      if (!config.externals) {
        config.externals = [];
      }
      if (typeof config.externals === 'function') {
        const originalExternals = config.externals;
        config.externals = async (...args: any[]) => {
          const result = await originalExternals(...args);
          if (result && typeof result === 'string' && result === 'canvas') {
            return result;
          }
          return result;
        };
      } else {
        config.externals = [
          ...(Array.isArray(config.externals) ? config.externals : []),
          'canvas',
        ];
      }
    }
    return config;
  },
};

export default nextConfig;
