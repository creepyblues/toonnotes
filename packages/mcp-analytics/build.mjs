/**
 * Build script for MCP Analytics API
 *
 * Bundles the api/mcp.ts file and all its dependencies into api/analytics.js
 * which Vercel will deploy.
 */

import * as esbuild from 'esbuild';
import { unlinkSync, existsSync } from 'fs';

// Bundle the API file from src to api directory (ESM format)
// Mark google-auth-library as external to avoid bundling issues
await esbuild.build({
  entryPoints: ['src/api-entry.ts'],
  bundle: true,
  platform: 'node',
  target: 'node18',
  format: 'esm',
  outfile: 'api/mcp.mjs',  // .mjs extension for ESM
  external: ['google-auth-library'],  // Don't bundle this - let Vercel's runtime resolve it
  minify: false,
  sourcemap: false,
  banner: {
    js: '// Bundled by esbuild - do not edit manually',
  },
});

console.log('✅ Bundled: api/mcp.js');

// api/ directory should only contain bundled .js files

console.log('✅ Build complete!');
