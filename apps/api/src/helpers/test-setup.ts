import { prisma } from 'db-postgres';
import { faker } from '@faker-js/faker';
import supertest from 'supertest';
import { FastifyInstance } from 'fastify';

/**
 * Comprehensive database cleanup that respects foreign key constraints
 */
export async function cleanupDatabase() {
  try {
    // Ensure database connection is healthy before cleanup
    await prisma.$connect();
    
    // Delete in correct order to respect foreign key constraints
    await safeDbOperation(() => prisma.message.deleteMany());
    await safeDbOperation(() => prisma.conversation.deleteMany());
    await safeDbOperation(() => prisma.application.deleteMany());
    await safeDbOperation(() => prisma.adoptionRequest.deleteMany());
    await safeDbOperation(() => prisma.offer.deleteMany());
    await safeDbOperation(() => prisma.studentSkill.deleteMany());
    await safeDbOperation(() => prisma.skill.deleteMany());
    await safeDbOperation(() => prisma.studentProfile.deleteMany());
    await safeDbOperation(() => prisma.companyProfile.deleteMany());
    await safeDbOperation(() => prisma.account.deleteMany());
    await safeDbOperation(() => prisma.user.deleteMany());
  } catch (error) {
    console.error('Database cleanup failed:', error);
    // Don't throw error to prevent test suite failures
    // Just log and continue
  } finally {
    // Always disconnect to free up connections
    try {
      await prisma.$disconnect();
    } catch (disconnectError) {
      console.warn('Failed to disconnect from database:', disconnectError);
    }
  }
}

/**
 * Reset database to a clean state before each test
 */
export async function resetDatabase() {
  await cleanupDatabase();
  
  // Optional: Add any seed data that all tests need
  // For now, we'll keep it clean
}

/**
 * Create a company user with profile for testing
 */
export async function createTestCompany(app: FastifyInstance, overrides: Partial<{
  email: string;
  password: string;
  name: string;
  contactEmail: string;
}> = {}) {
  const companyData = {
    email: faker.internet.email(),
    password: faker.internet.password(),
    role: 'COMPANY' as const,
    name: faker.company.name(),
    contactEmail: faker.internet.email(),
    ...overrides
  };

  // Register company
  const registerResponse = await supertest(app.server)
    .post('/api/auth/register')
    .send(companyData);
  
  if (registerResponse.status !== 201) {
    throw new Error(`Company registration failed: ${registerResponse.status} - ${JSON.stringify(registerResponse.body)}`);
  }

  // Login company
  const loginResponse = await supertest(app.server)
    .post('/api/auth/login')
    .send({
      email: companyData.email,
      password: companyData.password
    });

  if (loginResponse.status !== 200 || !loginResponse.headers['set-cookie']) {
    throw new Error(`Company login failed: ${loginResponse.status} - ${JSON.stringify(loginResponse.body)}`);
  }

  const cookie = loginResponse.headers['set-cookie'][0];
  const authToken = cookie.split(';')[0].replace('token=', '');

  // Get user and profile data
  const user = await prisma.user.findUnique({
    where: { email: companyData.email },
    include: { companyProfile: true }
  });

  if (!user || !user.companyProfile) {
    throw new Error('Company user or profile not found after registration');
  }

  return {
    user,
    profile: user.companyProfile,
    authToken,
    credentials: companyData
  };
}

/**
 * Create a student user with profile for testing
 */
export async function createTestStudent(app: FastifyInstance, overrides: Partial<{
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}> = {}) {
  const studentData = {
    email: faker.internet.email(),
    password: faker.internet.password(),
    role: 'STUDENT' as const,
    firstName: faker.person.firstName(),
    lastName: faker.person.lastName(),
    ...overrides
  };

  // Register student
  const registerResponse = await supertest(app.server)
    .post('/api/auth/register')
    .send(studentData);
  
  if (registerResponse.status !== 201) {
    throw new Error(`Student registration failed: ${registerResponse.status} - ${JSON.stringify(registerResponse.body)}`);
  }

  // Login student
  const loginResponse = await supertest(app.server)
    .post('/api/auth/login')
    .send({
      email: studentData.email,
      password: studentData.password
    });

  if (loginResponse.status !== 200 || !loginResponse.headers['set-cookie']) {
    throw new Error(`Student login failed: ${loginResponse.status} - ${JSON.stringify(loginResponse.body)}`);
  }

  const cookie = loginResponse.headers['set-cookie'][0];
  const authToken = cookie.split(';')[0].replace('token=', '');

  // Get user data
  const user = await prisma.user.findUnique({
    where: { email: studentData.email }
  });

  if (!user) {
    throw new Error('Student user not found after registration');
  }

  return {
    user,
    authToken,
    credentials: studentData
  };
}

/**
 * Create test skills for use in tests
 */
export async function createTestSkills(skillNames: string[] = ['React', 'Node.js', 'Python', 'Java']) {
  await prisma.skill.createMany({
    data: skillNames.map(name => ({ name })),
    skipDuplicates: true,
  });

  return await prisma.skill.findMany({
    where: { name: { in: skillNames } }
  });
}

/**
 * Create a complete student profile with skills
 */
export async function createStudentProfile(
  app: FastifyInstance,
  authToken: string,
  profileData: {
    firstName: string;
    lastName: string;
    school: string;
    degree: string;
    skills: string[];
    isOpenToOpportunities: boolean;
    cvUrl?: string;
    isCvPublic?: boolean;
  }
) {
  const response = await supertest(app.server)
    .post('/api/profile')
    .set('Cookie', `token=${authToken}`)
    .send(profileData);

  if (response.status !== 200) {
    throw new Error(`Profile creation failed: ${response.status} - ${JSON.stringify(response.body)}`);
  }

  return response.body;
}

/**
 * Wait for a short time to allow database operations to complete
 */
export async function waitForDb(ms: number = 100) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Process items in batches to avoid overwhelming the database
 */
export async function processBatch<T, R>(
  items: T[],
  batchSize: number,
  processor: (item: T, index: number) => Promise<R>,
  delayBetweenBatches: number = 50
): Promise<R[]> {
  const results: R[] = [];
  
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    const batchResults = await Promise.all(
      batch.map((item, batchIndex) => processor(item, i + batchIndex))
    );
    results.push(...batchResults);
    
    // Small delay between batches to prevent connection overload
    if (i + batchSize < items.length && delayBetweenBatches > 0) {
      await waitForDb(delayBetweenBatches);
    }
  }
  
  return results;
}

/**
 * Safely execute database operations with retry logic
 */
export async function safeDbOperation<T>(
  operation: () => Promise<T>,
  maxRetries: number = 5,
  delayMs: number = 200
): Promise<T | null> {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      
      // Only retry on connection-related errors
      if (errorMessage.includes('ECONNRESET') || 
          errorMessage.includes('ECONNREFUSED') ||
          errorMessage.includes('Connection terminated') ||
          errorMessage.includes('Connection closed') ||
          errorMessage.includes('Server has closed the connection')) {
        
        if (attempt < maxRetries - 1) {
          await waitForDb(delayMs * Math.pow(2, attempt)); // Exponential backoff
          
          // Try to reconnect if it's a connection error
          try {
            await prisma.$connect();
          } catch (reconnectError) {
            console.warn('Failed to reconnect to database:', reconnectError);
          }
          continue;
        }
      }
      
      // For non-connection errors or final attempt, log and return null
      if (attempt === maxRetries - 1) {
        console.warn(`Operation failed after ${maxRetries} attempts:`, errorMessage);
        return null;
      }
      throw error;
    }
  }
  return null;
}

/**
 * Force cleanup database connections
 */
export async function forceCleanupConnections() {
  try {
    await prisma.$disconnect();
    await waitForDb(100);
  } catch (error) {
    console.warn('Error during connection cleanup:', error);
  }
} 