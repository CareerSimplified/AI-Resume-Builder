import type { NextConfig } from "next";
import fs from 'fs';
import path from 'path';

// Copy pdfjs worker to public folder
const pdfjsWorkerSource = path.join(process.cwd(), 'node_modules/pdfjs-dist/build/pdf.worker.min.js');
const pdfjsWorkerDest = path.join(process.cwd(), 'public/pdf.worker.min.js');

try {
  if (!fs.existsSync(pdfjsWorkerDest)) {
    fs.copyFileSync(pdfjsWorkerSource, pdfjsWorkerDest);
  }
} catch (err) {
  console.warn('Failed to copy PDF worker:', err);
}

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
