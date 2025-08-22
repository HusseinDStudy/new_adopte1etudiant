import { describe, it, expect, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import * as blogService from '../../services/blogService';
import { useBlogPosts, useBlogPost, useRelatedPosts, useBlogCategories, useBlogPostMutations, useCategoryMutations, useSlugGenerator } from '../useBlog';

describe('useBlog hooks', () => {
  it('useBlogPosts fetches posts with filters', async () => {
    vi.spyOn(blogService, 'getBlogPosts').mockResolvedValueOnce({ posts: [{ id: '1' }], pagination: { page: 1, limit: 10, total: 1, totalPages: 1 } } as any);
    const { result } = renderHook(() => useBlogPosts({ search: 'a' }));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.posts.length).toBe(1);
  });

  it('useBlogPost fetches a post by slug', async () => {
    vi.spyOn(blogService, 'getBlogPost').mockResolvedValueOnce({ id: 'p1', title: 'Hello' } as any);
    const { result } = renderHook(() => useBlogPost('hello-world'));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.post?.id).toBe('p1');
  });

  it('useRelatedPosts fetches related posts', async () => {
    vi.spyOn(blogService, 'getRelatedPosts').mockResolvedValueOnce([{ id: 'p2' }] as any);
    const { result } = renderHook(() => useRelatedPosts('hello-world', 2));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.posts[0].id).toBe('p2');
  });

  it('useBlogCategories fetches categories', async () => {
    vi.spyOn(blogService, 'getBlogCategories').mockResolvedValueOnce([{ id: 'c1', name: 'General', slug: 'general' }] as any);
    const { result } = renderHook(() => useBlogCategories());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.categories[0].slug).toBe('general');
  });

  it('useBlogPostMutations create/update/delete/toggle', async () => {
    vi.spyOn(blogService, 'adminCreatePost').mockResolvedValueOnce({ id: 'p1' } as any);
    vi.spyOn(blogService, 'adminUpdatePost').mockResolvedValueOnce({ id: 'p1', title: 'New' } as any);
    vi.spyOn(blogService, 'adminDeletePost').mockResolvedValueOnce(void 0 as any);
    vi.spyOn(blogService, 'adminTogglePublished').mockResolvedValueOnce({ id: 'p1', status: 'PUBLISHED' } as any);
    vi.spyOn(blogService, 'adminToggleFeatured').mockResolvedValueOnce({ id: 'p1', featured: true } as any);

    const { result } = renderHook(() => useBlogPostMutations());
    await expect(result.current.createPost({ title: 't', content: 'c', categoryId: 'c', author: 'a' })).resolves.toEqual({ id: 'p1' });
    await expect(result.current.updatePost('p1', { title: 'New' })).resolves.toEqual({ id: 'p1', title: 'New' });
    await expect(result.current.togglePublished('p1')).resolves.toEqual({ id: 'p1', status: 'PUBLISHED' });
    await expect(result.current.toggleFeatured('p1')).resolves.toEqual({ id: 'p1', featured: true });
    await expect(result.current.deletePost('p1')).resolves.toBeUndefined();
  });

  it('useCategoryMutations create/update/delete', async () => {
    vi.spyOn(blogService, 'adminCreateCategory').mockResolvedValueOnce({ id: 'c1', name: 'General', slug: 'general' } as any);
    vi.spyOn(blogService, 'adminUpdateCategory').mockResolvedValueOnce({ id: 'c1', name: 'General', slug: 'general' } as any);
    vi.spyOn(blogService, 'adminDeleteCategory').mockResolvedValueOnce(void 0 as any);

    const { result } = renderHook(() => useCategoryMutations());
    await expect(result.current.createCategory({ name: 'General', slug: 'general' })).resolves.toEqual({ id: 'c1', name: 'General', slug: 'general' });
    await expect(result.current.updateCategory('c1', { name: 'Updated' })).resolves.toEqual({ id: 'c1', name: 'General', slug: 'general' });
    await expect(result.current.deleteCategory('c1')).resolves.toBeUndefined();
  });

  it('useSlugGenerator returns slug from service', async () => {
    vi.spyOn(blogService, 'generateSlug').mockResolvedValueOnce('hello-world');
    const { result } = renderHook(() => useSlugGenerator());
    await expect(result.current.generateSlug('Hello World')).resolves.toBe('hello-world');
  });
});


