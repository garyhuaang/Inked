import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Replaces eslint-config-next's default ignores, so those are re-listed.
  globalIgnores([
    '.next/**',
    'out/**',
    'build/**',
    'next-env.d.ts',
    // Copied from node_modules by scripts/copy-maplibre-worker.mjs.
    'public/maplibre/**',
  ]),
]);

export default eslintConfig;
