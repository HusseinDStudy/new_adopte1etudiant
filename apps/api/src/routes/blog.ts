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
          search: { type: 'string', description: 'Search in title, excerpt, and content' },
          category: { type: 'string', description: 'Filter by category' },
          featured: { type: 'boolean', description: 'Filter featured posts' },
          page: { type: 'integer', minimum: 1, default: 1 },
          limit: { type: 'integer', minimum: 1, maximum: 50, default: 10 },
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
                  id: { type: 'string' },
                  title: { type: 'string' },
                  slug: { type: 'string' },
                  excerpt: { type: 'string' },
                  image: { type: 'string' },
                  category: { type: 'string' },
                  author: { type: 'string' },
                  readTime: { type: 'string' },
                  published: { type: 'boolean' },
                  featured: { type: 'boolean' },
                  publishedAt: { type: 'string', format: 'date-time' },
                  createdAt: { type: 'string', format: 'date-time' },
                }
              }
            },
            pagination: {
              type: 'object',
              properties: {
                page: { type: 'integer' },
                limit: { type: 'integer' },
                total: { type: 'integer' },
                totalPages: { type: 'integer' },
              }
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
          slug: { type: 'string', description: 'Blog post slug' }
        },
        required: ['slug']
      },
      response: {
        200: {
          description: 'Blog post details',
          type: 'object',
          properties: {
            id: { type: 'string' },
            title: { type: 'string' },
            slug: { type: 'string' },
            excerpt: { type: 'string' },
            content: { type: 'string' },
            image: { type: 'string' },
            category: { type: 'string' },
            author: { type: 'string' },
            readTime: { type: 'string' },
            publishedAt: { type: 'string', format: 'date-time' },
            metaTitle: { type: 'string' },
            metaDescription: { type: 'string' },
          }
        },
        404: {
          description: 'Blog post not found',
          type: 'object',
          properties: { message: { type: 'string' } }
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
          slug: { type: 'string', description: 'Blog post slug' }
        },
        required: ['slug']
      },
      querystring: {
        type: 'object',
        properties: {
          limit: { type: 'integer', minimum: 1, maximum: 10, default: 3 }
        }
      },
      response: {
        200: {
          description: 'List of related blog posts',
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              title: { type: 'string' },
              slug: { type: 'string' },
              excerpt: { type: 'string' },
              image: { type: 'string' },
              category: { type: 'string' },
              author: { type: 'string' },
              readTime: { type: 'string' },
              publishedAt: { type: 'string', format: 'date-time' },
            }
          }
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
              id: { type: 'string' },
              name: { type: 'string' },
              slug: { type: 'string' },
              description: { type: 'string' },
              icon: { type: 'string' },
              color: { type: 'string' },
            }
          }
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
          search: { type: 'string', description: 'Search in title, excerpt, and author' },
          category: { type: 'string', description: 'Filter by category' },
          published: { type: 'boolean', description: 'Filter by published status' },
          featured: { type: 'boolean', description: 'Filter featured posts' },
          page: { type: 'integer', minimum: 1, default: 1 },
          limit: { type: 'integer', minimum: 1, maximum: 100, default: 10 },
        }
      },
      response: {
        200: {
          description: 'List of all blog posts',
          type: 'object',
          properties: {
            posts: { type: 'array' },
            pagination: { type: 'object' }
          }
        },
        401: {
          description: 'Not authenticated',
          type: 'object',
          properties: { message: { type: 'string' } }
        },
        403: {
          description: 'Access denied - Admin role required',
          type: 'object',
          properties: { message: { type: 'string' } }
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
          id: { type: 'string', description: 'Blog post ID' }
        },
        required: ['id']
      },
      response: {
        200: {
          description: 'Blog post details',
          type: 'object',
          properties: {
            id: { type: 'string' },
            title: { type: 'string' },
            slug: { type: 'string' },
            excerpt: { type: 'string' },
            content: { type: 'string' },
            category: { type: 'string' },
            author: { type: 'string' },
            published: { type: 'boolean' },
            featured: { type: 'boolean' },
            createdAt: { type: 'string' },
            updatedAt: { type: 'string' }
          }
        },
        404: {
          description: 'Blog post not found',
          type: 'object',
          properties: { message: { type: 'string' } }
        },
        401: {
          description: 'Not authenticated',
          type: 'object',
          properties: { message: { type: 'string' } }
        },
        403: {
          description: 'Access denied - Admin role required',
          type: 'object',
          properties: { message: { type: 'string' } }
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
          title: { type: 'string', minLength: 1, maxLength: 200 },
          slug: { type: 'string', pattern: '^[a-z0-9-]+$' },
          excerpt: { type: 'string', minLength: 1, maxLength: 500 },
          content: { type: 'string', minLength: 1 },
          image: { 
            anyOf: [
              { type: 'string', format: 'uri' },
              { type: 'string', maxLength: 0 }
            ]
          },
          categoryId: { type: 'string', minLength: 1 },
          author: { type: 'string', minLength: 1 },
          readTime: { type: 'string', minLength: 1 },
          published: { type: 'boolean', default: false },
          featured: { type: 'boolean', default: false },
          metaTitle: { type: 'string', maxLength: 60 },
          metaDescription: { type: 'string', maxLength: 160 },
        }
      },
      response: {
        201: {
          description: 'Blog post created successfully',
          type: 'object',
          properties: {
            id: { type: 'string' },
            title: { type: 'string' },
            slug: { type: 'string' },
            published: { type: 'boolean' },
            featured: { type: 'boolean' },
            createdAt: { type: 'string' }
          }
        },
        400: {
          description: 'Invalid input data',
          type: 'object',
          properties: { message: { type: 'string' } }
        },
        401: {
          description: 'Not authenticated',
          type: 'object',
          properties: { message: { type: 'string' } }
        },
        403: {
          description: 'Access denied - Admin role required',
          type: 'object',
          properties: { message: { type: 'string' } }
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
          id: { type: 'string', description: 'Blog post ID' }
        },
        required: ['id']
      },
      body: {
        type: 'object',
        properties: {
          title: { type: 'string', minLength: 1, maxLength: 200 },
          slug: { type: 'string', pattern: '^[a-z0-9-]+$' },
          excerpt: { type: 'string', minLength: 1, maxLength: 500 },
          content: { type: 'string', minLength: 1 },
          image: { 
            anyOf: [
              { type: 'string', format: 'uri' },
              { type: 'string', maxLength: 0 }
            ]
          },
          category: { type: 'string' },
          author: { type: 'string', minLength: 1 },
          readTime: { type: 'string', minLength: 1 },
          published: { type: 'boolean' },
          featured: { type: 'boolean' },
          metaTitle: { type: 'string', maxLength: 60 },
          metaDescription: { type: 'string', maxLength: 160 },
        }
      },
      response: {
        200: {
          description: 'Blog post updated successfully',
          type: 'object',
          properties: {
            id: { type: 'string' },
            title: { type: 'string' },
            slug: { type: 'string' },
            published: { type: 'boolean' },
            featured: { type: 'boolean' },
            updatedAt: { type: 'string' }
          }
        },
        404: {
          description: 'Blog post not found',
          type: 'object',
          properties: { message: { type: 'string' } }
        },
        400: {
          description: 'Invalid input data',
          type: 'object',
          properties: { message: { type: 'string' } }
        },
        401: {
          description: 'Not authenticated',
          type: 'object',
          properties: { message: { type: 'string' } }
        },
        403: {
          description: 'Access denied - Admin role required',
          type: 'object',
          properties: { message: { type: 'string' } }
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
          id: { type: 'string', description: 'Blog post ID' }
        },
        required: ['id']
      },
      response: {
        204: {
          description: 'Blog post deleted successfully',
          type: 'null'
        },
        404: {
          description: 'Blog post not found',
          type: 'object',
          properties: { message: { type: 'string' } }
        },
        401: {
          description: 'Not authenticated',
          type: 'object',
          properties: { message: { type: 'string' } }
        },
        403: {
          description: 'Access denied - Admin role required',
          type: 'object',
          properties: { message: { type: 'string' } }
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
          id: { type: 'string', description: 'Blog post ID' }
        },
        required: ['id']
      },
      response: {
        200: {
          description: 'Blog post publish status toggled',
          type: 'object',
          properties: {
            id: { type: 'string' },
            published: { type: 'boolean' },
            publishedAt: { type: 'string' }
          }
        },
        404: {
          description: 'Blog post not found',
          type: 'object',
          properties: { message: { type: 'string' } }
        },
        401: {
          description: 'Not authenticated',
          type: 'object',
          properties: { message: { type: 'string' } }
        },
        403: {
          description: 'Access denied - Admin role required',
          type: 'object',
          properties: { message: { type: 'string' } }
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
          id: { type: 'string', description: 'Blog post ID' }
        },
        required: ['id']
      },
      response: {
        200: {
          description: 'Blog post featured status toggled',
          type: 'object',
          properties: {
            id: { type: 'string' },
            featured: { type: 'boolean' }
          }
        },
        404: {
          description: 'Blog post not found',
          type: 'object',
          properties: { message: { type: 'string' } }
        },
        401: {
          description: 'Not authenticated',
          type: 'object',
          properties: { message: { type: 'string' } }
        },
        403: {
          description: 'Access denied - Admin role required',
          type: 'object',
          properties: { message: { type: 'string' } }
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
          name: { type: 'string', minLength: 1, maxLength: 100 },
          slug: { type: 'string', pattern: '^[a-z0-9-]+$' },
          description: { type: 'string', maxLength: 500 },
          icon: { type: 'string' },
          color: { type: 'string', pattern: '^#[0-9A-Fa-f]{6}$' },
        }
      },
      response: {
        201: {
          description: 'Category created successfully',
          type: 'object',
          properties: {
            id: { type: 'string' },
            name: { type: 'string' },
            slug: { type: 'string' }
          }
        },
        400: {
          description: 'Invalid input data',
          type: 'object',
          properties: { message: { type: 'string' } }
        },
        401: {
          description: 'Not authenticated',
          type: 'object',
          properties: { message: { type: 'string' } }
        },
        403: {
          description: 'Access denied - Admin role required',
          type: 'object',
          properties: { message: { type: 'string' } }
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
          id: { type: 'string', description: 'Category ID' }
        },
        required: ['id']
      },
      body: {
        type: 'object',
        properties: {
          name: { type: 'string', minLength: 1, maxLength: 100 },
          slug: { type: 'string', pattern: '^[a-z0-9-]+$' },
          description: { type: 'string', maxLength: 500 },
          icon: { type: 'string' },
          color: { type: 'string', pattern: '^#[0-9A-Fa-f]{6}$' },
        }
      },
      response: {
        200: {
          description: 'Category updated successfully',
          type: 'object',
          properties: {
            id: { type: 'string' },
            name: { type: 'string' },
            slug: { type: 'string' }
          }
        },
        404: {
          description: 'Category not found',
          type: 'object',
          properties: { message: { type: 'string' } }
        },
        400: {
          description: 'Invalid input data',
          type: 'object',
          properties: { message: { type: 'string' } }
        },
        401: {
          description: 'Not authenticated',
          type: 'object',
          properties: { message: { type: 'string' } }
        },
        403: {
          description: 'Access denied - Admin role required',
          type: 'object',
          properties: { message: { type: 'string' } }
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
          id: { type: 'string', description: 'Category ID' }
        },
        required: ['id']
      },
      response: {
        204: {
          description: 'Category deleted successfully',
          type: 'null'
        },
        404: {
          description: 'Category not found',
          type: 'object',
          properties: { message: { type: 'string' } }
        },
        401: {
          description: 'Not authenticated',
          type: 'object',
          properties: { message: { type: 'string' } }
        },
        403: {
          description: 'Access denied - Admin role required',
          type: 'object',
          properties: { message: { type: 'string' } }
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
          title: { type: 'string', minLength: 1 }
        }
      },
      response: {
        200: {
          description: 'Generated slug',
          type: 'object',
          properties: {
            slug: { type: 'string' }
          }
        }
      }
    }
  }, generateSlug);
}

export default blogRoutes;
