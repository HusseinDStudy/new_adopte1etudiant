import { prisma } from 'db-postgres';
import { faker } from '@faker-js/faker';
import supertest from 'supertest';
import { FastifyInstance } from 'fastify';

/**
 * Comprehensive database cleanup that respects foreign key constraints
 */
export async function cleanupDatabase() {
  console.log('Starting database cleanup...');
  try {
    // Delete in correct order to respect foreign key constraints
    await safeDbOperation(() => prisma.message.deleteMany(), 10, 500);
    await safeDbOperation(() => prisma.conversation.deleteMany(), 10, 500);
    await safeDbOperation(() => prisma.application.deleteMany(), 10, 500);
    await safeDbOperation(() => prisma.adoptionRequest.deleteMany(), 10, 500);
    await safeDbOperation(() => prisma.offer.deleteMany(), 10, 500);
    await safeDbOperation(() => prisma.studentSkill.deleteMany(), 10, 500);
    await safeDbOperation(() => prisma.skill.deleteMany(), 10, 500);
    await safeDbOperation(() => prisma.studentProfile.deleteMany(), 10, 500);
    await safeDbOperation(() => prisma.companyProfile.deleteMany(), 10, 500);
    await safeDbOperation(() => prisma.account.deleteMany(), 10, 500);
    await safeDbOperation(() => prisma.user.deleteMany(), 10, 500);
    console.log('Database cleanup complete.');
  } catch (error) {
    console.error('Database cleanup failed:', error);
    // Don't throw error to prevent test suite failures
    // Just log and continue
  }
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
  console.log('Creating test company...');
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
  console.log('Company registered.');
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
  console.log('Company logged in.');
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
  console.log('Company profile retrieved.');
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
  school?: string;
  degree?: string;
  skills?: string[];
  isOpenToOpportunities?: boolean;
  cvUrl?: string;
  isCvPublic?: boolean;
}> = {}) {
  console.log('Creating test student...');
  const studentData = {
    email: overrides.email || faker.internet.email(),
    password: overrides.password || faker.internet.password(),
    role: 'STUDENT' as const,
    firstName: overrides.firstName || faker.person.firstName(),
    lastName: overrides.lastName || faker.person.lastName(),
  };

  // Register student
  const registerResponse = await supertest(app.server)
    .post('/api/auth/register')
    .send(studentData);
  
  if (registerResponse.status !== 201) {
    throw new Error(`Student registration failed: ${registerResponse.status} - ${JSON.stringify(registerResponse.body)}`);
  }
  console.log('Student registered.');
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
  console.log('Student logged in.');
  const cookie = loginResponse.headers['set-cookie'][0];
  const authToken = cookie.split(';')[0].replace('token=', '');

  // Get user data
  const user = await prisma.user.findUnique({
    where: { email: studentData.email }
  });

  if (!user) {
    throw new Error('Student user not found after registration');
  }
  console.log('Student user retrieved.');
  // Create student profile if profile data is provided in overrides
  let studentProfile = null;
  if (overrides.school !== undefined || overrides.degree !== undefined || overrides.skills !== undefined || overrides.isOpenToOpportunities !== undefined || overrides.cvUrl !== undefined || overrides.isCvPublic !== undefined) {
    console.log('Creating student profile with overrides...');
    const profileData = {
      firstName: studentData.firstName,
      lastName: studentData.lastName,
      school: overrides.school || faker.commerce.department(), // Default to a valid string if not provided
      degree: overrides.degree || faker.person.jobArea(), // Default to a valid string if not provided
      skills: overrides.skills || [],
      isOpenToOpportunities: overrides.isOpenToOpportunities !== undefined ? overrides.isOpenToOpportunities : false,
      cvUrl: overrides.cvUrl !== undefined ? overrides.cvUrl : faker.internet.url(), // Default to a valid URL or empty string
      isCvPublic: overrides.isCvPublic !== undefined ? overrides.isCvPublic : false,
    };
    const profileResponse = await supertest(app.server)
      .post('/api/profile')
      .set('Cookie', `token=${authToken}`)
      .send(profileData);

    if (profileResponse.status !== 200) {
      throw new Error(`Student profile creation failed: ${profileResponse.status} - ${JSON.stringify(profileResponse.body)}`);
    }
    studentProfile = profileResponse.body;
    console.log('Student profile created.');
  }

  return {
    user,
    profile: studentProfile,
    authToken,
    credentials: studentData
  };
}

/**
 * Create test skills for use in tests
 */
export async function createTestSkills(skillNames: string[] = ['React', 'Node.js', 'Python', 'Java']) {
  console.log('Creating test skills...');
  await safeDbOperation(async () => {
    await prisma.skill.createMany({
      data: skillNames.map(name => ({ name })),
      skipDuplicates: true,
    });
  }, 10, 500); // Increased retries and delay
  console.log('Test skills created.');

  return await safeDbOperation(async () => {
    return await prisma.skill.findMany({
      where: { name: { in: skillNames } }
    });
  }, 10, 500); // Increased retries and delay
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
          errorMessage.includes('Server has closed the connection') ||
          errorMessage.includes('Engine is not yet connected')) { // Added this line to retry on "Engine is not yet connected" error
        
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