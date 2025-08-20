import { beforeAll, afterAll, beforeEach } from 'vitest';
import { cleanupDatabase, safeDbOperation } from './test-setup';
import { prisma } from 'db-postgres';

// Global test setup
beforeAll(async () => {
  console.log('🧪 Starting test suite - setting up global environment...');
  
  // Wait for database to be ready and connect prisma once globally
  await waitForDatabaseReady();
  
  // Ensure we start with a clean database
  await safeDbOperation(async () => {
    await cleanupDatabase(); // This will no longer call prisma.$connect internally
  });
});

beforeEach(async () => {
  // Add a small delay to reduce database load
  await new Promise(resolve => setTimeout(resolve, 100));
  
  // Reset database before each test to ensure isolation, relying on existing connection
  await safeDbOperation(async () => {
    await cleanupDatabase();
  });
});

afterAll(async () => {
  console.log('🧪 Test suite complete - cleaning up...');
  
  // Final cleanup with error handling
  await safeDbOperation(async () => {
    await cleanupDatabase();
  });
  
  // Ensure clean disconnection once at the end of all tests
  try {
    console.log('Attempting final database disconnect...');
    await prisma.$disconnect();
    console.log('Final database disconnected.');
  } catch (error) {
    console.warn('Failed to disconnect from database during final cleanup:', error);
  }
});

/**
 * Wait for database to be ready before running tests
 */
async function waitForDatabaseReady(maxAttempts = 30, delayMs = 1000) {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      await prisma.$connect();
      console.log(`✅ Database connection established (attempt ${attempt})`);
      return;
    } catch (error) {
      console.log(`⏳ Waiting for database... (attempt ${attempt}/${maxAttempts})`);
      if (attempt === maxAttempts) {
        console.error('❌ Database not ready after maximum attempts');
        throw new Error('Database connection failed after maximum attempts');
      }
      await new Promise(resolve => setTimeout(resolve, delayMs));
    }
  }
} 