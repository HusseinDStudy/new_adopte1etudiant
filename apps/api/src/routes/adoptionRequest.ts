import { FastifyInstance } from 'fastify';
import {
  createAdoptionRequest,
  listMyAdoptionRequests,
  updateAdoptionRequestStatus,
  listSentAdoptionRequests
} from '../controllers/adoptionRequestController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { roleMiddleware } from '../middleware/roleMiddleware.js';
import { sanitizationMiddleware } from '../middleware/sanitizationMiddleware.js';
import { Role } from '@prisma/client';

async function adoptionRequestRoutes(server: FastifyInstance) {
  server.addHook('preHandler', authMiddleware);

  server.post(
    '/',
    {
      preHandler: [roleMiddleware([Role.COMPANY]), sanitizationMiddleware],
      schema: {
        description: 'Create an adoption request to a student (Company only). This is a way for companies to directly reach out to students.',
        tags: ['Adoption Requests'],
        summary: 'Create adoption request',
        security: [{ cookieAuth: [] }],
        body: {
          type: 'object',
          required: ['studentId', 'message'],
          properties: {
            studentId: {
              type: 'string',
              description: 'ID of the student to send adoption request to'
            },
            message: {
              type: 'string',
              minLength: 10,
              maxLength: 1000,
              description: 'Personal message to the student explaining the opportunity'
            },
            position: {
              type: 'string',
              description: 'Position or role being offered (optional)'
            },
            offerId: {
              type: 'string',
              nullable: true,
              description: 'Optional offer ID to tie the request to a specific offer'
            }
          }
        },
        response: {
          201: {
            description: 'Adoption request created successfully',
            type: 'object',
            properties: {
              id: { type: 'string' },
              studentId: { type: 'string' },
              companyId: { type: 'string' },
              offerId: { type: ['string', 'null'] },
              message: { type: 'string' },
              position: { type: 'string' },
              status: { type: 'string', enum: ['PENDING', 'ACCEPTED', 'REJECTED'] },
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
            description: 'Access denied - Company role required',
            type: 'object',
            properties: { message: { type: 'string' } }
          },
          404: {
            description: 'Student not found',
            type: 'object',
            properties: { message: { type: 'string' } }
          },
          409: {
            description: 'Adoption request already exists for this student',
            type: 'object',
            properties: { message: { type: 'string' } }
          }
        }
      },
    },
    createAdoptionRequest as any
  );

  server.get(
    '/sent-requests',
    {
      preHandler: [roleMiddleware([Role.COMPANY])],
      schema: {
        description: 'Get adoption requests sent by the current company',
        tags: ['Adoption Requests'],
        summary: 'Get sent adoption requests',
        security: [{ cookieAuth: [] }],
        querystring: {
          type: 'object',
          properties: {
            page: { type: 'integer', minimum: 1, default: 1 },
            limit: { type: 'integer', minimum: 1, maximum: 100, default: 10 },
            status: {
              type: 'string',
              enum: ['PENDING', 'ACCEPTED', 'REJECTED'],
              description: 'Filter by request status'
            }
          }
        },
        response: {
          200: {
            description: 'List of sent adoption requests',
            type: 'object',
            properties: {
              requests: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    id: { type: 'string' },
                    studentId: { type: 'string' },
                    companyId: { type: 'string' },
                    offerId: { type: ['string', 'null'] },
                    status: { type: 'string', enum: ['PENDING', 'ACCEPTED', 'REJECTED'] },
                    conversationId: { type: ['string', 'null'] },
                    student: {
                      type: 'object',
                      properties: {
                        id: { type: 'string' },
                        firstName: { type: 'string' },
                        lastName: { type: 'string' },
                        school: { type: ['string', 'null'] },
                        degree: { type: ['string', 'null'] },
                        isOpenToOpportunities: { type: 'boolean' },
                        cvUrl: { type: ['string', 'null'] },
                        isCvPublic: { type: 'boolean' },
                        skills: {
                          type: 'array',
                          items: { type: 'string' }
                        }
                      }
                    },
                    conversation: {
                      type: 'object',
                      properties: {
                        id: { type: 'string' }
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
            description: 'Access denied - Company role required',
            type: 'object',
            properties: { message: { type: 'string' } }
          }
        }
      },
    },
    listSentAdoptionRequests
  );

  server.get(
    '/my-requests',
    {
      preHandler: [roleMiddleware([Role.STUDENT])],
      schema: {
        description: 'Get adoption requests received by the current student',
        tags: ['Adoption Requests'],
        summary: 'Get my adoption requests',
        security: [{ cookieAuth: [] }],
        querystring: {
          type: 'object',
          properties: {
            page: { type: 'integer', minimum: 1, default: 1 },
            limit: { type: 'integer', minimum: 1, maximum: 100, default: 10 },
            status: {
              type: 'string',
              enum: ['PENDING', 'ACCEPTED', 'REJECTED'],
              description: 'Filter by request status'
            }
          }
        },
        response: {
          200: {
            description: 'List of received adoption requests',
            type: 'object',
            properties: {
              requests: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    id: { type: 'string' },
                    studentId: { type: 'string' },
                    companyId: { type: 'string' },
                    status: { type: 'string', enum: ['PENDING', 'ACCEPTED', 'REJECTED'] },
                    conversationId: { type: ['string', 'null'] },
                    company: {
                      type: 'object',
                      properties: {
                        name: { type: 'string' },
                        logoUrl: { type: ['string', 'null'] },
                        sector: { type: ['string', 'null'] },
                        size: { type: ['string', 'null'] },
                        contactEmail: { type: 'string', format: 'email' }
                      }
                    },
                    conversation: {
                      type: 'object',
                      properties: {
                        id: { type: 'string' },
                        createdAt: { type: 'string', format: 'date-time' },
                        updatedAt: { type: 'string', format: 'date-time' },
                        messages: {
                          type: 'array',
                          items: {
                            type: 'object',
                            properties: {
                              id: { type: 'string' },
                              content: { type: 'string' },
                              senderId: { type: 'string' },
                              createdAt: { type: 'string', format: 'date-time' }
                            }
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
    listMyAdoptionRequests
  );

  server.patch(
    '/:id/status',
    {
      preHandler: [roleMiddleware([Role.STUDENT])],
      schema: {
        description: 'Update adoption request status (Student only). Students can accept or reject adoption requests.',
        tags: ['Adoption Requests'],
        summary: 'Update adoption request status',
        security: [{ cookieAuth: [] }],
        params: {
          type: 'object',
          properties: {
            id: { type: 'string', description: 'Adoption request ID' }
          },
          required: ['id']
        },
        body: {
          type: 'object',
          required: ['status'],
          properties: {
            status: {
              type: 'string',
              enum: ['ACCEPTED', 'REJECTED'],
              description: 'New status for the adoption request'
            }
          }
        },
        response: {
          200: {
            description: 'Adoption request status updated successfully',
            type: 'object',
            properties: {
              id: { type: 'string' },
              status: { type: 'string', enum: ['PENDING', 'ACCEPTED', 'REJECTED'] },
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
            description: 'Access denied - Student role required or not your request',
            type: 'object',
            properties: { message: { type: 'string' } }
          },
          404: {
            description: 'Adoption request not found',
            type: 'object',
            properties: { message: { type: 'string' } }
          }
        }
      },
    },
    updateAdoptionRequestStatus as any
  )
}

export default adoptionRequestRoutes; 