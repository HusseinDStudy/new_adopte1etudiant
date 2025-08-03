// Quick test for featured functionality
import { describe, test, expect, beforeAll, afterAll } from 'vitest';
import { getTestApp } from '../helpers/test-app';
import type { FastifyInstance } from 'fastify';
import { PrismaClient, Role } from '@prisma/client';

const prisma = new PrismaClient();

describe('Featured Blog Post Functionality', () => {
  let app: FastifyInstance;
  let adminCookie: string;
  let testPostId: string;

  beforeAll(async () => {
    app = await getTestApp();
    
    // Create admin user and login
    const adminResponse = await app.inject({
      method: 'POST',
      url: '/api/auth/register',
      payload: {
        email: 'admin@test.com',
        password: 'Password123!',
        role: Role.ADMIN,
        firstName: 'Admin',
        lastName: 'User'
      }
    });

    const loginResponse = await app.inject({
      method: 'POST',
      url: '/api/auth/login',
      payload: {
        email: 'admin@test.com',
        password: 'Password123!'
      }
    });
    
    adminCookie = loginResponse.cookies.find(c => c.name === 'token')?.value || '';

    // Create a test blog post
    const createPostResponse = await app.inject({
      method: 'POST',
      url: '/api/blog/admin/posts',
      headers: {
        Cookie: `token=${adminCookie}`
      },
      payload: {
        title: 'Test Featured Post',
        slug: 'test-featured-post',
        excerpt: 'Test excerpt',
        content: 'Test content',
        category: 'test',
        author: 'Test Author',
        readTime: '5 min',
        published: true
      }
    });
    
    testPostId = createPostResponse.json().id;
  });

  afterAll(async () => {
    // Cleanup
    if (testPostId) {
      await prisma.blogPost.delete({ where: { id: testPostId } });
    }
    await prisma.user.deleteMany({ where: { email: 'admin@test.com' } });
    await app.close();
  });

  test('should toggle featured status from false to true', async () => {
    const response = await app.inject({
      method: 'PATCH',
      url: `/api/blog/admin/posts/${testPostId}/feature`,
      headers: {
        Cookie: `token=${adminCookie}`
      }
    });

    expect(response.statusCode).toBe(200);
    expect(response.json().featured).toBe(true);
  });

  test('should toggle featured status from true to false', async () => {
    const response = await app.inject({
      method: 'PATCH',
      url: `/api/blog/admin/posts/${testPostId}/feature`,
      headers: {
        Cookie: `token=${adminCookie}`
      }
    });

    expect(response.statusCode).toBe(200);
    expect(response.json().featured).toBe(false);
  });
});