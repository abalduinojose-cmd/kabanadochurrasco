import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';

export default defineConfig([
  ...nextVitals,
  ...nextTs,
  globalIgnores(['.next/**', 'out/**', 'public/sw.js', 'docs/**', '.pages-test/**', 'scripts/.cache-fotos/**', 'next-env.d.ts']),
]);
