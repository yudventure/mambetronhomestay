import path from 'path';
import type { NextConfig } from 'next';

// The repo root holds the brand build with its own package.json, so pin the
// app root to this folder.
const akar = path.resolve(__dirname);

const config: NextConfig = {
  poweredByHeader: false,
  outputFileTracingRoot: akar,
  turbopack: { root: akar },
  experimental: {
    // room and gallery photos are resized in the browser first, this is only a ceiling
    serverActions: { bodySizeLimit: '12mb' },
  },
};

export default config;
