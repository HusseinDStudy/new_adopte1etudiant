import { FastifyInstance } from 'fastify';
import {
  getPublishedPosts,
  getPostBySlug,
  getRelatedPosts,
  getCategories,
  adminGetAllPosts,
  adminGetPostById,
  adminCreatePost,
  adminUpdatePost,
  adminDeletePost,
  adminTogglePublished,
  adminToggleFeatured,
  adminCreateCategory,
  adminUpdateCategory,
  adminDeleteCategory,
  generateSlug,
} from '../controllers/blogController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { roleMiddleware } from '../middleware/roleMiddleware.js';
import { sanitizationMiddleware } from '../middleware/sanitizationMiddleware.js';
import { Role } from '@prisma/client';

async function blogRoutes(server: FastifyInstance) {
  // Public routes for blog display
  server.get('/posts', {
    schema: {
      description: 'Get all published blog posts with optional filtering',
      tags: ['Blog'],
      summary: 'List published blog posts',
      querystring: {
        type: 'object',
        properties: {
          search: { type: 'string', description: 'Search in title, excerpt, and content', example: 'javascript tutorial' },
          category: { type: 'string', description: 'Filter by category', example: 'Technology' },
          featured: { type: 'boolean', description: 'Filter featured posts', example: true },
          page: { type: 'integer', minimum: 1, default: 1, example: 1 },
          limit: { type: 'integer', minimum: 1, maximum: 50, default: 10, example: 5 },
        },
        example: {
          search: 'web development',
          category: 'Programming',
          page: 1,
          limit: 5
        }
      },
      response: {
        200: {
          description: 'List of published blog posts',
          type: 'object',
          properties: {
            posts: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'string', example: 'clp_blog_post_id_1' },
                  title: { type: 'string', example: 'The Future of Web Development' },
                  slug: { type: 'string', example: 'the-future-of-web-development' },
                  excerpt: { type: 'string', example: 'An in-depth look at upcoming trends in web technology.' },
                  image: { type: 'string', example: 'https://example.com/blog/web-dev-future.jpg' },
                  category: { type: 'string', example: 'Technology' },
                  author: { type: 'string', example: 'Jane Doe' },
                  readTime: { type: 'string', example: '10 min read' },
                  published: { type: 'boolean', example: true },
                  featured: { type: 'boolean', example: true },
                  publishedAt: { type: 'string', format: 'date-time', example: '2024-03-01T10:00:00Z' },
                  createdAt: { type: 'string', format: 'date-time', example: '2024-02-28T09:00:00Z' },
                },
                example: {
                  id: 'clp_blog_post_id_1',
                  title: 'The Future of Web Development',
                  slug: 'the-future-of-web-development',
                  excerpt: 'An in-depth look at upcoming trends in web technology.',
                  image: 'https://example.com/blog/web-dev-future.jpg',
                  category: 'Technology',
                  author: 'Jane Doe',
                  readTime: '10 min read',
                  published: true,
                  featured: true,
                  publishedAt: '2024-03-01T10:00:00Z',
                  createdAt: '2024-02-28T09:00:00Z',
                }
              },
              example: [
                {
                  id: 'clp_blog_post_id_1',
                  title: 'The Future of Web Development',
                  slug: 'the-future-of-web-development',
                  excerpt: 'An in-depth look at upcoming trends in web technology.',
                  image: 'https://example.com/blog/web-dev-future.jpg',
                  category: 'Technology',
                  author: 'Jane Doe',
                  readTime: '10 min read',
                  published: true,
                  featured: true,
                  publishedAt: '2024-03-01T10:00:00Z',
                  createdAt: '2024-02-28T09:00:00Z',
                },
                {
                  id: 'clp_blog_post_id_2',
                  title: 'Mastering React Hooks',
                  slug: 'mastering-react-hooks',
                  excerpt: 'A comprehensive guide to effectively using React Hooks in your projects.',
                  image: 'https://example.com/blog/react-hooks.jpg',
                  category: 'Programming',
                  author: 'John Smith',
                  readTime: '8 min read',
                  published: true,
                  featured: false,
                  publishedAt: '2024-02-20T14:00:00Z',
                  createdAt: '2024-02-18T13:00:00Z',
                }
              ]
            },
            pagination: {
              type: 'object',
              properties: {
                page: { type: 'integer', example: 1 },
                limit: { type: 'integer', example: 5 },
                total: { type: 'integer', example: 20 },
                totalPages: { type: 'integer', example: 4 },
              },
              example: {
                page: 1,
                limit: 5,
                total: 20,
                totalPages: 4
              }
            }
          },
          example: {
            posts: [
              {
                id: 'clp_blog_post_id_1',
                title: 'The Future of Web Development',
                slug: 'the-future-of-web-development',
                excerpt: 'An in-depth look at upcoming trends in web technology.',
                image: 'https://example.com/blog/web-dev-future.jpg',
                category: 'Technology',
                author: 'Jane Doe',
                readTime: '10 min read',
                published: true,
                featured: true,
                publishedAt: '2024-03-01T10:00:00Z',
                createdAt: '2024-02-28T09:00:00Z',
              }
            ],
            pagination: {
              page: 1,
              limit: 5,
              total: 20,
              totalPages: 4
            }
          }
        }
      }
    }
  }, getPublishedPosts);

  server.get('/posts/:slug', {
    schema: {
      description: 'Get a published blog post by slug',
      tags: ['Blog'],
      summary: 'Get blog post by slug',
      params: {
        type: 'object',
        properties: {
          slug: { type: 'string', description: 'Blog post slug', example: 'the-future-of-web-development' }
        },
        required: ['slug'],
        example: { slug: 'the-future-of-web-development' }
      },
      response: {
        200: {
          description: 'Blog post details',
          type: 'object',
          properties: {
            id: { type: 'string', example: 'clp_blog_post_id_1' },
            title: { type: 'string', example: 'The Future of Web Development' },
            slug: { type: 'string', example: 'the-future-of-web-development' },
            excerpt: { type: 'string', example: 'An in-depth look at upcoming trends in web technology.' },
            content: { type: 'string', example: 'Detailed markdown content of the blog post...' },
            image: { type: 'string', example: 'https://example.com/blog/web-dev-future.jpg' },
            category: { type: 'string', example: 'Technology' },
            author: { type: 'string', example: 'Jane Doe' },
            readTime: { type: 'string', example: '10 min read' },
            publishedAt: { type: 'string', format: 'date-time', example: '2024-03-01T10:00:00Z' },
            metaTitle: { type: 'string', example: 'Future of Web Dev' },
            metaDescription: { type: 'string', example: 'Trends, technologies, and insights into the future of web development.' },
          },
          example: {
            id: 'clp_blog_post_id_1',
            title: 'The Future of Web Development',
            slug: 'the-future-of-web-development',
            excerpt: 'An in-depth look at upcoming trends in web technology.',
            content: 'Detailed markdown content of the blog post...',
            image: 'https://example.com/blog/web-dev-future.jpg',
            category: 'Technology',
            author: 'Jane Doe',
            readTime: '10 min read',
            publishedAt: '2024-03-01T10:00:00Z',
            metaTitle: 'Future of Web Dev',
            metaDescription: 'Trends, technologies, and insights into the future of web development.',
          }
        },
        404: {
          description: 'Blog post not found',
          type: 'object',
          properties: { message: { type: 'string' } },
          example: { message: 'Blog post with slug \'non-existent-slug\' not found' }
        }
      }
    }
  }, getPostBySlug);

  server.get('/posts/:slug/related', {
    schema: {
      description: 'Get related posts for a blog post',
      tags: ['Blog'],
      summary: 'Get related blog posts',
      params: {
        type: 'object',
        properties: {
          slug: { type: 'string', description: 'Blog post slug', example: 'the-future-of-web-development' }
        },
        required: ['slug'],
        example: { slug: 'the-future-of-web-development' }
      },
      querystring: {
        type: 'object',
        properties: {
          limit: { type: 'integer', minimum: 1, maximum: 10, default: 3, example: 3 }
        },
        example: { limit: 3 }
      },
      response: {
        200: {
          description: 'List of related blog posts',
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string', example: 'clp_related_post_id_1' },
              title: { type: 'string', example: 'Next-Gen CSS Features' },
              slug: { type: 'string', example: 'next-gen-css-features' },
              excerpt: { type: 'string', example: 'Explore the latest and most powerful features in CSS.' },
              image: { type: 'string', example: 'https://example.com/blog/css-features.jpg' },
              category: { type: 'string', example: 'Design' },
              author: { type: 'string', example: 'Emily White' },
              readTime: { type: 'string', example: '7 min read' },
              publishedAt: { type: 'string', format: 'date-time', example: '2024-02-15T11:00:00Z' },
            },
            example: {
              id: 'clp_related_post_id_1',
              title: 'Next-Gen CSS Features',
              slug: 'next-gen-css-features',
              excerpt: 'Explore the latest and most powerful features in CSS.',
              image: 'https://example.com/blog/css-features.jpg',
              category: 'Design',
              author: 'Emily White',
              readTime: '7 min read',
              publishedAt: '2024-02-15T11:00:00Z',
            }
          },
          example: [
            {
              id: 'clp_related_post_id_1',
              title: 'Next-Gen CSS Features',
              slug: 'next-gen-css-features',
              excerpt: 'Explore the latest and most powerful features in CSS.',
              image: 'https://example.com/blog/css-features.jpg',
              category: 'Design',
              author: 'Emily White',
              readTime: '7 min read',
              publishedAt: '2024-02-15T11:00:00Z',
            },
            {
              id: 'clp_related_post_id_2',
              title: 'Optimizing React Performance',
              slug: 'optimizing-react-performance',
              excerpt: 'Tips and tricks to make your React applications blazing fast.',
              image: 'https://example.com/blog/react-perf.jpg',
              category: 'Programming',
              author: 'David Green',
              readTime: '9 min read',
              publishedAt: '2024-01-25T15:00:00Z',
            }
          ]
        }
      }
    }
  }, getRelatedPosts);

  server.get('/categories', {
    schema: {
      description: 'Get all blog categories',
      tags: ['Blog'],
      summary: 'List blog categories',
      response: {
        200: {
          description: 'List of blog categories',
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string', example: 'clp_cat_id_1' },
              name: { type: 'string', example: 'Technology' },
              slug: { type: 'string', example: 'technology' },
              description: { type: 'string', example: 'Posts related to software development, AI, and IT.' },
              icon: { type: 'string', example: 'fas fa-laptop-code' },
              color: { type: 'string', example: '#007bff' },
            },
            example: {
              id: 'clp_cat_id_1',
              name: 'Technology',
              slug: 'technology',
              description: 'Posts related to software development, AI, and IT.',
              icon: 'fas fa-laptop-code',
              color: '#007bff',
            }
          },
          example: [
            {
              id: 'clp_cat_id_1',
              name: 'Technology',
              slug: 'technology',
              description: 'Posts related to software development, AI, and IT.',
              icon: 'fas fa-laptop-code',
              color: '#007bff',
            },
            {
              id: 'clp_cat_id_2',
              name: 'Career Advice',
              slug: 'career-advice',
              description: 'Tips and guidance for career growth and job searching.',
              icon: 'fas fa-briefcase',
              color: '#28a745',
            }
          ]
        }
      }
    }
  }, getCategories);

  // Admin routes (ADMIN role required)
  server.get('/admin/posts', {
    preHandler: [authMiddleware, roleMiddleware([Role.ADMIN])],
    schema: {
      description: 'Get all blog posts for admin management',
      tags: ['Blog Admin'],
      summary: 'Admin: List all blog posts',
      security: [{ cookieAuth: [] }],
      querystring: {
        type: 'object',
        properties: {
          search: { type: 'string', description: 'Search in title, excerpt, and author', example: 'react components' },
          category: { type: 'string', description: 'Filter by category', example: 'Programming' },
          published: { type: 'boolean', description: 'Filter by published status', example: true },
          featured: { type: 'boolean', description: 'Filter featured posts', example: false },
          page: { type: 'integer', minimum: 1, default: 1, example: 1 },
          limit: { type: 'integer', minimum: 1, maximum: 100, default: 10, example: 5 },
        },
        example: {
          search: 'design patterns',
          published: false,
          page: 1,
          limit: 5
        }
      },
      response: {
        200: {
          description: 'List of all blog posts',
          type: 'object',
          properties: {
            posts: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'string', example: 'clp_admin_post_id_1' },
                  title: { type: 'string', example: 'Draft: New Feature Rollout' },
                  slug: { type: 'string', example: 'draft-new-feature-rollout' },
                  excerpt: { type: 'string', example: 'Details about the upcoming feature and its impact.' },
                  image: { type: 'string', example: 'https://example.com/blog/feature-rollout.jpg' },
                  category: { type: 'string', example: 'Updates' },
                  author: { type: 'string', example: 'Admin User' },
                  readTime: { type: 'string', example: '5 min read' },
                  published: { type: 'boolean', example: false },
                  featured: { type: 'boolean', example: false },
                  publishedAt: { type: 'string', format: 'date-time', example: null },
                  createdAt: { type: 'string', format: 'date-time', example: '2024-03-20T10:00:00Z' },
                  updatedAt: { type: 'string', format: 'date-time', example: '2024-03-21T11:00:00Z' },
                },
                example: {
                  id: 'clp_admin_post_id_1',
                  title: 'Draft: New Feature Rollout',
                  slug: 'draft-new-feature-rollout',
                  excerpt: 'Details about the upcoming feature and its impact.',
                  image: 'https://example.com/blog/feature-rollout.jpg',
                  category: 'Updates',
                  author: 'Admin User',
                  readTime: '5 min read',
                  published: false,
                  featured: false,
                  publishedAt: null,
                  createdAt: '2024-03-20T10:00:00Z',
                  updatedAt: '2024-03-21T11:00:00Z',
                }
              },
              example: [
                {
                  id: 'clp_admin_post_id_1',
                  title: 'Draft: New Feature Rollout',
                  slug: 'draft-new-feature-rollout',
                  excerpt: 'Details about the upcoming feature and its impact.',
                  image: 'https://example.com/blog/feature-rollout.jpg',
                  category: 'Updates',
                  author: 'Admin User',
                  readTime: '5 min read',
                  published: false,
                  featured: false,
                  publishedAt: null,
                  createdAt: '2024-03-20T10:00:00Z',
                  updatedAt: '2024-03-21T11:00:00Z',
                },
                {
                  id: 'clp_admin_post_id_2',
                  title: 'Published: API Best Practices',
                  slug: 'api-best-practices',
                  excerpt: 'A guide to designing robust and scalable APIs.',
                  image: 'https://example.com/blog/api-guide.jpg',
                  category: 'Programming',
                  author: 'Another Admin',
                  readTime: '12 min read',
                  published: true,
                  featured: true,
                  publishedAt: '2024-03-15T10:00:00Z',
                  createdAt: '2024-03-10T09:00:00Z',
                  updatedAt: '2024-03-15T10:00:00Z',
                }
              ]
            },
            pagination: {
              type: 'object',
              properties: {
                page: { type: 'integer', example: 1 },
                limit: { type: 'integer', example: 5 },
                total: { type: 'integer', example: 10 },
                totalPages: { type: 'integer', example: 2 },
              },
              example: {
                page: 1,
                limit: 5,
                total: 10,
                totalPages: 2
              }
            }
          },
          example: {
            posts: [
              {
                id: 'clp_admin_post_id_1',
                title: 'Draft: New Feature Rollout',
                slug: 'draft-new-feature-rollout',
                excerpt: 'Details about the upcoming feature and its impact.',
                image: 'https://example.com/blog/feature-rollout.jpg',
                category: 'Updates',
                author: 'Admin User',
                readTime: '5 min read',
                published: false,
                featured: false,
                publishedAt: null,
                createdAt: '2024-03-20T10:00:00Z',
                updatedAt: '2024-03-21T11:00:00Z',
              }
            ],
            pagination: {
              page: 1,
              limit: 5,
              total: 10,
              totalPages: 2
            }
          }
        },
        401: {
          description: 'Not authenticated',
          type: 'object',
          properties: { message: { type: 'string' } },
          example: { message: 'Unauthorized' }
        },
        403: {
          description: 'Access denied - Admin role required',
          type: 'object',
          properties: { message: { type: 'string' } },
          example: { message: 'Forbidden: Only administrators can access this resource' }
        }
      }
    }
  }, adminGetAllPosts);

  server.get('/admin/posts/:id', {
    preHandler: [authMiddleware, roleMiddleware([Role.ADMIN])],
    schema: {
      description: 'Get a blog post by ID for admin editing',
      tags: ['Blog Admin'],
      summary: 'Admin: Get blog post by ID',
      security: [{ cookieAuth: [] }],
      params: {
        type: 'object',
        properties: {
          id: { type: 'string', description: 'Blog post ID', example: 'clp_admin_post_id_to_retrieve' }
        },
        required: ['id'],
        example: { id: 'clp_admin_post_id_to_retrieve' }
      },
      response: {
        200: {
          description: 'Blog post details',
          type: 'object',
          properties: {
            id: { type: 'string', example: 'clp_admin_post_id_to_retrieve' },
            title: { type: 'string', example: 'Draft: New Feature Rollout' },
            slug: { type: 'string', example: 'draft-new-feature-rollout' },
            excerpt: { type: 'string', example: 'Details about the upcoming feature and its impact.' },
            content: { type: 'string', example: '# New Feature Release\n\nWe are excited to announce the rollout of our new feature...' },
            image: { type: 'string', example: 'https://example.com/blog/feature-rollout.jpg' },
            category: { type: 'string', example: 'Updates' },
            author: { type: 'string', example: 'Admin User' },
            published: { type: 'boolean', example: false },
            featured: { type: 'boolean', example: false },
            createdAt: { type: 'string', example: '2024-03-20T10:00:00Z' },
            updatedAt: { type: 'string', example: '2024-03-21T11:00:00Z' },
            metaTitle: { type: 'string', example: 'New Feature Launch' },
            metaDescription: { type: 'string', example: 'Get ready for our latest product enhancement.' },
          },
          example: {
            id: 'clp_admin_post_id_to_retrieve',
            title: 'Draft: New Feature Rollout',
            slug: 'draft-new-feature-rollout',
            excerpt: 'Details about the upcoming feature and its impact.',
            content: '# New Feature Release\n\nWe are excited to announce the rollout of our new feature...',
            image: 'https://example.com/blog/feature-rollout.jpg',
            category: 'Updates',
            author: 'Admin User',
            published: false,
            featured: false,
            createdAt: '2024-03-20T10:00:00Z',
            updatedAt: '2024-03-21T11:00:00Z',
            metaTitle: 'New Feature Launch',
            metaDescription: 'Get ready for our latest product enhancement.',
          }
        },
        404: {
          description: 'Blog post not found',
          type: 'object',
          properties: { message: { type: 'string' } },
          example: { message: 'Blog post with ID clp_non_existent_id not found' }
        },
        401: {
          description: 'Not authenticated',
          type: 'object',
          properties: { message: { type: 'string' } },
          example: { message: 'Unauthorized' }
        },
        403: {
          description: 'Access denied - Admin role required',
          type: 'object',
          properties: { message: { type: 'string' } },
          example: { message: 'Forbidden: Only administrators can access this resource' }
        }
      }
    }
  }, adminGetPostById);

  server.post('/admin/posts', {
    preHandler: [authMiddleware, roleMiddleware([Role.ADMIN]), sanitizationMiddleware],
    schema: {
      description: 'Create a new blog post',
      tags: ['Blog Admin'],
      summary: 'Admin: Create blog post',
      security: [{ cookieAuth: [] }],
      body: {
        type: 'object',
        required: ['title', 'author', 'readTime', 'categoryId'],
        properties: {
          title: { type: 'string', minLength: 1, maxLength: 200, example: 'New Blog Post Title' },
          slug: { type: 'string', pattern: '^[a-z0-9-]+$', example: 'new-blog-post-title' },
          excerpt: { type: 'string', minLength: 1, maxLength: 500, example: 'This is a short excerpt for the new blog post.' },
          content: { type: 'string', minLength: 1, example: '# Heading 1\n\nThis is the content of the new blog post in markdown format.' },
          image: { 
            anyOf: [
              { type: 'string', format: 'uri', example: 'https://example.com/new-blog-image.jpg' },
              { type: 'string', maxLength: 0 }
            ]
          },
          categoryId: { type: 'string', minLength: 1, example: 'clp_category_id_1' },
          author: { type: 'string', minLength: 1, example: 'Admin User' },
          readTime: { type: 'string', minLength: 1, example: '5 min read' },
          published: { type: 'boolean', default: false, example: false },
          featured: { type: 'boolean', default: false, example: true },
          metaTitle: { type: 'string', maxLength: 60, example: 'My New Blog Post' },
          metaDescription: { type: 'string', maxLength: 160, example: 'A fresh new blog post covering exciting topics.' },
        },
        example: {
          title: 'New Blog Post Title',
          slug: 'new-blog-post-title',
          excerpt: 'This is a short excerpt for the new blog post.',
          content: '# Heading 1\n\nThis is the content of the new blog post in markdown format.',
          image: 'https://example.com/new-blog-image.jpg',
          categoryId: 'clp_category_id_1',
          author: 'Admin User',
          readTime: '5 min read',
          published: false,
          featured: true,
          metaTitle: 'My New Blog Post',
          metaDescription: 'A fresh new blog post covering exciting topics.',
        }
      },
      response: {
        201: {
          description: 'Blog post created successfully',
          type: 'object',
          properties: {
            id: { type: 'string', example: 'clp_created_post_id' },
            title: { type: 'string', example: 'New Blog Post Title' },
            slug: { type: 'string', example: 'new-blog-post-title' },
            published: { type: 'boolean', example: false },
            featured: { type: 'boolean', example: true },
            createdAt: { type: 'string', example: '2024-03-25T10:00:00Z' }
          },
          example: {
            id: 'clp_created_post_id',
            title: 'New Blog Post Title',
            slug: 'new-blog-post-title',
            published: false,
            featured: true,
            createdAt: '2024-03-25T10:00:00Z'
          }
        },
        400: {
          description: 'Invalid input data',
          type: 'object',
          properties: { message: { type: 'string' } },
          example: { message: 'Title is required' }
        },
        401: {
          description: 'Not authenticated',
          type: 'object',
          properties: { message: { type: 'string' } },
          example: { message: 'Unauthorized' }
        },
        403: {
          description: 'Access denied - Admin role required',
          type: 'object',
          properties: { message: { type: 'string' } },
          example: { message: 'Forbidden: Only administrators can create posts' }
        }
      }
    }
  }, adminCreatePost);

  server.put('/admin/posts/:id', {
    preHandler: [authMiddleware, roleMiddleware([Role.ADMIN]), sanitizationMiddleware],
    schema: {
      description: 'Update a blog post',
      tags: ['Blog Admin'],
      summary: 'Admin: Update blog post',
      security: [{ cookieAuth: [] }],
      params: {
        type: 'object',
        properties: {
          id: { type: 'string', description: 'Blog post ID', example: 'clp_post_id_to_update' }
        },
        required: ['id'],
        example: { id: 'clp_post_id_to_update' }
      },
      body: {
        type: 'object',
        properties: {
          title: { type: 'string', minLength: 1, maxLength: 200, example: 'Updated Blog Post Title' },
          slug: { type: 'string', pattern: '^[a-z0-9-]+$', example: 'updated-blog-post-title' },
          excerpt: { type: 'string', minLength: 1, maxLength: 500, example: 'This is an updated excerpt for the blog post.' },
          content: { type: 'string', minLength: 1, example: '# Updated Heading\n\nThis is the updated content of the blog post.' },
          image: { 
            anyOf: [
              { type: 'string', format: 'uri', example: 'https://example.com/updated-blog-image.jpg' },
              { type: 'string', maxLength: 0 }
            ]
          },
          category: { type: 'string', example: 'Updates' },
          author: { type: 'string', minLength: 1, example: 'Admin Editor' },
          readTime: { type: 'string', minLength: 1, example: '7 min read' },
          published: { type: 'boolean', example: true },
          featured: { type: 'boolean', example: false },
          metaTitle: { type: 'string', maxLength: 60, example: 'Updated Blog Post' },
          metaDescription: { type: 'string', maxLength: 160, example: 'Latest updates on a previous blog post.' },
        },
        example: {
          title: 'Updated Blog Post Title',
          excerpt: 'This is an updated excerpt for the blog post.',
          published: true
        }
      },
      response: {
        200: {
          description: 'Blog post updated successfully',
          type: 'object',
          properties: {
            id: { type: 'string', example: 'clp_post_id_to_update' },
            title: { type: 'string', example: 'Updated Blog Post Title' },
            slug: { type: 'string', example: 'updated-blog-post-title' },
            published: { type: 'boolean', example: true },
            featured: { type: 'boolean', example: false },
            updatedAt: { type: 'string', example: '2024-03-26T09:00:00Z' }
          },
          example: {
            id: 'clp_post_id_to_update',
            title: 'Updated Blog Post Title',
            slug: 'updated-blog-post-title',
            published: true,
            featured: false,
            updatedAt: '2024-03-26T09:00:00Z'
          }
        },
        404: {
          description: 'Blog post not found',
          type: 'object',
          properties: { message: { type: 'string' } },
          example: { message: 'Blog post with ID clp_non_existent_id not found' }
        },
        400: {
          description: 'Invalid input data',
          type: 'object',
          properties: { message: { type: 'string' } },
          example: { message: 'Title cannot be empty' }
        },
        401: {
          description: 'Not authenticated',
          type: 'object',
          properties: { message: { type: 'string' } },
          example: { message: 'Unauthorized' }
        },
        403: {
          description: 'Access denied - Admin role required',
          type: 'object',
          properties: { message: { type: 'string' } },
          example: { message: 'Forbidden: Only administrators can update posts' }
        }
      }
    }
  }, adminUpdatePost);

  server.delete('/admin/posts/:id', {
    preHandler: [authMiddleware, roleMiddleware([Role.ADMIN])],
    schema: {
      description: 'Delete a blog post',
      tags: ['Blog Admin'],
      summary: 'Admin: Delete blog post',
      security: [{ cookieAuth: [] }],
      params: {
        type: 'object',
        properties: {
          id: { type: 'string', description: 'Blog post ID', example: 'clp_post_id_to_delete' }
        },
        required: ['id'],
        example: { id: 'clp_post_id_to_delete' }
      },
      response: {
        204: {
          description: 'Blog post deleted successfully',
          type: 'null',
          example: null
        },
        404: {
          description: 'Blog post not found',
          type: 'object',
          properties: { message: { type: 'string' } },
          example: { message: 'Blog post with ID clp_non_existent_id not found' }
        },
        401: {
          description: 'Not authenticated',
          type: 'object',
          properties: { message: { type: 'string' } },
          example: { message: 'Unauthorized' }
        },
        403: {
          description: 'Access denied - Admin role required',
          type: 'object',
          properties: { message: { type: 'string' } },
          example: { message: 'Forbidden: Only administrators can delete posts' }
        }
      }
    }
  }, adminDeletePost);

  server.patch('/admin/posts/:id/publish', {
    preHandler: [authMiddleware, roleMiddleware([Role.ADMIN])],
    schema: {
      description: 'Toggle published status of a blog post',
      tags: ['Blog Admin'],
      summary: 'Admin: Toggle publish status',
      security: [{ cookieAuth: [] }],
      params: {
        type: 'object',
        properties: {
          id: { type: 'string', description: 'Blog post ID', example: 'clp_post_id_to_toggle_publish' }
        },
        required: ['id'],
        example: { id: 'clp_post_id_to_toggle_publish' }
      },
      response: {
        200: {
          description: 'Blog post publish status toggled',
          type: 'object',
          properties: {
            id: { type: 'string', example: 'clp_post_id_to_toggle_publish' },
            published: { type: 'boolean', example: true },
            publishedAt: { type: 'string', example: '2024-03-26T10:00:00Z' }
          },
          example: {
            id: 'clp_post_id_to_toggle_publish',
            published: true,
            publishedAt: '2024-03-26T10:00:00Z'
          }
        },
        404: {
          description: 'Blog post not found',
          type: 'object',
          properties: { message: { type: 'string' } },
          example: { message: 'Blog post with ID clp_non_existent_id not found' }
        },
        401: {
          description: 'Not authenticated',
          type: 'object',
          properties: { message: { type: 'string' } },
          example: { message: 'Unauthorized' }
        },
        403: {
          description: 'Access denied - Admin role required',
          type: 'object',
          properties: { message: { type: 'string' } },
          example: { message: 'Forbidden: Only administrators can change publish status' }
        }
      }
    }
  }, adminTogglePublished);

  server.patch('/admin/posts/:id/feature', {
    preHandler: [authMiddleware, roleMiddleware([Role.ADMIN])],
    schema: {
      description: 'Toggle featured status of a blog post',
      tags: ['Blog Admin'],
      summary: 'Admin: Toggle featured status',
      security: [{ cookieAuth: [] }],
      params: {
        type: 'object',
        properties: {
          id: { type: 'string', description: 'Blog post ID', example: 'clp_post_id_to_toggle_feature' }
        },
        required: ['id'],
        example: { id: 'clp_post_id_to_toggle_feature' }
      },
      response: {
        200: {
          description: 'Blog post featured status toggled',
          type: 'object',
          properties: {
            id: { type: 'string', example: 'clp_post_id_to_toggle_feature' },
            featured: { type: 'boolean', example: true }
          },
          example: {
            id: 'clp_post_id_to_toggle_feature',
            featured: true
          }
        },
        404: {
          description: 'Blog post not found',
          type: 'object',
          properties: { message: { type: 'string' } },
          example: { message: 'Blog post with ID clp_non_existent_id not found' }
        },
        401: {
          description: 'Not authenticated',
          type: 'object',
          properties: { message: { type: 'string' } },
          example: { message: 'Unauthorized' }
        },
        403: {
          description: 'Access denied - Admin role required',
          type: 'object',
          properties: { message: { type: 'string' } },
          example: { message: 'Forbidden: Only administrators can change featured status' }
        }
      }
    }
  }, adminToggleFeatured);

  // Category management routes
  server.post('/admin/categories', {
    preHandler: [authMiddleware, roleMiddleware([Role.ADMIN]), sanitizationMiddleware],
    schema: {
      description: 'Create a new blog category',
      tags: ['Blog Admin'],
      summary: 'Admin: Create blog category',
      security: [{ cookieAuth: [] }],
      body: {
        type: 'object',
        required: ['name', 'slug'],
        properties: {
          name: { type: 'string', minLength: 1, maxLength: 100, example: 'Technology' },
          slug: { type: 'string', pattern: '^[a-z0-9-]+$', example: 'technology' },
          description: { type: 'string', maxLength: 500, example: 'Posts related to software development, AI, and IT.' },
          icon: { type: 'string', example: 'fas fa-laptop-code' },
          color: { type: 'string', pattern: '^#[0-9A-Fa-f]{6}$' , example: '#007bff'},
        },
        example: {
          name: 'Technology',
          slug: 'technology',
          description: 'Posts related to software development, AI, and IT.',
          icon: 'fas fa-laptop-code',
          color: '#007bff'
        }
      },
      response: {
        201: {
          description: 'Category created successfully',
          type: 'object',
          properties: {
            id: { type: 'string', example: 'clp_new_category_id' },
            name: { type: 'string', example: 'Technology' },
            slug: { type: 'string', example: 'technology' }
          },
          example: {
            id: 'clp_new_category_id',
            name: 'Technology',
            slug: 'technology'
          }
        },
        400: {
          description: 'Invalid input data',
          type: 'object',
          properties: { message: { type: 'string' } },
          example: { message: 'Category name is required' }
        },
        401: {
          description: 'Not authenticated',
          type: 'object',
          properties: { message: { type: 'string' } },
          example: { message: 'Unauthorized' }
        },
        403: {
          description: 'Access denied - Admin role required',
          type: 'object',
          properties: { message: { type: 'string' } },
          example: { message: 'Forbidden: Only administrators can create categories' }
        }
      }
    }
  }, adminCreateCategory);

  server.put('/admin/categories/:id', {
    preHandler: [authMiddleware, roleMiddleware([Role.ADMIN]), sanitizationMiddleware],
    schema: {
      description: 'Update a blog category',
      tags: ['Blog Admin'],
      summary: 'Admin: Update blog category',
      security: [{ cookieAuth: [] }],
      params: {
        type: 'object',
        properties: {
          id: { type: 'string', description: 'Category ID', example: 'clp_category_id_to_update' }
        },
        required: ['id'],
        example: { id: 'clp_category_id_to_update' }
      },
      body: {
        type: 'object',
        properties: {
          name: { type: 'string', minLength: 1, maxLength: 100, example: 'Updated Technology' },
          slug: { type: 'string', pattern: '^[a-z0-9-]+$', example: 'updated-technology' },
          description: { type: 'string', maxLength: 500, example: 'Updated posts related to software development and AI.' },
          icon: { type: 'string', example: 'fas fa-microchip' },
          color: { type: 'string', pattern: '^#[0-9A-Fa-f]{6}$' , example: '#FF5733'},
        },
        example: {
          name: 'Updated Technology',
          icon: 'fas fa-microchip'
        }
      },
      response: {
        200: {
          description: 'Category updated successfully',
          type: 'object',
          properties: {
            id: { type: 'string', example: 'clp_category_id_to_update' },
            name: { type: 'string', example: 'Updated Technology' },
            slug: { type: 'string', example: 'updated-technology' }
          },
          example: {
            id: 'clp_category_id_to_update',
            name: 'Updated Technology',
            slug: 'updated-technology'
          }
        },
        404: {
          description: 'Category not found',
          type: 'object',
          properties: { message: { type: 'string' } },
          example: { message: 'Category with ID clp_non_existent_id not found' }
        },
        400: {
          description: 'Invalid input data',
          type: 'object',
          properties: { message: { type: 'string' } },
          example: { message: 'Category name is too short' }
        },
        401: {
          description: 'Not authenticated',
          type: 'object',
          properties: { message: { type: 'string' } },
          example: { message: 'Unauthorized' }
        },
        403: {
          description: 'Access denied - Admin role required',
          type: 'object',
          properties: { message: { type: 'string' } },
          example: { message: 'Forbidden: Only administrators can update categories' }
        }
      }
    }
  }, adminUpdateCategory);

  server.delete('/admin/categories/:id', {
    preHandler: [authMiddleware, roleMiddleware([Role.ADMIN])],
    schema: {
      description: 'Delete a blog category',
      tags: ['Blog Admin'],
      summary: 'Admin: Delete blog category',
      security: [{ cookieAuth: [] }],
      params: {
        type: 'object',
        properties: {
          id: { type: 'string', description: 'Category ID', example: 'clp_category_id_to_delete' }
        },
        required: ['id'],
        example: { id: 'clp_category_id_to_delete' }
      },
      response: {
        204: {
          description: 'Category deleted successfully',
          type: 'null',
          example: null
        },
        404: {
          description: 'Category not found',
          type: 'object',
          properties: { message: { type: 'string' } },
          example: { message: 'Category with ID clp_non_existent_id not found' }
        },
        401: {
          description: 'Not authenticated',
          type: 'object',
          properties: { message: { type: 'string' } },
          example: { message: 'Unauthorized' }
        },
        403: {
          description: 'Access denied - Admin role required',
          type: 'object',
          properties: { message: { type: 'string' } },
          example: { message: 'Forbidden: Only administrators can delete categories' }
        }
      }
    }
  }, adminDeleteCategory);

  // Utility routes
  server.post('/admin/generate-slug', {
    preHandler: [authMiddleware, roleMiddleware([Role.ADMIN])],
    schema: {
      description: 'Generate a unique slug from a title',
      tags: ['Blog Admin'],
      summary: 'Admin: Generate slug',
      security: [{ cookieAuth: [] }],
      body: {
        type: 'object',
        required: ['title'],
        properties: {
          title: { type: 'string', minLength: 1, example: 'My New Blog Post' }
        },
        example: { title: 'My New Blog Post' }
      },
      response: {
        200: {
          description: 'Generated slug',
          type: 'object',
          properties: {
            slug: { type: 'string', example: 'my-new-blog-post' }
          },
          example: { slug: 'my-new-blog-post' }
        }
      }
    }
  }, generateSlug);
}

export default blogRoutes;
