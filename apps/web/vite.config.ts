import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'url';
import path from 'path';

const monorepoRoot = fileURLToPath(new URL('../../', import.meta.url));
const isVitest = !!process.env.VITEST;

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: true,
    fs: {
      allow: [monorepoRoot],
    },
  },
  // Vitest-only configuration (when Vitest reads Vite config)
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    alias: {
      // Point shared-types to source during tests so no prior build is required
      'shared-types': path.resolve(monorepoRoot, 'packages/shared-types/src/index.ts'),
    },
  },
  resolve: {
    alias: Object.assign(
      {
        '@ui-theme': path.resolve(monorepoRoot, 'packages/ui-theme/dist'),
        '@ui': path.resolve(monorepoRoot, 'packages/ui/src'),
        // Build-time resolution to built shared-types
        'shared-types': path.resolve(monorepoRoot, 'packages/shared-types/dist/index.js'),
      },
      isVitest
        ? {
            // During vitest, point to source to avoid requiring a prior build
            'shared-types': path.resolve(
              monorepoRoot,
              'packages/shared-types/src/index.ts'
            ),
          }
        : {}
    ),
  },
});