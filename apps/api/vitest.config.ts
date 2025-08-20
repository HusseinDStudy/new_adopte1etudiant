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
    testTimeout: 60000,
    hookTimeout: 60000,
    // Add delays between tests to reduce database load
    sequence: {
      hooks: 'list',
    },
    // Reduce concurrent operations
    maxConcurrency: 1,
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
        'src/config/**', // Configuration files
        'scripts/**', // Script files
        'vitest.config.ts', // Test configuration
      ],
      thresholds: {
        lines: 80, // Higher threshold for better coverage
        functions: 85,
        branches: 75,
        statements: 80,
      },
    },
  },
}); 