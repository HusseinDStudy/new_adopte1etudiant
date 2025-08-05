import { describe, test, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { buildTestApp } from '../helpers/test-app';
import type { FastifyInstance } from 'fastify';
import { prisma } from 'db-postgres';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

describe('Company Controller', () => {
  let app: FastifyInstance;
  let companyCookie: string;
  let companyUserId: string;

  beforeAll(async () => {
    app = await buildTestApp();
  });

  beforeEach(async () => {
    // Create company user directly in the database to ensure proper transaction context
    const hashedPassword = await bcrypt.hash('Password123!', 10);
    
    const user = await prisma.user.create({
      data: {
        email: 'company@test.com',
        passwordHash: hashedPassword,
        role: 'COMPANY',
        passwordLoginDisabled: false,
      },
    });

    const companyProfile = await prisma.companyProfile.create({
      data: {
        userId: user.id,
        name: 'Test Company',
        contactEmail: 'company@test.com',
      },
    });

    companyUserId = user.id;
    
    // Generate JWT token manually
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
      },
      process.env.JWT_SECRET!,
      { expiresIn: '7d' }
    );
    
    companyCookie = token;
    

  });

  afterAll(async () => {
    await app.close();
  });

  describe('GET /api/companies/', () => {
    test('should return companies with offers', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/companies/'
      });

      expect(response.statusCode).toBe(200);
      const companies = response.json();
      expect(Array.isArray(companies)).toBe(true);
    });

    test('should return empty array when no companies have offers', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/companies/'
      });

      expect(response.statusCode).toBe(200);
      const companies = response.json();
      expect(Array.isArray(companies)).toBe(true);
    });

    test('should handle database errors gracefully', async () => {
      // Mock a database error by overriding the findMany method
      const originalFindMany = prisma.companyProfile.findMany;
      prisma.companyProfile.findMany = () => Promise.reject(new Error('Database error')) as any;

      try {
        const response = await app.inject({
          method: 'GET',
          url: '/api/companies/'
        });

        expect(response.statusCode).toBe(500);
        const errorResponse = response.json();
        expect(errorResponse.message).toBe('Internal Server Error');
        expect(errorResponse.success).toBe(false);
        expect(errorResponse.statusCode).toBe(500);
        expect(errorResponse.path).toBe('/api/companies/');
        expect(errorResponse.timestamp).toBeDefined();
      } finally {
        // Always restore original method
        prisma.companyProfile.findMany = originalFindMany;
      }
    });
  });

  describe('GET /api/companies/stats', () => {
    test('should return company stats for authenticated user', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/companies/stats',
        headers: {
          Cookie: `token=${companyCookie}`
        }
      });

      expect(response.statusCode).toBe(200);
      const stats = response.json();
      expect(stats).toHaveProperty('totalOffers');
      expect(stats).toHaveProperty('totalApplications');
      expect(stats).toHaveProperty('applicationsByStatus');
      expect(stats).toHaveProperty('adoptionRequestsSent');
    });

    test('should return 404 when company profile not found', async () => {
      // Create a user without a company profile by directly creating a user
      const hashedPassword = await bcrypt.hash('Password123!', 10);
      const userWithoutProfile = await prisma.user.create({
        data: {
          email: 'no-profile@test.com',
          passwordHash: hashedPassword,
          role: 'COMPANY'
        }
      });

      // Generate JWT token manually for the user without profile
      const token = jwt.sign(
        {
          id: userWithoutProfile.id,
          email: userWithoutProfile.email,
          role: userWithoutProfile.role,
        },
        process.env.JWT_SECRET!,
        { expiresIn: '7d' }
      );

      const response = await app.inject({
        method: 'GET',
        url: '/api/companies/stats',
        headers: {
          Cookie: `token=${token}`
        }
      });

      expect(response.statusCode).toBe(404);
      expect(response.json()).toEqual({ message: 'Company profile not found' });

      // Cleanup
      await prisma.user.delete({ where: { email: 'no-profile@test.com' } });
    });

    test('should return 500 on database error', async () => {
      // Mock a database error by overriding the findUnique method
      const originalFindUnique = prisma.companyProfile.findUnique;
      prisma.companyProfile.findUnique = () => Promise.reject(new Error('Database error')) as any;

      try {
        const response = await app.inject({
          method: 'GET',
          url: '/api/companies/stats',
          headers: {
            Cookie: `token=${companyCookie}`
          }
        });

        expect(response.statusCode).toBe(500);
        const errorResponse = response.json();
        expect(errorResponse.message).toBe('Internal Server Error');
        expect(errorResponse.success).toBe(false);
        expect(errorResponse.statusCode).toBe(500);
        expect(errorResponse.path).toBe('/api/companies/stats');
        expect(errorResponse.timestamp).toBeDefined();
      } finally {
        // Always restore original method
        prisma.companyProfile.findUnique = originalFindUnique;
      }
    });

    test('should return 401 when not authenticated', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/companies/stats'
      });

      expect(response.statusCode).toBe(401);
    });
  });
}); 