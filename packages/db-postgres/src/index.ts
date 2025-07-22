import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Test environment optimizations
const isTestEnv = process.env.NODE_ENV === 'test';

// Helper function to properly append URL parameters
function buildDatabaseUrl(baseUrl: string, isTest: boolean): string {
  if (!isTest) return baseUrl;

  const url = new URL(baseUrl);
  url.searchParams.set('connection_limit', '50');
  url.searchParams.set('pool_timeout', '20');
  url.searchParams.set('connect_timeout', '60');
  url.searchParams.set('schema_disable_advisory_lock', '1');

  return url.toString();
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: isTestEnv ? [] : ['error'], // Reduce logging in tests
  datasources: {
    db: {
      url: buildDatabaseUrl(process.env.DATABASE_URL!, isTestEnv)
    }
  },
  transactionOptions: {
    timeout: isTestEnv ? 30000 : 5000, // Longer timeout for tests
    maxWait: isTestEnv ? 30000 : 2000,
  }
});

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma; 