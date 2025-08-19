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
          page: { type: 'integer', minimum: 1, default: 1, example: 1 },
          limit: { type: 'integer', minimum: 1, maximum: 100, default: 10, example: 5 },
          search: { type: 'string', description: 'Search in company names or sectors', example: 'Tech Solutions' },
          sector: { type: 'string', description: 'Filter by company sector', example: 'Software Development' },
          size: { type: 'string', description: 'Filter by company size', example: '100-500 employees' },
          hasOffers: { type: 'boolean', description: 'Filter companies that have active offers', default: true, example: true }
        },
        example: {
          page: 1,
          limit: 5,
          search: 'Global Corp',
          sector: 'Fintech',
          hasOffers: true
        }
      },
      response: {
        200: {
          description: 'List of companies with their offers',
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string', example: 'clp_company_id_1' },
              name: { type: 'string', example: 'Innovate Corp' },
              size: { type: 'string', example: '500-1000 employees' },
              sector: { type: 'string', example: 'Technology' },
              contactEmail: { type: 'string', format: 'email', example: 'info@innovatecorp.com' },
              offers: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    id: { type: 'string', example: 'clp_offer_id_1' },
                    title: { type: 'string', example: 'Lead Software Engineer' },
                    description: { type: 'string', example: 'Develop cutting-edge software solutions.' },
                    location: { type: 'string', example: 'Remote' },
                    duration: { type: 'string', example: 'Full-time' },
                    skills: { type: 'array', items: { type: 'string' }, example: ['Node.js', 'AWS', 'Microservices'] },
                    createdAt: { type: 'string', format: 'date-time', example: '2024-03-01T09:00:00Z' }
                  },
                  example: {
                    id: 'clp_offer_id_1',
                    title: 'Lead Software Engineer',
                    description: 'Develop cutting-edge software solutions.',
                    location: 'Remote',
                    duration: 'Full-time',
                    skills: ['Node.js', 'AWS', 'Microservices'],
                    createdAt: '2024-03-01T09:00:00Z'
                  }
                },
                example: [
                  {
                    id: 'clp_offer_id_1',
                    title: 'Lead Software Engineer',
                    description: 'Develop cutting-edge software solutions.',
                    location: 'Remote',
                    duration: 'Full-time',
                    skills: ['Node.js', 'AWS', 'Microservices'],
                    createdAt: '2024-03-01T09:00:00Z'
                  },
                  {
                    id: 'clp_offer_id_2',
                    title: 'Data Scientist Internship',
                    description: 'Work on data analysis and machine learning models.',
                    location: 'Paris, France',
                    duration: '6 months',
                    skills: ['Python', 'R', 'TensorFlow'],
                    createdAt: '2024-03-05T10:00:00Z'
                  }
                ]
              },
              user: {
                type: 'object',
                properties: {
                  createdAt: { type: 'string', format: 'date-time', example: '2023-10-01T08:00:00Z' }
                },
                example: {
                  createdAt: '2023-10-01T08:00:00Z'
                }
              },
              _count: {
                type: 'object',
                properties: {
                  offers: { type: 'integer', description: 'Total number of active offers', example: 25 }
                },
                example: { offers: 25 }
              }
            },
            example: {
              id: 'clp_company_id_1',
              name: 'Innovate Corp',
              size: '500-1000 employees',
              sector: 'Technology',
              contactEmail: 'info@innovatecorp.com',
              offers: [
                {
                  id: 'clp_offer_id_1',
                  title: 'Lead Software Engineer',
                  description: 'Develop cutting-edge software solutions.',
                  location: 'Remote',
                  duration: 'Full-time',
                  skills: ['Node.js', 'AWS', 'Microservices'],
                  createdAt: '2024-03-01T09:00:00Z'
                },
                {
                  id: 'clp_offer_id_2',
                  title: 'Data Scientist Internship',
                  description: 'Work on data analysis and machine learning models.',
                  location: 'Paris, France',
                  duration: '6 months',
                  skills: ['Python', 'R', 'TensorFlow'],
                  createdAt: '2024-03-05T10:00:00Z'
                }
              ],
              user: {
                createdAt: '2023-10-01T08:00:00Z'
              },
              _count: {
                offers: 25
              }
            }
          },
          example: [
            {
              id: 'clp_company_id_1',
              name: 'Innovate Corp',
              size: '500-1000 employees',
              sector: 'Technology',
              contactEmail: 'info@innovatecorp.com',
              offers: [
                {
                  id: 'clp_offer_id_1',
                  title: 'Lead Software Engineer',
                  description: 'Develop cutting-edge software solutions.',
                  location: 'Remote',
                  duration: 'Full-time',
                  skills: ['Node.js', 'AWS', 'Microservices'],
                  createdAt: '2024-03-01T09:00:00Z'
                }
              ],
              user: {
                createdAt: '2023-10-01T08:00:00Z'
              },
              _count: {
                offers: 25
              }
            }
          ]
        },
        400: {
          description: 'Invalid query parameters',
          type: 'object',
          properties: { message: { type: 'string' } },
          example: { message: 'Invalid limit parameter' }
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
            totalOffers: { type: 'integer', example: 50 },
            totalApplications: { type: 'integer', example: 120 },
            applicationsByStatus: {
              type: 'object',
              additionalProperties: { type: 'integer' },
              example: { NEW: 40, SEEN: 50, INTERVIEW: 20, REJECTED: 8, HIRED: 2 }
            },
            adoptionRequestsSent: { type: 'integer', example: 15 }
          },
          example: {
            totalOffers: 50,
            totalApplications: 120,
            applicationsByStatus: { NEW: 40, SEEN: 50, INTERVIEW: 20, REJECTED: 8, HIRED: 2 },
            adoptionRequestsSent: 15
          }
        },
        401: {
          description: 'Not authenticated',
          type: 'object',
          properties: { message: { type: 'string' } },
          example: { message: 'Unauthorized' }
        },
        403: {
          description: 'Access denied - Company role required',
          type: 'object',
          properties: { message: { type: 'string' } },
          example: { message: 'Forbidden: Only companies can view their own stats' }
        },
        404: {
          description: 'Company profile not found',
          type: 'object',
          properties: { message: { type: 'string' } },
          example: { message: 'Company profile not found for current user' }
        }
      }
    }
  }, getCompanyStats);
}

export default companyRoutes;