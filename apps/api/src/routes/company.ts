import { FastifyInstance } from 'fastify';
import { getCompaniesWithOffers } from '../controllers/companyController.js';

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
        }
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
}

export default companyRoutes; 