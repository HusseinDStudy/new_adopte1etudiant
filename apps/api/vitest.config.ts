import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    root: './',
    include: ['src/**/*.test.ts'],
    // Global setup for all tests
    setupFiles: ['src/helpers/test-globals.ts'],
    // Run tests sequentially to prevent database contamination
    pool: 'threads',
    poolOptions: {
      threads: {
        singleThread: true,
      },
    },
    // Increase timeout for database operations
    testTimeout: 30000,
    hookTimeout: 30000,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      // Exclude files that shouldn't be tested
      exclude: [
        'node_modules/**',
        'dist/**',
        'src/index.ts', // Main server file
        'prisma/**', // Database files
        'src/helpers/test-*', // Test helper files
        '**/*.d.ts', // Type definitions
        'src/fastify-oauth2.d.ts', // Type augmentation
      ],
      thresholds: {
        lines: 70, // More realistic threshold
        functions: 70,
        branches: 60,
        statements: 70,
      },
    },
  },
}); 