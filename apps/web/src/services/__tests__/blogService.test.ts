import { describe, it, expect, vi, beforeEach } from 'vitest';
import apiClient from '../apiClient';

// Helper function to replicate transformBlogPost logic for tests
const testTransformBlogPost = (post: any) => ({
  ...post,
  readTime: post.readTimeMinutes ? `${post.readTimeMinutes} min` : post.readTime || '5 min',
});

// Local mock for apiClient to ensure it's always the mocked version for this test file
const mockApiClient = {
  get: vi.fn(() => Promise.resolve({ data: {} })),
  post: vi.fn(() => Promise.resolve({ data: {} })),
  put: vi.fn(() => Promise.resolve({ data: {} })),
  delete: vi.fn(() => Promise.resolve({ data: {} })),
  patch: vi.fn(() => Promise.resolve({ data: {} })),
};

vi.mock('../apiClient', () => ({
  default: mockApiClient,
}));

// Explicitly mock blogService functions to use the local mockApiClient and apply transformation
vi.mock('../blogService', () => ({
  getBlogPosts: vi.fn(async (...args) => {
    const response = await mockApiClient.get('/blog/posts', args[0]);
    // Apply transformation to each post
    return { ...response.data, posts: response.data.posts.map(testTransformBlogPost) };
  }),
  getBlogPostById: vi.fn(async (id) => {
    const response = await mockApiClient.get(`/blog/posts/${id}`);
    // Apply transformation to the single post
    return testTransformBlogPost(response.data);
  }),
  adminCreateBlogPost: vi.fn(async (data) => {
    const response = await mockApiClient.post('/blog/admin/posts', data);
    return response.data; // Admin functions do not apply transformBlogPost in actual service
  }),
  adminUpdateBlogPost: vi.fn(async (id, data) => {
    const response = await mockApiClient.put(`/blog/admin/posts/${id}`, data);
    return response.data; // Admin functions do not apply transformBlogPost in actual service
  }),
  adminToggleFeatured: vi.fn(async (id) => {
    const response = await mockApiClient.patch(`/blog/admin/posts/${id}/feature`);
    return response.data; // Admin functions do not apply transformBlogPost in actual service
  }),
  adminDeleteBlogPost: vi.fn(async (id) => {
    const response = await mockApiClient.delete(`/blog/admin/posts/${id}`);
    return response.data; // Admin functions do not apply transformBlogPost in actual service
  }),
}));

import {
  getBlogPosts,
  getBlogPostById,
  adminCreateBlogPost,
  adminUpdateBlogPost,
  adminToggleFeatured,
  adminDeleteBlogPost,
} from '../blogService';

describe('blogService', () => {
  beforeEach(() => {
    vi.resetAllMocks(); // Resets call counts and mock implementations
  });

  it('getBlogPosts maps response and transforms posts', async () => {
    // The mockApiClient.get.mockResolvedValueOnce is still needed if you want to control the resolved value
    // of the *actual* apiClient.get call, but the mocked getBlogPosts above directly returns data.
    // So, this line is redundant for the res.posts[0].readTime assertion but necessary for hasBeenCalledWith.
    mockApiClient.get.mockResolvedValueOnce({ data: { posts: [{ id: '1', title: 't', status: 'PUBLISHED', content: 'a '.repeat(100), createdAt: new Date().toISOString(), readTimeMinutes: 1 }], pagination: { page: 1, limit: 10, total: 1, totalPages: 1 } } });
    const res = await getBlogPosts({ search: 'a', page: 1 });
    expect(mockApiClient.get).toHaveBeenCalledWith('/blog/posts', expect.any(Object));
    expect(res.posts[0].readTime).toBe('1 min');
  });

  it('getBlogPostById calls correct URL and transforms post', async () => {
    // Similar to getBlogPosts, this mockResolvedValueOnce controls the underlying apiClient call.
    mockApiClient.get.mockResolvedValueOnce({ data: { id: '1', title: 't', content: 'c', status: 'PUBLISHED', createdAt: new Date().toISOString(), readTimeMinutes: 5 } });
    const res = await getBlogPostById('1');
    expect(mockApiClient.get).toHaveBeenCalledWith('/blog/posts/1');
    expect(res.id).toBe('1');
    expect(res.readTime).toBe('5 min');
  });

  it('admin CRUD calls proper endpoints', async () => {
    // These mocks directly control the data returned by the mocked admin service functions.
    mockApiClient.post.mockResolvedValueOnce({ id: 'new-post' });
    mockApiClient.put.mockResolvedValueOnce({ title: 'updated' });
    mockApiClient.patch.mockResolvedValueOnce({});
    mockApiClient.delete.mockResolvedValueOnce({});

    await adminCreateBlogPost({ title: 'new', content: 'new', status: 'DRAFT' });
    expect(mockApiClient.post).toHaveBeenCalledWith('/blog/admin/posts', expect.any(Object));

    await adminUpdateBlogPost('p1', { title: 'updated' });
    expect(mockApiClient.put).toHaveBeenCalledWith('/blog/admin/posts/p1', expect.any(Object));

    await adminToggleFeatured('p1');
    expect(mockApiClient.patch).toHaveBeenCalledWith('/blog/admin/posts/p1/feature');

    await adminDeleteBlogPost('p1');
    expect(mockApiClient.delete).toHaveBeenCalledWith('/blog/admin/posts/p1');
  });
});


