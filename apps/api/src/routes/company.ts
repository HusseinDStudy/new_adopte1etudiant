import { FastifyInstance } from 'fastify';
import { getCompaniesWithOffers, getCompanyStats } from '../controllers/companyController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { roleMiddleware } from '../middleware/roleMiddleware.js';
import { Role } from '@prisma/client';

async function companyRoutes(server: FastifyInstance) {
  server.get('/', {
    schema: {
      description: 'Get list of companies with their active job offers. Public endpoint accessible to all users.',
      tags: ['Companies'],
      summary: 'List companies with offers',
      querystring: {
        type: 'object',
        properties: {
          page: { type: 'integer', minimum: 1, default: 1 },
          limit: { type: 'integer', minimum: 1, maximum: 100, default: 10 },
          search: { type: 'string', description: 'Search in company names or sectors' },
          sector: { type: 'string', description: 'Filter by company sector' },
          size: { type: 'string', description: 'Filter by company size' },
          hasOffers: { type: 'boolean', description: 'Filter companies that have active offers', default: true }
        },
      },
      response: {
        200: {
          description: 'List of companies with their offers',
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              name: { type: 'string' },
              size: { type: 'string' },
              sector: { type: 'string' },
              contactEmail: { type: 'string', format: 'email' },
              offers: {
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
                    createdAt: { type: 'string', format: 'date-time' }
                  }
                }
              },
              user: {
                type: 'object',
                properties: {
                  createdAt: { type: 'string', format: 'date-time' }
                }
              },
              _count: {
                type: 'object',
                properties: {
                  offers: { type: 'integer', description: 'Total number of active offers' }
                }
              }
            }
          }
        },
        400: {
          description: 'Invalid query parameters',
          type: 'object',
          properties: { message: { type: 'string' } }
        }
      }
    }
  }, getCompaniesWithOffers);

  // Company stats endpoint
  server.get('/stats', {
    preHandler: [authMiddleware, roleMiddleware([Role.COMPANY])],
    schema: {
      description: 'Get company statistics including offers, applications, and adoption requests',
      tags: ['Companies'],
      summary: 'Get company stats',
      security: [{ cookieAuth: [] }],
      response: {
        200: {
          description: 'Company statistics',
          type: 'object',
          properties: {
            totalOffers: { type: 'integer' },
            totalApplications: { type: 'integer' },
            applicationsByStatus: {
              type: 'object',
              additionalProperties: { type: 'integer' }
            },
            adoptionRequestsSent: { type: 'integer' }
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
        },
        404: {
          description: 'Company profile not found',
          type: 'object',
          properties: { message: { type: 'string' } }
        }
      }
    }
  }, getCompanyStats);
}

export default companyRoutes;