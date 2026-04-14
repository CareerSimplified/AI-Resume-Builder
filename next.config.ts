import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    resolveAlias: {
      canvas: 'false',
    },
  },

  webpack: (config, { isServer }) => {
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

    // Handle pdfjs-dist worker
    config.resolve.alias = {
      ...config.resolve.alias,
      'pdfjs-dist/build/pdf.worker.min': 'pdfjs-dist/build/pdf.worker.min.js',
      'pdfjs-dist/build/pdf.worker': 'pdfjs-dist/build/pdf.worker.js',
    };
    
    return config;
  },

  experimental: {
    optimizePackageImports: ['lucide-react', 'clsx'],
  },
};

export default nextConfig;
