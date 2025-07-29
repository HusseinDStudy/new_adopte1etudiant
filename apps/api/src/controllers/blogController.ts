import { FastifyRequest, FastifyReply } from 'fastify';
import { BlogService, BlogFilters, AdminBlogFilters, CreateBlogPostInput, UpdateBlogPostInput, CreateBlogCategoryInput } from '../services/BlogService.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const blogService = new BlogService();

// Public endpoints for blog display
export const getPublishedPosts = asyncHandler(async (
  request: FastifyRequest<{ 
    Querystring: { 
      search?: string; 
      category?: string; 
      featured?: boolean;
      page?: string;
      limit?: string;
    } 
  }>,
  reply: FastifyReply
) => {
  const { search, category, featured, page, limit } = request.query;
  
  const filters: BlogFilters = {
    search,
    category,
    featured: featured, // Fastify already converts boolean params
    page: page ? parseInt(page) : 1,
    limit: limit ? parseInt(limit) : 10,
  };

  const result = await blogService.getPublishedPosts(filters);
  return reply.send(result);
});

export const getPostBySlug = asyncHandler(async (
  request: FastifyRequest<{ Params: { slug: string } }>,
  reply: FastifyReply
) => {
  const { slug } = request.params;
  const post = await blogService.getPostBySlug(slug);
  return reply.send(post);
});

export const getRelatedPosts = asyncHandler(async (
  request: FastifyRequest<{ 
    Params: { slug: string };
    Querystring: { limit?: string };
  }>,
  reply: FastifyReply
) => {
  const { slug } = request.params;
  const { limit } = request.query;
  
  // First get the post to find its category
  const post = await blogService.getPostBySlug(slug);
  const relatedPosts = await blogService.getRelatedPosts(
    post.id, 
    post.categoryId || '', 
    limit ? parseInt(limit) : 3
  );
  
  return reply.send(relatedPosts);
});

export const getCategories = asyncHandler(async (
  request: FastifyRequest,
  reply: FastifyReply
) => {
  const categories = await blogService.getCategories();
  return reply.send(categories);
});

// Admin endpoints for blog management
export const adminGetAllPosts = asyncHandler(async (
  request: FastifyRequest<{ 
    Querystring: { 
      search?: string; 
      category?: string; 
      status?: 'PUBLISHED' | 'DRAFT' | 'SCHEDULED' | 'ARCHIVED';
      featured?: string;
      page?: string;
      limit?: string;
    } 
  }>,
  reply: FastifyReply
) => {
  const { search, category, status, featured, page, limit } = request.query;
  
  const filters: AdminBlogFilters = {
    search,
    category,
    status: status as 'PUBLISHED' | 'DRAFT' | 'SCHEDULED' | 'ARCHIVED' | undefined,
    featured: featured !== undefined ? Boolean(featured) : undefined,
    page: page ? parseInt(page) : 1,
    limit: limit ? parseInt(limit) : 10,
  };

  const result = await blogService.getAllPosts(filters);
  return reply.send(result);
});

export const adminGetPostById = asyncHandler(async (
  request: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply
) => {
  const { id } = request.params;
  const post = await blogService.getPostById(id);
  return reply.send(post);
});

export const adminCreatePost = asyncHandler(async (
  request: FastifyRequest<{ Body: any }>,
  reply: FastifyReply
) => {
  const requestData = request.body;
  
  // Transform frontend data to backend format
  const postData: CreateBlogPostInput = {
    title: requestData.title,
    slug: requestData.slug,
    excerpt: requestData.excerpt,
    content: requestData.content,
    image: requestData.image,
    categoryId: requestData.categoryId || requestData.category, // Accept both
    author: requestData.author,
    readTimeMinutes: requestData.readTimeMinutes || (
      requestData.readTime ? parseInt(requestData.readTime.replace(/\D/g, '')) || 5 : 5
    ),
    status: requestData.status || (requestData.published ? 'PUBLISHED' : 'DRAFT'),
    featured: requestData.featured,
    metaTitle: requestData.metaTitle,
    metaDescription: requestData.metaDescription,
  };
  
  // Remove undefined values
  Object.keys(postData).forEach(key => {
    if (postData[key as keyof CreateBlogPostInput] === undefined) {
      delete postData[key as keyof CreateBlogPostInput];
    }
  });
  
  // Generate slug if not provided
  if (!postData.slug) {
    postData.slug = await blogService.generateSlug(postData.title);
  }
  
  const post = await blogService.createPost(postData);
  return reply.code(201).send(post);
});

export const adminUpdatePost = asyncHandler(async (
  request: FastifyRequest<{ 
    Params: { id: string };
    Body: any;
  }>,
  reply: FastifyReply
) => {
  const { id } = request.params;
  const requestData = request.body;
  
  // Transform frontend data to backend format
  const updateData: any = {
    title: requestData.title,
    slug: requestData.slug,
    excerpt: requestData.excerpt,
    content: requestData.content,
    image: requestData.image,
    categoryId: requestData.categoryId || requestData.category,
    author: requestData.author,
    readTimeMinutes: requestData.readTimeMinutes || (
      requestData.readTime ? parseInt(requestData.readTime.replace(/\D/g, '')) || 5 : 5
    ),
    status: requestData.status || (requestData.published ? 'PUBLISHED' : 'DRAFT'),
    featured: requestData.featured,
    metaTitle: requestData.metaTitle,
    metaDescription: requestData.metaDescription,
  };
  
  // Remove undefined values
  Object.keys(updateData).forEach(key => {
    if (updateData[key] === undefined) {
      delete updateData[key];
    }
  });
  
  const post = await blogService.updatePost(id, updateData);
  return reply.send(post);
});

export const adminDeletePost = asyncHandler(async (
  request: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply
) => {
  const { id } = request.params;
  await blogService.deletePost(id);
  return reply.code(204).send();
});

export const adminTogglePublished = asyncHandler(async (
  request: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply
) => {
  const { id } = request.params;
  const post = await blogService.togglePublished(id);
  return reply.send(post);
});

export const adminToggleFeatured = asyncHandler(async (
  request: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply
) => {
  const { id } = request.params;
  const post = await blogService.toggleFeatured(id);
  return reply.send(post);
});

// Category management endpoints
export const adminCreateCategory = asyncHandler(async (
  request: FastifyRequest<{ Body: CreateBlogCategoryInput }>,
  reply: FastifyReply
) => {
  const categoryData = request.body;
  const category = await blogService.createCategory(categoryData);
  return reply.code(201).send(category);
});

export const adminUpdateCategory = asyncHandler(async (
  request: FastifyRequest<{ 
    Params: { id: string };
    Body: Partial<CreateBlogCategoryInput>;
  }>,
  reply: FastifyReply
) => {
  const { id } = request.params;
  const updateData = request.body;
  
  const category = await blogService.updateCategory(id, updateData);
  return reply.send(category);
});

export const adminDeleteCategory = asyncHandler(async (
  request: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply
) => {
  const { id } = request.params;
  await blogService.deleteCategory(id);
  return reply.code(204).send();
});

// Utility endpoints
export const generateSlug = asyncHandler(async (
  request: FastifyRequest<{ Body: { title: string } }>,
  reply: FastifyReply
) => {
  const { title } = request.body;
  const slug = await blogService.generateSlug(title);
  return reply.send({ slug });
});
