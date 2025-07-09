import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Test environment optimizations
const isTestEnv = process.env.NODE_ENV === 'test';

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: isTestEnv ? [] : ['error'], // Reduce logging in tests
  datasources: {
    db: {
      url: isTestEnv 
        ? `${process.env.DATABASE_URL}?connection_limit=50&pool_timeout=20&connect_timeout=60&schema_disable_advisory_lock=1`
        : process.env.DATABASE_URL
    }
  },
  transactionOptions: {
    timeout: isTestEnv ? 30000 : 5000, // Longer timeout for tests
    maxWait: isTestEnv ? 30000 : 2000,
  }
});

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma; 