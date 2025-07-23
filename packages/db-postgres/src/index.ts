import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Test environment optimizations
const isTestEnv = process.env.NODE_ENV === 'test';

/**
 * Validates and returns the DATABASE_URL environment variable
 * @throws {Error} If DATABASE_URL is missing or invalid
 */
function validateDatabaseUrl(): string {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    throw new Error(
      'DATABASE_URL environment variable is required but not set. ' +
      'Please check your .env file or environment configuration.'
    );
  }

  if (typeof databaseUrl !== 'string' || databaseUrl.trim() === '') {
    throw new Error(
      'DATABASE_URL environment variable is empty or invalid. ' +
      'Please provide a valid PostgreSQL connection string.'
    );
  }

  // Basic URL format validation
  try {
    new URL(databaseUrl);
  } catch (error) {
    throw new Error(
      `DATABASE_URL environment variable contains an invalid URL format: ${databaseUrl}. ` +
      'Expected format: postgresql://username:password@host:port/database'
    );
  }

  return databaseUrl.trim();
}

// Helper function to properly append URL parameters
function buildDatabaseUrl(baseUrl: string, isTest: boolean): string {
  if (!isTest) return baseUrl;

  const url = new URL(baseUrl);
  // Optimize connection settings for test environment
  // Conservative settings to prevent overwhelming test database
  url.searchParams.set('connection_limit', '10'); // Further reduced for test stability
  url.searchParams.set('pool_timeout', '10'); // Shorter timeout for faster test feedback
  url.searchParams.set('connect_timeout', '30'); // Reduced connect timeout
  url.searchParams.set('schema_disable_advisory_lock', '1'); // Disable locks for test performance

  return url.toString();
}

// Validate DATABASE_URL before creating Prisma client
const databaseUrl = validateDatabaseUrl();

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: isTestEnv ? [] : ['error'], // Reduce logging in tests
  datasources: {
    db: {
      url: buildDatabaseUrl(databaseUrl, isTestEnv)
    }
  },
  transactionOptions: {
    timeout: isTestEnv ? 20000 : 5000, // Optimized timeout for tests
    maxWait: isTestEnv ? 10000 : 2000, // Reduced max wait for faster test feedback
  }
});

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma; 