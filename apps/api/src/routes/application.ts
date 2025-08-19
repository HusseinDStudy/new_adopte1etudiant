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
              description: 'ID of the job offer to apply to', example: 'clp9876543210fedcba'
            }
          },
          example: { offerId: 'clp9876543210fedcba' }
        },
        response: {
          201: {
            description: 'Application created successfully',
            type: 'object',
            properties: {
              id: { type: 'string', example: 'clp_new_application_id' },
              offerId: { type: 'string', example: 'clp9876543210fedcba' },
              studentId: { type: 'string', example: 'clp1234567890abcdef' },
              status: { type: 'string', enum: ['NEW', 'SEEN', 'INTERVIEW', 'REJECTED', 'HIRED'], example: 'NEW' },
              createdAt: { type: 'string', format: 'date-time', example: '2024-03-10T09:00:00Z' }
            },
            example: {
              id: 'clp_new_application_id',
              offerId: 'clp9876543210fedcba',
              studentId: 'clp1234567890abcdef',
              status: 'NEW',
              createdAt: '2024-03-10T09:00:00Z'
            }
          },
          400: {
            description: 'Invalid input data',
            type: 'object',
            properties: { message: { type: 'string' } },
            example: { message: 'Invalid offer ID' }
          },
          401: {
            description: 'Not authenticated',
            type: 'object',
            properties: { message: { type: 'string' } },
            example: { message: 'Unauthorized' }
          },
          403: {
            description: 'Access denied - Student role required',
            type: 'object',
            properties: { message: { type: 'string' } },
            example: { message: 'Forbidden: Only students can apply to offers' }
          },
          409: {
            description: 'Already applied to this offer',
            type: 'object',
            properties: { message: { type: 'string' } },
            example: { message: 'Student has already applied to this offer' }
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
            page: { type: 'integer', minimum: 1, default: 1, example: 1 },
            limit: { type: 'integer', minimum: 1, maximum: 100, default: 10, example: 5 },
            status: {
              type: 'string',
              enum: ['NEW', 'SEEN', 'INTERVIEW', 'REJECTED', 'HIRED'],
              description: 'Filter by application status', example: 'NEW'
            }
          },
          example: {
            page: 1,
            limit: 5,
            status: 'NEW'
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
                    id: { type: 'string', example: 'clp_my_app_id' },
                    studentId: { type: 'string', example: 'clp1234567890abcdef' },
                    offerId: { type: 'string', example: 'clp9876543210fedcba' },
                    status: { type: 'string', enum: ['NEW', 'SEEN', 'INTERVIEW', 'REJECTED', 'HIRED'], example: 'NEW' },
                    offer: {
                      type: 'object',
                      properties: {
                        id: { type: 'string', example: 'clp9876543210fedcba_offer' },
                        title: { type: 'string', example: 'Frontend Developer Internship' },
                        description: { type: 'string', example: 'Develop user interfaces with modern React.' },
                        location: { type: 'string', example: 'San Francisco, CA' },
                        duration: { type: 'string', enum: ['INTERNSHIP', 'APPRENTICESHIP', 'FULL_TIME'], example: 'INTERNSHIP' },
                        company: {
                          type: 'object',
                          properties: {
                            name: { type: 'string', example: 'InnovateTech' },
                            sector: { type: 'string', example: 'Technology' }
                          },
                          example: {
                            name: 'InnovateTech',
                            sector: 'Technology'
                          }
                        }
                      },
                      example: {
                        id: 'clp9876543210fedcba_offer',
                        title: 'Frontend Developer Internship',
                        description: 'Develop user interfaces with modern React.',
                        location: 'San Francisco, CA',
                        duration: 'INTERNSHIP',
                        company: {
                          name: 'InnovateTech',
                          sector: 'Technology'
                        }
                      }
                    },
                    createdAt: { type: 'string', format: 'date-time', example: '2024-03-10T09:00:00Z' },
                    updatedAt: { type: 'string', format: 'date-time', example: '2024-03-12T10:00:00Z' }
                  },
                  example: {
                    id: 'clp_my_app_id',
                    studentId: 'clp1234567890abcdef',
                    offerId: 'clp9876543210fedcba',
                    status: 'NEW',
                    offer: {
                      id: 'clp9876543210fedcba_offer',
                      title: 'Frontend Developer Internship',
                      description: 'Develop user interfaces with modern React.',
                      location: 'San Francisco, CA',
                      duration: 'INTERNSHIP',
                      company: {
                        name: 'InnovateTech',
                        sector: 'Technology'
                      }
                    },
                    createdAt: '2024-03-10T09:00:00Z',
                    updatedAt: '2024-03-12T10:00:00Z'
                  }
                }
              },
              pagination: {
                type: 'object',
                properties: {
                  page: { type: 'integer', example: 1 },
                  limit: { type: 'integer', example: 5 },
                  total: { type: 'integer', example: 10 },
                  totalPages: { type: 'integer', example: 2 }
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
              applications: [
                {
                  id: 'clp_my_app_id',
                  studentId: 'clp1234567890abcdef',
                  offerId: 'clp9876543210fedcba',
                  status: 'NEW',
                  offer: {
                    id: 'clp9876543210fedcba_offer',
                    title: 'Frontend Developer Internship',
                    description: 'Develop user interfaces with modern React.',
                    location: 'San Francisco, CA',
                    duration: 'INTERNSHIP',
                    company: {
                      name: 'InnovateTech',
                      sector: 'Technology'
                    }
                  },
                  createdAt: '2024-03-10T09:00:00Z',
                  updatedAt: '2024-03-12T10:00:00Z'
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
            description: 'Access denied - Student role required',
            type: 'object',
            properties: { message: { type: 'string' } },
            example: { message: 'Forbidden: Only students can view their applications' }
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
            id: { type: 'string', description: 'Application ID', example: 'clp_app_id_to_update' }
          },
          required: ['id'],
          example: { id: 'clp_app_id_to_update' }
        },
        body: {
          type: 'object',
          required: ['status'],
          properties: {
            status: {
              type: 'string',
              enum: ['NEW', 'SEEN', 'INTERVIEW', 'REJECTED', 'HIRED'],
              description: 'New application status', example: 'INTERVIEW'
            }
          },
          example: { status: 'INTERVIEW' }
        },
        response: {
          200: {
            description: 'Application status updated successfully',
            type: 'object',
            properties: {
              id: { type: 'string', example: 'clp_app_id_to_update' },
              status: { type: 'string', enum: ['NEW', 'SEEN', 'INTERVIEW', 'REJECTED', 'HIRED'], example: 'INTERVIEW' },
              updatedAt: { type: 'string', format: 'date-time', example: '2024-03-15T14:30:00Z' }
            },
            example: {
              id: 'clp_app_id_to_update',
              status: 'INTERVIEW',
              updatedAt: '2024-03-15T14:30:00Z'
            }
          },
          400: {
            description: 'Invalid input data',
            type: 'object',
            properties: { message: { type: 'string' } },
            example: { message: 'Invalid status provided' }
          },
          401: {
            description: 'Not authenticated',
            type: 'object',
            properties: { message: { type: 'string' } },
            example: { message: 'Unauthorized' }
          },
          403: {
            description: 'Access denied - Company role required or not your application',
            type: 'object',
            properties: { message: { type: 'string' } },
            example: { message: 'Forbidden: You do not own this application or are not a company' }
          },
          404: {
            description: 'Application not found',
            type: 'object',
            properties: { message: { type: 'string' } },
            example: { message: 'Application with ID clp_app_id_to_update not found' }
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
            id: { type: 'string', description: 'Application ID', example: 'clp_app_id_to_delete' }
          },
          required: ['id'],
          example: { id: 'clp_app_id_to_delete' }
        },
        response: {
          200: {
            description: 'Application deleted successfully',
            type: 'object',
            properties: {
              message: { type: 'string' }
            },
            example: { message: 'Application deleted successfully' }
          },
          401: {
            description: 'Not authenticated',
            type: 'object',
            properties: { message: { type: 'string' } },
            example: { message: 'Unauthorized' }
          },
          403: {
            description: 'Access denied - Student role required or not your application',
            type: 'object',
            properties: { message: { type: 'string' } },
            example: { message: 'Forbidden: You do not own this application or are not a student' }
          },
          404: {
            description: 'Application not found',
            type: 'object',
            properties: { message: { type: 'string' } },
            example: { message: 'Application with ID clp_app_id_to_delete not found' }
          }
        }
      },
    },
    deleteApplication as any
  );
}

export default applicationRoutes; 