import { describe, test, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { buildTestApp } from '../helpers/test-app';
import type { FastifyInstance } from 'fastify';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma as dbPostgresPrisma } from 'db-postgres';

const prisma = new PrismaClient();

describe('Student Controller', () => {
  let app: FastifyInstance;
  let studentCookie: string;
  let companyCookie: string;
  let studentUserId: string;

  beforeAll(async () => {
    app = await buildTestApp();
  });

  beforeEach(async () => {
    // Create student user directly in the database to ensure proper transaction context
    const hashedPassword = await bcrypt.hash('Password123!', 10);
    
    const studentUser = await prisma.user.create({
      data: {
        email: 'student@test.com',
        passwordHash: hashedPassword,
        role: 'STUDENT',
        passwordLoginDisabled: false,
      },
    });

    const studentProfile = await prisma.studentProfile.create({
      data: {
        userId: studentUser.id,
        firstName: 'Test',
        lastName: 'Student',
      },
    });

    studentUserId = studentUser.id;
    
    // Generate JWT token manually for student
    const studentToken = jwt.sign(
      {
        id: studentUser.id,
        email: studentUser.email,
        role: studentUser.role,
      },
      process.env.JWT_SECRET!,
      { expiresIn: '7d' }
    );
    
    studentCookie = studentToken;

    // Create company user for testing student listing (requires COMPANY role)
    const companyUser = await prisma.user.create({
      data: {
        email: 'company-student-test@test.com',
        passwordHash: hashedPassword,
        role: 'COMPANY',
        passwordLoginDisabled: false,
      },
    });

    const companyProfile = await prisma.companyProfile.create({
      data: {
        userId: companyUser.id,
        name: 'Test Company for Student Tests',
        contactEmail: 'company-student-test@test.com',
      },
    });
    
    // Generate JWT token manually for company
    const companyToken = jwt.sign(
      {
        id: companyUser.id,
        email: companyUser.email,
        role: companyUser.role,
      },
      process.env.JWT_SECRET!,
      { expiresIn: '7d' }
    );
    
    companyCookie = companyToken;
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    // Clean up any test data
    await prisma.studentSkill.deleteMany({ where: { studentProfileId: studentUserId } });
  });

  describe('GET /api/students/', () => {
    test('should return available students without filters', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/students/',
        headers: {
          Cookie: `token=${companyCookie}`
        }
      });

      expect(response.statusCode).toBe(200);
      const students = response.json();
      expect(Array.isArray(students)).toBe(true);
    });

    test('should return available students with search filter', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/students/?search=test',
        headers: {
          Cookie: `token=${companyCookie}`
        }
      });

      expect(response.statusCode).toBe(200);
      const students = response.json();
      expect(Array.isArray(students)).toBe(true);
    });

    test('should return available students with skills filter', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/students/?skills=javascript,react',
        headers: {
          Cookie: `token=${companyCookie}`
        }
      });

      expect(response.statusCode).toBe(200);
      const students = response.json();
      expect(Array.isArray(students)).toBe(true);
    });

    test('should return available students with both search and skills filters', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/students/?search=test&skills=javascript',
        headers: {
          Cookie: `token=${companyCookie}`
        }
      });

      expect(response.statusCode).toBe(200);
      const students = response.json();
      expect(Array.isArray(students)).toBe(true);
    });

    test('should handle database errors gracefully', async () => {
      // Mock dbPostgresPrisma.studentProfile.findMany to throw an error
      const originalFindMany = dbPostgresPrisma.studentProfile.findMany;
      dbPostgresPrisma.studentProfile.findMany = () => Promise.reject(new Error('Database error')) as any;

      const response = await app.inject({
        method: 'GET',
        url: '/api/students/',
        headers: {
          Cookie: `token=${companyCookie}`
        }
      });

      expect(response.statusCode).toBe(500);
      expect(response.json()).toEqual({ message: 'Internal Server Error' });

      // Restore original method
      dbPostgresPrisma.studentProfile.findMany = originalFindMany;
    });

    test('should handle empty search parameter', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/students/?search=',
        headers: {
          Cookie: `token=${companyCookie}`
        }
      });

      expect(response.statusCode).toBe(200);
      const students = response.json();
      expect(Array.isArray(students)).toBe(true);
    });

    test('should handle empty skills parameter', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/students/?skills=',
        headers: {
          Cookie: `token=${companyCookie}`
        }
      });

      expect(response.statusCode).toBe(200);
      const students = response.json();
      expect(Array.isArray(students)).toBe(true);
    });

    test('should handle special characters in search', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/students/?search=test@example.com',
        headers: {
          Cookie: `token=${companyCookie}`
        }
      });

      expect(response.statusCode).toBe(200);
      const students = response.json();
      expect(Array.isArray(students)).toBe(true);
    });

    test('should handle multiple skills with spaces', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/students/?skills=javascript, react, node.js',
        headers: {
          Cookie: `token=${companyCookie}`
        }
      });

      expect(response.statusCode).toBe(200);
      const students = response.json();
      expect(Array.isArray(students)).toBe(true);
    });

    test('should return 401 when not authenticated', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/students/'
      });

      expect(response.statusCode).toBe(401);
    });

    test('should return 403 when authenticated as student', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/students/',
        headers: {
          Cookie: `token=${studentCookie}`
        }
      });

      expect(response.statusCode).toBe(403);
    });
  });

  describe('GET /api/students/stats', () => {
    test('should return student stats for authenticated user', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/students/stats',
        headers: {
          Cookie: `token=${studentCookie}`
        }
      });

      expect(response.statusCode).toBe(200);
      const stats = response.json();
      expect(stats).toHaveProperty('totalApplications');
      expect(stats).toHaveProperty('applicationsByStatus');
      expect(stats).toHaveProperty('adoptionRequestsReceived');
    });

    test('should return 404 when student profile not found', async () => {
      // Create a user without a student profile by directly creating a user
      const hashedPassword = await bcrypt.hash('Password123!', 10);
      const userWithoutProfile = await prisma.user.create({
        data: {
          email: 'no-profile-student@test.com',
          passwordHash: hashedPassword,
          role: 'STUDENT'
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
        url: '/api/students/stats',
        headers: {
          Cookie: `token=${token}`
        }
      });

      expect(response.statusCode).toBe(404);
      expect(response.json()).toEqual({ message: 'Student profile not found' });

      // Cleanup
      await prisma.user.delete({ where: { email: 'no-profile-student@test.com' } });
    });

    test('should return 500 on database error', async () => {
      // Mock dbPostgresPrisma.studentProfile.findUnique to throw an error
      const originalFindUnique = dbPostgresPrisma.studentProfile.findUnique;
      dbPostgresPrisma.studentProfile.findUnique = () => Promise.reject(new Error('Database error')) as any;

      const response = await app.inject({
        method: 'GET',
        url: '/api/students/stats',
        headers: {
          Cookie: `token=${studentCookie}`
        }
      });

      expect(response.statusCode).toBe(500);
      expect(response.json()).toEqual({ message: 'Internal Server Error' });

      // Restore original method
      dbPostgresPrisma.studentProfile.findUnique = originalFindUnique;
    });

    test('should return 401 when not authenticated', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/students/stats'
      });

      expect(response.statusCode).toBe(401);
    });

    test('should return 403 when authenticated as company', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/students/stats',
        headers: {
          Cookie: `token=${companyCookie}`
        }
      });

      expect(response.statusCode).toBe(403);
    });
  });
}); 