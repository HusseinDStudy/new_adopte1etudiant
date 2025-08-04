// Quick test for featured functionality
import { describe, test, expect, beforeAll, afterAll } from 'vitest';
import { buildTestApp } from '../helpers/test-app';
import type { FastifyInstance } from 'fastify';
import { PrismaClient, Role } from '@prisma/client';

const prisma = new PrismaClient();

describe('Featured Blog Post Functionality', () => {
  let app: FastifyInstance;
  let adminCookie: string;
  let testPostId: string;

  beforeAll(async () => {
    app = await buildTestApp();
    
    // Create regular user first
    const adminResponse = await app.inject({
      method: 'POST',
      url: '/api/auth/register',
      payload: {
        email: 'admin@test.com',
        password: 'Password123!',
        role: 'COMPANY', // Use COMPANY role for registration
        name: 'Admin Company',
        contactEmail: 'admin@test.com'
      }
    });

    if (adminResponse.statusCode !== 201) {
      console.error('Admin registration failed:', adminResponse.body);
      throw new Error(`Admin registration failed: ${adminResponse.statusCode}`);
    }

    // Manually update user role to ADMIN in database
    await prisma.user.update({
      where: { email: 'admin@test.com' },
      data: { role: 'ADMIN' }
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

    // Create a blog category first
    const createCategoryResponse = await app.inject({
      method: 'POST',
      url: '/api/blog/admin/categories',
      headers: {
        Cookie: `token=${adminCookie}`
      },
      payload: {
        name: `Test Category ${Date.now()}`,
        slug: `test-category-${Date.now()}`,
        description: 'Test category for blog posts'
      }
    });

    if (createCategoryResponse.statusCode !== 201) {
      console.error('Category creation failed:', createCategoryResponse.body);
      throw new Error(`Category creation failed: ${createCategoryResponse.statusCode}`);
    }

    const categoryId = createCategoryResponse.json().id;
    console.log('Created category with ID:', categoryId);

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
        categoryId: categoryId,
        author: 'Test Author',
        readTime: '5 min',
        published: true
      }
    });
    
    if (createPostResponse.statusCode !== 201) {
      console.error('Blog post creation failed:', createPostResponse.body);
      throw new Error(`Blog post creation failed: ${createPostResponse.statusCode}`);
    }
    
    testPostId = createPostResponse.json().id;
    console.log('Created blog post with ID:', testPostId);
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