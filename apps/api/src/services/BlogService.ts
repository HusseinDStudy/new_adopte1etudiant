import { prisma } from 'db-postgres';
import { Prisma } from '@prisma/client';
import { NotFoundError } from '../errors/AppError.js';

export interface BlogFilters {
  search?: string;
  category?: string;
  featured?: boolean;
  page?: number;
  limit?: number;
}

export interface AdminBlogFilters extends BlogFilters {
  status?: 'PUBLISHED' | 'DRAFT' | 'SCHEDULED' | 'ARCHIVED';
}

export interface CreateBlogPostInput {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  image?: string;
  categoryId: string;
  author: string;
  readTimeMinutes: number;
  status?: 'DRAFT' | 'PUBLISHED' | 'SCHEDULED' | 'ARCHIVED';
  featured?: boolean;
  metaTitle?: string;
  metaDescription?: string;
}

export interface UpdateBlogPostInput {
  title?: string;
  slug?: string;
  excerpt?: string;
  content?: string;
  image?: string;
  categoryId?: string;
  author?: string;
  readTimeMinutes?: number;
  status?: 'DRAFT' | 'PUBLISHED' | 'SCHEDULED' | 'ARCHIVED';
  featured?: boolean;
  metaTitle?: string;
  metaDescription?: string;
}

export interface CreateBlogCategoryInput {
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  color?: string;
}

export class BlogService {
  // Public methods for frontend blog display
  async getPublishedPosts(filters: BlogFilters = {}) {
    const { search, category, featured, page = 1, limit = 10 } = filters;
    const skip = (page - 1) * limit;

    const whereClause: Prisma.BlogPostWhereInput = {
      status: 'PUBLISHED',
    };

    // Build conditions - temporarily disable NON_CLASSÉS filter to avoid errors
    if (search) {
      whereClause.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { excerpt: { contains: search, mode: 'insensitive' } },
        { content: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (category && category !== 'NON_CLASSÉS') {
      whereClause.category = {
        name: {
          equals: category,
          mode: 'insensitive'
        }
      };
    }

    if (featured !== undefined) {
      whereClause.featured = featured;
    }
    
    const [posts, total] = await Promise.all([
      prisma.blogPost.findMany({
        where: whereClause,
        include: {
          category: true,
        },
        orderBy: [
          { featured: 'desc' },
          { publishedAt: 'desc' },
          { createdAt: 'desc' }
        ],
        skip,
        take: limit,
      }),
      prisma.blogPost.count({ where: whereClause }),
    ]);

    return {
      posts: posts.map(post => ({
        ...post,
        category: post.category?.name || null,
        readTime: post.readTimeMinutes ? `${post.readTimeMinutes} min` : '5 min', // Add computed readTime for compatibility

        status: post.status, // Include the actual status field
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getPostBySlug(slug: string) {
    const post = await prisma.blogPost.findUnique({
      where: { 
        slug,
        status: 'PUBLISHED' 
      },
      include: {
        category: true,
      },
    });

    if (!post) {
      throw new NotFoundError('Blog post not found');
    }

    return {
      ...post,
      category: post.category?.name || null,
      readTime: post.readTimeMinutes ? `${post.readTimeMinutes} min` : '5 min',
    };
  }

  async getRelatedPosts(postId: string, categoryId: string, limit: number = 3) {
    const posts = await prisma.blogPost.findMany({
      where: {
        status: 'PUBLISHED',
        categoryId: categoryId,
        id: {
          not: postId
        }
      },
      include: {
        category: true,
      },
      orderBy: { publishedAt: 'desc' },
      take: limit,
    });

    return posts.map(post => ({
      ...post,
      category: post.category?.name || null,
      readTime: post.readTimeMinutes ? `${post.readTimeMinutes} min` : '5 min',
    }));
  }

  // Admin methods for blog management
  async getAllPosts(filters: AdminBlogFilters = {}) {
    const { search, category, status, featured, page = 1, limit = 10 } = filters;
    const skip = (page - 1) * limit;

    const whereClause: Prisma.BlogPostWhereInput = {};

    // Build conditions - temporarily disable NON_CLASSÉS filter to avoid errors
    if (search) {
      whereClause.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { excerpt: { contains: search, mode: 'insensitive' } },
        { author: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (category && category !== 'NON_CLASSÉS') {
      whereClause.category = {
        name: {
          equals: category,
          mode: 'insensitive'
        }
      };
    }

    // Handle status filtering
    if (status) {
      whereClause.status = status;
    }

    if (featured !== undefined) {
      whereClause.featured = featured;
    }

    const [posts, total] = await Promise.all([
      prisma.blogPost.findMany({
        where: whereClause,
        include: {
          category: true,
        },
        orderBy: [
          { featured: 'desc' }, // Featured posts first
          { createdAt: 'desc' }  // Then by creation date
        ],
        skip,
        take: limit,
      }),
      prisma.blogPost.count({ where: whereClause }),
    ]);

    return {
      posts: posts.map(post => ({
        ...post,
        category: post.category?.name || null,
        readTime: post.readTimeMinutes ? `${post.readTimeMinutes} min` : '5 min',
        status: post.status,
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getPostById(id: string) {
    const post = await prisma.blogPost.findUnique({
      where: { id },
      include: {
        category: true,
      },
    });

    if (!post) {
      throw new NotFoundError('Blog post not found');
    }

    return {
      ...post,
      category: post.category?.name || null,
      readTime: post.readTimeMinutes ? `${post.readTimeMinutes} min` : '5 min',
      published: post.status === 'PUBLISHED',
      status: post.status,
    };
  }

  async createPost(data: CreateBlogPostInput) {
    // Check if slug already exists
    const existingPost = await prisma.blogPost.findUnique({
      where: { slug: data.slug },
    });

    if (existingPost) {
      throw new Error('A post with this slug already exists');
    }

    // Remove frontend-only fields that don't exist in database
    const { readTime, ...dbData } = data as any;
    
    const post = await prisma.blogPost.create({
      data: {
        ...dbData,
        status: data.status || 'DRAFT',
        publishedAt: data.status === 'PUBLISHED' ? new Date() : null,
      },
      include: {
        category: true,
      },
    });

    return {
      ...post,
      category: post.category?.name || null,
      readTime: post.readTimeMinutes ? `${post.readTimeMinutes} min` : '5 min',
      status: post.status,
    };
  }

  async updatePost(id: string, data: UpdateBlogPostInput) {
    // Check if post exists
    const existingPost = await this.getPostById(id);

    // Check if slug is being changed and if it conflicts
    if (data.slug && data.slug !== existingPost.slug) {
      const slugConflict = await prisma.blogPost.findUnique({
        where: { slug: data.slug },
      });

      if (slugConflict) {
        throw new Error('A post with this slug already exists');
      }
    }

    // Remove frontend-only fields that don't exist in database
    const { readTime, ...dbData } = data as any;
    
    // Handle status change
    const updateData: any = { ...dbData };
    if (data.status !== undefined) {
      updateData.status = data.status;
      if (data.status === 'PUBLISHED' && existingPost.status !== 'PUBLISHED') {
        // Publishing for the first time
        updateData.publishedAt = new Date();
      } else if (data.status !== 'PUBLISHED' && existingPost.status === 'PUBLISHED') {
        // Unpublishing
        updateData.publishedAt = null;
      }
    }

    const post = await prisma.blogPost.update({
      where: { id },
      data: updateData,
      include: {
        category: true,
      },
    });

    return {
      ...post,
      category: post.category?.name || null,
      readTime: post.readTimeMinutes ? `${post.readTimeMinutes} min` : '5 min',
      status: post.status,
    };
  }

  async deletePost(id: string) {
    // Check if post exists
    await this.getPostById(id);

    await prisma.blogPost.delete({
      where: { id },
    });
  }

  async togglePublished(id: string) {
    const post = await this.getPostById(id);
    
    const isCurrentlyPublished = post.status === 'PUBLISHED';
    const newStatus = isCurrentlyPublished ? 'DRAFT' : 'PUBLISHED';
    
    const updatedPost = await prisma.blogPost.update({
      where: { id },
      data: {
        status: newStatus,
        publishedAt: newStatus === 'PUBLISHED' ? new Date() : null,
      },
      include: {
        category: true,
      },
    });

    return {
      ...updatedPost,
      category: updatedPost.category?.name || null,
      readTime: updatedPost.readTimeMinutes ? `${updatedPost.readTimeMinutes} min` : '5 min',
      status: updatedPost.status,
    };
  }

  async toggleFeatured(id: string) {
    const post = await this.getPostById(id);
    
    const updatedPost = await prisma.blogPost.update({
      where: { id },
      data: {
        featured: !post.featured,
      },
      include: {
        category: true,
      },
    });

    return {
      ...updatedPost,
      category: updatedPost.category?.name || null,
      readTime: updatedPost.readTimeMinutes ? `${updatedPost.readTimeMinutes} min` : '5 min',
      status: updatedPost.status,
    };
  }

  // Category management methods
  async getCategories() {
    const categories = await prisma.blogCategory.findMany({
      orderBy: { name: 'asc' },
    });

    return categories;
  }

  async getCategoriesWithPostCount() {
    const categories = await prisma.blogCategory.findMany({
      include: {
        _count: {
          select: {
            posts: {
              where: {
                status: 'PUBLISHED'
              }
            }
          }
        }
      },
      orderBy: { name: 'asc' },
    });

    return categories;
  }

  async createCategory(data: CreateBlogCategoryInput) {
    // Check if name or slug already exists
    const existingCategory = await prisma.blogCategory.findFirst({
      where: {
        OR: [
          { name: data.name },
          { slug: data.slug },
        ],
      },
    });

    if (existingCategory) {
      throw new Error('A category with this name or slug already exists');
    }

    const category = await prisma.blogCategory.create({
      data,
    });

    return category;
  }

  async updateCategory(id: string, data: Partial<CreateBlogCategoryInput>) {
    const category = await prisma.blogCategory.findUnique({
      where: { id },
    });

    if (!category) {
      throw new NotFoundError('Category not found');
    }

    // Check for conflicts if name or slug is being changed
    if (data.name || data.slug) {
      const conflictWhere: any = { id: { not: id } };
      const orConditions: any[] = [];

      if (data.name && data.name !== category.name) {
        orConditions.push({ name: data.name });
      }
      if (data.slug && data.slug !== category.slug) {
        orConditions.push({ slug: data.slug });
      }

      if (orConditions.length > 0) {
        conflictWhere.OR = orConditions;
        
        const existingCategory = await prisma.blogCategory.findFirst({
          where: conflictWhere,
        });

        if (existingCategory) {
          throw new Error('A category with this name or slug already exists');
        }
      }
    }

    // Use a transaction to update both category and related blog posts
    const result = await prisma.$transaction(async (tx) => {
      // Update the category
      const updatedCategory = await tx.blogCategory.update({
        where: { id },
        data,
      });

      // Note: Blog posts are now linked by categoryId, so no need to update posts when category name changes

      return updatedCategory;
    });

    return result;
  }

  async deleteCategory(id: string) {
    const category = await prisma.blogCategory.findUnique({
      where: { id },
    });

    if (!category) {
      throw new NotFoundError('Category not found');
    }

    await prisma.blogCategory.delete({
      where: { id },
    });
  }

  // Utility methods
  async generateSlug(title: string): Promise<string> {
    const baseSlug = title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();

    let slug = baseSlug;
    let counter = 1;

    while (await this.slugExists(slug)) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    return slug;
  }

  private async slugExists(slug: string): Promise<boolean> {
    const post = await prisma.blogPost.findUnique({
      where: { slug },
    });
    return !!post;
  }
}
