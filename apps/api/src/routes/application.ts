import { FastifyInstance } from 'fastify';
import {
  createApplication,
  getMyApplications,
  updateApplicationStatus,
  deleteApplication,
} from '../controllers/applicationController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { roleMiddleware } from '../middleware/roleMiddleware.js';
import { Role } from '@prisma/client';

async function applicationRoutes(server: FastifyInstance) {
  server.post(
    '/',
    {
      preHandler: [authMiddleware, roleMiddleware([Role.STUDENT])],
      schema: {
        description: 'Apply to a job offer (Student only)',
        tags: ['Applications'],
        summary: 'Create job application',
        security: [{ cookieAuth: [] }],
        body: {
          type: 'object',
          required: ['offerId'],
          properties: {
            offerId: {
              type: 'string',
              description: 'ID of the job offer to apply to'
            }
          }
        },
        response: {
          201: {
            description: 'Application created successfully',
            type: 'object',
            properties: {
              id: { type: 'string' },
              offerId: { type: 'string' },
              studentId: { type: 'string' },
              status: { type: 'string', enum: ['NEW', 'SEEN', 'INTERVIEW', 'REJECTED', 'HIRED'] },
              createdAt: { type: 'string', format: 'date-time' }
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
            description: 'Access denied - Student role required',
            type: 'object',
            properties: { message: { type: 'string' } }
          },
          409: {
            description: 'Already applied to this offer',
            type: 'object',
            properties: { message: { type: 'string' } }
          }
        }
      },
    },
    createApplication
  );

  server.get(
    '/my-applications',
    {
      preHandler: [authMiddleware, roleMiddleware([Role.STUDENT])],
      schema: {
        description: 'Get current student\'s job applications',
        tags: ['Applications'],
        summary: 'Get my applications',
        security: [{ cookieAuth: [] }],
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
            description: 'List of student applications',
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
                    offer: {
                      type: 'object',
                      properties: {
                        id: { type: 'string' },
                        title: { type: 'string' },
                        description: { type: 'string' },
                        location: { type: 'string' },
                        duration: { type: 'string', enum: ['INTERNSHIP', 'APPRENTICESHIP', 'FULL_TIME'] },
                        company: {
                          type: 'object',
                          properties: {
                            name: { type: 'string' },
                            sector: { type: 'string' }
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
            description: 'Access denied - Student role required',
            type: 'object',
            properties: { message: { type: 'string' } }
          }
        }
      },
    },
    getMyApplications
  );

  server.patch(
    '/:id/status',
    {
      preHandler: [authMiddleware, roleMiddleware([Role.COMPANY])],
      schema: {
        description: 'Update application status (Company only)',
        tags: ['Applications'],
        summary: 'Update application status',
        security: [{ cookieAuth: [] }],
        params: {
          type: 'object',
          properties: {
            id: { type: 'string', description: 'Application ID' }
          },
          required: ['id']
        },
        body: {
          type: 'object',
          required: ['status'],
          properties: {
            status: {
              type: 'string',
              enum: ['NEW', 'SEEN', 'INTERVIEW', 'REJECTED', 'HIRED'],
              description: 'New application status'
            }
          }
        },
        response: {
          200: {
            description: 'Application status updated successfully',
            type: 'object',
            properties: {
              id: { type: 'string' },
              status: { type: 'string', enum: ['NEW', 'SEEN', 'INTERVIEW', 'REJECTED', 'HIRED'] },
              updatedAt: { type: 'string', format: 'date-time' }
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
            description: 'Access denied - Company role required or not your application',
            type: 'object',
            properties: { message: { type: 'string' } }
          },
          404: {
            description: 'Application not found',
            type: 'object',
            properties: { message: { type: 'string' } }
          }
        }
      },
    },
    updateApplicationStatus as any
  );

  server.delete(
    '/:id',
    {
      preHandler: [authMiddleware, roleMiddleware([Role.STUDENT])],
      schema: {
        description: 'Delete/withdraw job application (Student only)',
        tags: ['Applications'],
        summary: 'Delete application',
        security: [{ cookieAuth: [] }],
        params: {
          type: 'object',
          properties: {
            id: { type: 'string', description: 'Application ID' }
          },
          required: ['id']
        },
        response: {
          200: {
            description: 'Application deleted successfully',
            type: 'object',
            properties: {
              message: { type: 'string' }
            }
          },
          401: {
            description: 'Not authenticated',
            type: 'object',
            properties: { message: { type: 'string' } }
          },
          403: {
            description: 'Access denied - Student role required or not your application',
            type: 'object',
            properties: { message: { type: 'string' } }
          },
          404: {
            description: 'Application not found',
            type: 'object',
            properties: { message: { type: 'string' } }
          }
        }
      },
    },
    deleteApplication as any
  );
}

export default applicationRoutes; 