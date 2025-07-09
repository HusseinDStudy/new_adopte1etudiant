import { beforeAll, afterAll, beforeEach } from 'vitest';
import { resetDatabase } from './test-setup';

// Global test setup
beforeAll(async () => {
  console.log('🧪 Starting test suite - setting up global environment...');
  // Ensure we start with a clean database
  await resetDatabase();
});

beforeEach(async () => {
  // Reset database before each test to ensure isolation
  await resetDatabase();
});

afterAll(async () => {
  console.log('🧪 Test suite complete - cleaning up...');
  // Final cleanup
  await resetDatabase();
}); 