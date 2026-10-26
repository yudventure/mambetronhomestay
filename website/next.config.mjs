import path from 'path';
import { fileURLToPath } from 'url';

// The repo root holds the brand build with its own package.json, so pin the
// app root to this folder.
const akar = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const config = {
  poweredByHeader: false,
  outputFileTracingRoot: akar,
  turbopack: { root: akar },
  experimental: {
    // room and gallery photos are resized in the browser first, this is only a ceiling
    serverActions: { bodySizeLimit: '12mb' },
  },
};

export default config;
