import { defineConfig } from 'vitest/config';
import { fileURLToPath } from 'url';
import path from 'path';

const monorepoRoot = fileURLToPath(new URL('../../', import.meta.url));

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    exclude: ['**/e2e/**'],
  },
  resolve: {
    alias: {
      // Ensure vitest can import shared-types without a pre-build
      'shared-types': path.resolve(monorepoRoot, 'packages/shared-types/src/index.ts'),
      '@ui-theme': path.resolve(monorepoRoot, 'packages/ui-theme/dist'),
      '@ui': path.resolve(monorepoRoot, 'packages/ui/src'),
    },
  },
});

 
