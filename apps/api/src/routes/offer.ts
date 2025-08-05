import { FastifyInstance } from 'fastify';
import {
  listOffers,
  getOfferById,
  createOffer,
  updateOffer,
  deleteOffer,
  listMyOffers,
  getOfferApplications,
  getOfferTypes,
} from '../controllers/offerController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { roleMiddleware } from '../middleware/roleMiddleware.js';
import { sanitizationMiddleware } from '../middleware/sanitizationMiddleware.js';
import { createOfferSchema, updateOfferSchema } from 'shared-types';
import { zodToJsonSchema } from 'zod-to-json-schema';
import { Role } from '@prisma/client';

async function offerRoutes(server: FastifyInstance) {
  // Public routes
  server.get('/', {
    schema: {
      description: 'Get all available job offers with optional filtering',
      tags: ['Offers'],
      summary: 'List all offers',
              querystring: {
          type: 'object',
          properties: {
            page: { type: 'integer', minimum: 1, default: 1 },
            limit: { type: 'integer', minimum: 1, maximum: 100, default: 9 },
            search: { type: 'string', description: 'Search in title and description' },
            location: { type: 'string', description: 'Filter by location' },
            skills: { type: 'string', description: 'Comma-separated list of skills' },
            companyName: { type: 'string', description: 'Filter by company name' },
            type: { type: 'string', description: 'Filter by offer type (duration)' },
            sortBy: { type: 'string', enum: ['recent', 'relevance', 'location'], description: 'Sort order for offers' }
          }
        },
      response: {
        200: {
          description: 'Paginated list of offers',
          type: 'object',
          properties: {
            data: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  title: { type: 'string' },
                  description: { type: 'string' },
                  location: { type: 'string' },
                  duration: { type: 'string' },
                  skills: { type: 'array', items: { type: 'string' } },
                  company: {
                    type: 'object',
                    properties: {
                      name: { type: 'string' },
                      sector: { type: 'string' }
                    }
                  },
                  createdAt: { type: 'string', format: 'date-time' },
                  matchScore: { type: 'number', description: 'Match score for students (0-100)' }
                }
              }
            },
            pagination: {
              type: 'object',
              properties: {
                page: { type: 'integer' },
                limit: { type: 'integer' },
                total: { type: 'integer' },
                totalPages: { type: 'integer' }
              }
            }
          }
        }
      }
    }
  }, listOffers);

  server.get('/:id', {
    schema: {
      description: 'Get a specific offer by ID',
      tags: ['Offers'],
      summary: 'Get offer by ID',
      params: {
        type: 'object',
        properties: {
          id: { type: 'string', description: 'Offer ID' }
        },
        required: ['id']
      },
      response: {
        200: {
          description: 'Offer details',
          type: 'object',
          properties: {
            id: { type: 'string' },
            title: { type: 'string' },
            description: { type: 'string' },
            location: { type: 'string' },
            duration: { type: 'string' },
            skills: { type: 'array', items: { type: 'string' } },
            company: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                name: { type: 'string' },
                sector: { type: 'string' },
                contactEmail: { type: 'string', format: 'email' }
              }
            },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
            matchScore: { type: 'number', description: 'Match score for students (0-100)' }
          }
        },
        404: {
          description: 'Offer not found',
          type: 'object',
          properties: {
            message: { type: 'string' }
          }
        }
      }
    }
  }, getOfferById);

  // Get offer types (public route)
  server.get('/types', {
    schema: {
      description: 'Get all available offer types from the database',
      tags: ['Offers'],
      summary: 'Get offer types',
      response: {
        200: {
          description: 'List of offer types',
          type: 'array',
          items: {
            type: 'string'
          }
        }
      }
    }
  }, getOfferTypes);

  // Protected routes for Companies only
  server.get(
    '/my-offers',
    {
      preHandler: [authMiddleware, roleMiddleware([Role.COMPANY])],
      schema: {
        description: 'Get all job offers created by the current company',
        tags: ['Offers'],
        summary: 'Get my offers',
        security: [{ cookieAuth: [] }],
        querystring: {
          type: 'object',
          properties: {
            page: { type: 'integer', minimum: 1, default: 1 },
            limit: { type: 'integer', minimum: 1, maximum: 100, default: 10 },
            status: { type: 'string', enum: ['ACTIVE', 'INACTIVE'], description: 'Filter by offer status' }
          }
        },
        response: {
          200: {
            description: 'List of company offers',
            type: 'array',
            items: {
                  type: 'object',
                  properties: {
                    id: { type: 'string' },
                    title: { type: 'string' },
                    description: { type: 'string' },
                    location: { type: 'string' },
                    duration: { type: 'string' },
                    skills: { type: 'array', items: { type: 'string' } },
                    _count: {
                      type: 'object',
                      properties: {
                        applications: { type: 'integer', description: 'Number of applications received' }
                      }
                    },
                    createdAt: { type: 'string', format: 'date-time' },
                    updatedAt: { type: 'string', format: 'date-time' }
                  }
                }
          },
          401: {
            description: 'Not authenticated',
            type: 'object',
            properties: { message: { type: 'string' } }
          },
          403: {
            description: 'Access denied - Company role required',
            type: 'object',
            properties: { message: { type: 'string' } }
          }
        }
      },
    },
    listMyOffers
  );

  server.get(
    '/:id/applications',
    {
      preHandler: [authMiddleware, roleMiddleware([Role.COMPANY])],
      schema: {
        description: 'Get all applications for a specific job offer (Company only)',
        tags: ['Offers'],
        summary: 'Get offer applications',
        security: [{ cookieAuth: [] }],
        params: {
          type: 'object',
          properties: {
            id: { type: 'string', description: 'Offer ID' }
          },
          required: ['id']
        },
        querystring: {
          type: 'object',
          properties: {
            page: { type: 'integer', minimum: 1, default: 1 },
            limit: { type: 'integer', minimum: 1, maximum: 100, default: 10 },
            status: {
              type: 'string',
              enum: ['NEW', 'SEEN', 'INTERVIEW', 'REJECTED', 'HIRED'],
              description: 'Filter by application status'
            }
          }
        },
        response: {
          200: {
            description: 'List of applications for the offer',
            type: 'object',
            properties: {
              applications: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    id: { type: 'string' },
                    studentId: { type: 'string' },
                    offerId: { type: 'string' },
                    status: { type: 'string', enum: ['NEW', 'SEEN', 'INTERVIEW', 'REJECTED', 'HIRED'] },
                    student: {
                      type: 'object',
                      properties: {
                        id: { type: 'string' },
                        userId: { type: 'string', description: 'User ID for adoption requests' },
                        firstName: { type: 'string' },
                        lastName: { type: 'string' },
                        school: { type: 'string' },
                        degree: { type: 'string' },
                        skills: { type: 'array', items: { type: 'string' } },
                        cvUrl: { type: 'string', format: 'uri' },
                        isCvPublic: { type: 'boolean' },
                        isOpenToOpportunities: { type: 'boolean' },
                        user: {
                          type: 'object',
                          properties: {
                            email: { type: 'string', format: 'email' }
                          }
                        }
                      }
                    },
                    createdAt: { type: 'string', format: 'date-time' },
                    updatedAt: { type: 'string', format: 'date-time' }
                  }
                }
              },
              pagination: {
                type: 'object',
                properties: {
                  page: { type: 'integer' },
                  limit: { type: 'integer' },
                  total: { type: 'integer' },
                  totalPages: { type: 'integer' }
                }
              }
            }
          },
          401: {
            description: 'Not authenticated',
            type: 'object',
            properties: { message: { type: 'string' } }
          },
          403: {
            description: 'Access denied - Company role required or not your offer',
            type: 'object',
            properties: { message: { type: 'string' } }
          },
          404: {
            description: 'Offer not found',
            type: 'object',
            properties: { message: { type: 'string' } }
          }
        }
      },
    },
    getOfferApplications as any
  );

  server.post(
    '/',
    {
      preHandler: [authMiddleware, roleMiddleware([Role.COMPANY]), sanitizationMiddleware],
      schema: {
        description: 'Create a new job offer (Company only)',
        tags: ['Offers'],
        summary: 'Create new offer',
        security: [{ cookieAuth: [] }],
        body: zodToJsonSchema(createOfferSchema),
        response: {
          201: {
            description: 'Offer created successfully',
            type: 'object',
            properties: {
              id: { type: 'string' },
              title: { type: 'string' },
              description: { type: 'string' },
              location: { type: 'string' },
              duration: { type: 'string' },
              skills: { type: 'array', items: { type: 'string' } },
              companyId: { type: 'string' },
              createdAt: { type: 'string', format: 'date-time' }
            }
          },
          400: {
            description: 'Invalid input data',
            type: 'object',
            properties: {
              message: { type: 'string' }
            }
          },
          401: {
            description: 'Not authenticated',
            type: 'object',
            properties: {
              message: { type: 'string' }
            }
          },
          403: {
            description: 'Access denied - Company role required',
            type: 'object',
            properties: {
              message: { type: 'string' }
            }
          }
        }
      },
    },
    createOffer as any
  );

  server.put(
    '/:id',
    {
      preHandler: [authMiddleware, roleMiddleware([Role.COMPANY]), sanitizationMiddleware],
      schema: {
        description: 'Update an existing job offer (Company only)',
        tags: ['Offers'],
        summary: 'Update offer',
        security: [{ cookieAuth: [] }],
        params: {
          type: 'object',
          properties: {
            id: { type: 'string', description: 'Offer ID' }
          },
          required: ['id']
        },
        body: zodToJsonSchema(updateOfferSchema),
        response: {
          200: {
            description: 'Offer updated successfully',
            type: 'object',
            properties: {
              id: { type: 'string' },
              title: { type: 'string' },
              description: { type: 'string' },
              location: { type: 'string' },
              duration: { type: 'string' },
              skills: { type: 'array', items: { type: 'string' } },
              updatedAt: { type: 'string', format: 'date-time' }
            }
          },
          400: {
            description: 'Bad request',
            type: 'object',
            properties: { message: { type: 'string' } }
          },
          401: {
            description: 'Unauthorized',
            type: 'object',
            properties: { message: { type: 'string' } }
          },
          403: {
            description: 'Forbidden',
            type: 'object',
            properties: { message: { type: 'string' } }
          },
          404: {
            description: 'Not found',
            type: 'object',
            properties: { message: { type: 'string' } }
          }
        }
      },
    },
    updateOffer as any
  );

  server.patch(
    '/:id',
    {
      preHandler: [authMiddleware, roleMiddleware([Role.COMPANY]), sanitizationMiddleware],
      schema: {
        description: 'Partially update an existing job offer (Company only)',
        tags: ['Offers'],
        summary: 'Partially update offer',
        security: [{ cookieAuth: [] }],
        params: {
          type: 'object',
          properties: {
            id: { type: 'string', description: 'Offer ID' }
          },
          required: ['id']
        },
        body: zodToJsonSchema(updateOfferSchema),
        response: {
          200: {
            description: 'Offer updated successfully',
            type: 'object',
            properties: {
              id: { type: 'string' },
              title: { type: 'string' },
              description: { type: 'string' },
              location: { type: 'string' },
              duration: { type: 'string' },
              skills: { type: 'array', items: { type: 'string' } },
              updatedAt: { type: 'string', format: 'date-time' }
            }
          },
          400: {
            description: 'Bad request',
            type: 'object',
            properties: { message: { type: 'string' } }
          },
          401: {
            description: 'Unauthorized',
            type: 'object',
            properties: { message: { type: 'string' } }
          },
          403: {
            description: 'Forbidden',
            type: 'object',
            properties: { message: { type: 'string' } }
          },
          404: {
            description: 'Not found',
            type: 'object',
            properties: { message: { type: 'string' } }
          }
        }
      },
    },
    updateOffer as any
  );

  server.delete(
    '/:id',
    {
      preHandler: [authMiddleware, roleMiddleware([Role.COMPANY])],
      schema: {
        description: 'Delete a job offer (Company only)',
        tags: ['Offers'],
        summary: 'Delete offer',
        security: [{ cookieAuth: [] }],
        params: {
          type: 'object',
          properties: {
            id: { type: 'string', description: 'Offer ID' }
          },
          required: ['id']
        },
        response: {
          200: {
            description: 'Offer deleted successfully',
            type: 'object',
            properties: {
              message: { type: 'string' }
            }
          },
          401: {
            description: 'Unauthorized',
            type: 'object',
            properties: { message: { type: 'string' } }
          },
          403: {
            description: 'Forbidden',
            type: 'object',
            properties: { message: { type: 'string' } }
          },
          404: {
            description: 'Not found',
            type: 'object',
            properties: { message: { type: 'string' } }
          }
        }
      },
    },
    deleteOffer as any
  );
}

export default offerRoutes; 