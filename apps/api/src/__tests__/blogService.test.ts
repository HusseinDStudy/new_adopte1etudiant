import { describe, test, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { BlogService } from '../services/BlogService.js';
import { prisma } from 'db-postgres';

describe('BlogService', () => {
  let blogService: BlogService;
  let testCategoryId: string;
  let testPostId: string;

  beforeAll(async () => {
    blogService = new BlogService();
  });

  beforeEach(async () => {
    // Clean up before each test
    await prisma.blogPost.deleteMany();
    await prisma.blogCategory.deleteMany();

    // Create a test category
    const category = await prisma.blogCategory.create({
      data: {
        name: 'Test Category',
        slug: 'test-category',
        description: 'Test category for blog posts'
      }
    });
    testCategoryId = category.id;

    // Create a test post
    const post = await prisma.blogPost.create({
      data: {
        title: 'Test Post',
        slug: 'test-post',
        excerpt: 'Test excerpt',
        content: 'Test content',
        categoryId: testCategoryId,
        author: 'Test Author',
        readTimeMinutes: 5,
        status: 'PUBLISHED',
        featured: false
      }
    });
    testPostId = post.id;
  });

  afterAll(async () => {
    await prisma.blogPost.deleteMany();
    await prisma.blogCategory.deleteMany();
  });

  describe('getPublishedPosts', () => {
    test('should return published posts with default filters', async () => {
      const result = await blogService.getPublishedPosts();
      
      expect(result.posts).toHaveLength(1);
      expect(result.posts[0].title).toBe('Test Post');
      expect(result.pagination.total).toBe(1);
    });

    test('should filter by search term', async () => {
      const result = await blogService.getPublishedPosts({ search: 'Test' });
      
      expect(result.posts).toHaveLength(1);
      expect(result.posts[0].title).toBe('Test Post');
    });

    test('should filter by category', async () => {
      const result = await blogService.getPublishedPosts({ category: 'Test Category' });
      
      expect(result.posts).toHaveLength(1);
      expect(result.posts[0].title).toBe('Test Post');
    });

    test('should filter by featured status', async () => {
      const result = await blogService.getPublishedPosts({ featured: false });
      
      expect(result.posts).toHaveLength(1);
      expect(result.posts[0].title).toBe('Test Post');
    });

    test('should handle pagination', async () => {
      const result = await blogService.getPublishedPosts({ page: 1, limit: 5 });
      
      expect(result.posts).toHaveLength(1);
      expect(result.pagination.total).toBe(1);
    });
  });

  describe('getPostBySlug', () => {
    test('should return post by slug', async () => {
      const post = await blogService.getPostBySlug('test-post');
      
      expect(post.title).toBe('Test Post');
      expect(post.slug).toBe('test-post');
    });

    test('should throw NotFoundError for non-existent slug', async () => {
      await expect(blogService.getPostBySlug('non-existent')).rejects.toThrow('Blog post not found');
    });
  });

  describe('getRelatedPosts', () => {
    test('should return related posts', async () => {
      // Create another post in the same category
      await prisma.blogPost.create({
        data: {
          title: 'Related Post',
          slug: 'related-post',
          excerpt: 'Related excerpt',
          content: 'Related content',
          categoryId: testCategoryId,
          author: 'Test Author',
          readTimeMinutes: 3,
          status: 'PUBLISHED',
          featured: false
        }
      });

      const relatedPosts = await blogService.getRelatedPosts(testPostId, testCategoryId);
      
      expect(relatedPosts).toHaveLength(1);
      expect(relatedPosts[0].title).toBe('Related Post');
    });
  });

  describe('getAllPosts', () => {
    test('should return all posts for admin', async () => {
      const result = await blogService.getAllPosts();
      
      expect(result.posts).toHaveLength(1);
      expect(result.posts[0].title).toBe('Test Post');
      expect(result.pagination.total).toBe(1);
    });

    test('should filter by status', async () => {
      const result = await blogService.getAllPosts({ status: 'PUBLISHED' });
      
      expect(result.posts).toHaveLength(1);
      expect(result.posts[0].title).toBe('Test Post');
    });
  });

  describe('getPostById', () => {
    test('should return post by ID', async () => {
      const post = await blogService.getPostById(testPostId);
      
      expect(post.title).toBe('Test Post');
      expect(post.id).toBe(testPostId);
    });

    test('should throw NotFoundError for non-existent ID', async () => {
      await expect(blogService.getPostById('non-existent-id')).rejects.toThrow('Blog post not found');
    });
  });

  describe('createPost', () => {
    test('should create a new post', async () => {
      const postData = {
        title: 'New Post',
        slug: 'new-post',
        excerpt: 'New excerpt',
        content: 'New content',
        categoryId: testCategoryId,
        author: 'New Author',
        readTimeMinutes: 7
      };

      const post = await blogService.createPost(postData);
      
      expect(post.title).toBe('New Post');
      expect(post.slug).toBe('new-post');
      expect(post.status).toBe('DRAFT'); // Default status
    });
  });

  describe('updatePost', () => {
    test('should update an existing post', async () => {
      const updateData = {
        title: 'Updated Post',
        content: 'Updated content'
      };

      const post = await blogService.updatePost(testPostId, updateData);
      
      expect(post.title).toBe('Updated Post');
      expect(post.content).toBe('Updated content');
    });

    test('should throw NotFoundError for non-existent post', async () => {
      await expect(blogService.updatePost('non-existent-id', { title: 'Updated' })).rejects.toThrow('Blog post not found');
    });
  });

  describe('deletePost', () => {
    test('should delete an existing post', async () => {
      await blogService.deletePost(testPostId);
      
      // Verify post is deleted
      await expect(blogService.getPostById(testPostId)).rejects.toThrow('Blog post not found');
    });

    test('should throw NotFoundError for non-existent post', async () => {
      await expect(blogService.deletePost('non-existent-id')).rejects.toThrow('Blog post not found');
    });
  });

  describe('togglePublished', () => {
    test('should toggle published status', async () => {
      // Start with published post
      const post = await blogService.getPostById(testPostId);
      expect(post.status).toBe('PUBLISHED');

      // Toggle to draft
      const updatedPost = await blogService.togglePublished(testPostId);
      expect(updatedPost.status).toBe('DRAFT');

      // Toggle back to published
      const republishedPost = await blogService.togglePublished(testPostId);
      expect(republishedPost.status).toBe('PUBLISHED');
    });

    test('should throw NotFoundError for non-existent post', async () => {
      await expect(blogService.togglePublished('non-existent-id')).rejects.toThrow('Blog post not found');
    });
  });

  describe('toggleFeatured', () => {
    test('should toggle featured status', async () => {
      // Start with non-featured post
      const post = await blogService.getPostById(testPostId);
      expect(post.featured).toBe(false);

      // Toggle to featured
      const updatedPost = await blogService.toggleFeatured(testPostId);
      expect(updatedPost.featured).toBe(true);

      // Toggle back to non-featured
      const unfeaturedPost = await blogService.toggleFeatured(testPostId);
      expect(unfeaturedPost.featured).toBe(false);
    });

    test('should throw NotFoundError for non-existent post', async () => {
      await expect(blogService.toggleFeatured('non-existent-id')).rejects.toThrow('Blog post not found');
    });
  });

  describe('getCategories', () => {
    test('should return all categories', async () => {
      const categories = await blogService.getCategories();
      
      expect(categories).toHaveLength(1);
      expect(categories[0].name).toBe('Test Category');
    });
  });

  describe('getCategoriesWithPostCount', () => {
    test('should return categories with post counts', async () => {
      const categories = await blogService.getCategoriesWithPostCount();
      
      expect(categories).toHaveLength(1);
      expect(categories[0].name).toBe('Test Category');
      expect(categories[0]._count.posts).toBe(1);
    });
  });

  describe('createCategory', () => {
    test('should create a new category', async () => {
      const categoryData = {
        name: 'New Category',
        slug: 'new-category',
        description: 'New category description'
      };

      const category = await blogService.createCategory(categoryData);
      
      expect(category.name).toBe('New Category');
      expect(category.slug).toBe('new-category');
    });
  });

  describe('updateCategory', () => {
    test('should update an existing category', async () => {
      const updateData = {
        name: 'Updated Category',
        description: 'Updated description'
      };

      const category = await blogService.updateCategory(testCategoryId, updateData);
      
      expect(category.name).toBe('Updated Category');
      expect(category.description).toBe('Updated description');
    });

    test('should throw NotFoundError for non-existent category', async () => {
      await expect(blogService.updateCategory('non-existent-id', { name: 'Updated' })).rejects.toThrow('Category not found');
    });
  });

  describe('deleteCategory', () => {
    test('should delete an existing category', async () => {
      await blogService.deleteCategory(testCategoryId);
      
      // Verify category is deleted
      const categories = await blogService.getCategories();
      expect(categories).toHaveLength(0);
    });

    test('should throw NotFoundError for non-existent category', async () => {
      await expect(blogService.deleteCategory('non-existent-id')).rejects.toThrow('Category not found');
    });
  });

  describe('generateSlug', () => {
    test('should generate a slug from title', async () => {
      const slug = await blogService.generateSlug('Test Title With Spaces');
      
      expect(slug).toBe('test-title-with-spaces');
    });

    test('should handle special characters', async () => {
      const slug = await blogService.generateSlug('Test Title with Special Chars!@#$%');
      
      expect(slug).toBe('test-title-with-special-chars');
    });

    test('should append number if slug exists', async () => {
      // Create a post with the slug that will be generated
      await prisma.blogPost.create({
        data: {
          title: 'Test Title',
          slug: 'test-title',
          excerpt: 'Test excerpt',
          content: 'Test content',
          categoryId: testCategoryId,
          author: 'Test Author',
          readTimeMinutes: 5,
          status: 'PUBLISHED',
          featured: false
        }
      });

      const slug = await blogService.generateSlug('Test Title');
      
      expect(slug).toBe('test-title-1');
    });
  });
}); 