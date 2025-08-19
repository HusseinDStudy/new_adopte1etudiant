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
              description: 'ID of the student to send adoption request to', example: 'clp_student_id_target'
            },
            message: {
              type: 'string',
              minLength: 10,
              maxLength: 1000,
              description: 'Personal message to the student explaining the opportunity', example: 'We are highly impressed with your profile in React and Node.js. We have an exciting full-stack internship opportunity that we believe would be a great fit for your skills.'
            },
            position: {
              type: 'string',
              description: 'Position or role being offered (optional)', example: 'Full-Stack Developer Intern'
            },
            offerId: {
              type: 'string',
              nullable: true,
              description: 'Optional offer ID to tie the request to a specific offer', example: 'clp_offer_id_optional'
            }
          },
          example: {
            studentId: 'clp_student_id_target',
            message: 'We are highly impressed with your profile in React and Node.js. We have an exciting full-stack internship opportunity that we believe would be a great fit for your skills.',
            position: 'Full-Stack Developer Intern',
            offerId: 'clp_offer_id_optional'
          }
        },
        response: {
          201: {
            description: 'Adoption request created successfully',
            type: 'object',
            properties: {
              id: { type: 'string', example: 'clp_new_adoption_request_id' },
              studentId: { type: 'string', example: 'clp_student_id_target' },
              companyId: { type: 'string', example: 'clp_company_id_sender' },
              offerId: { type: ['string', 'null'], example: 'clp_offer_id_optional' },
              message: { type: 'string', example: 'We are highly impressed with your profile in React and Node.js...' },
              position: { type: 'string', example: 'Full-Stack Developer Intern' },
              status: { type: 'string', enum: ['PENDING', 'ACCEPTED', 'REJECTED'], example: 'PENDING' },
              createdAt: { type: 'string', format: 'date-time', example: '2024-03-22T09:00:00Z' }
            },
            example: {
              id: 'clp_new_adoption_request_id',
              studentId: 'clp_student_id_target',
              companyId: 'clp_company_id_sender',
              offerId: 'clp_offer_id_optional',
              message: 'We are highly impressed with your profile in React and Node.js...',
              position: 'Full-Stack Developer Intern',
              status: 'PENDING',
              createdAt: '2024-03-22T09:00:00Z'
            }
          },
          400: {
            description: 'Invalid input data',
            type: 'object',
            properties: { message: { type: 'string' } },
            example: { message: 'Invalid student ID or message is too short' }
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
            example: { message: 'Forbidden: Only companies can create adoption requests' }
          },
          404: {
            description: 'Student not found',
            type: 'object',
            properties: { message: { type: 'string' } },
            example: { message: 'Student with ID clp_student_id_target not found' }
          },
          409: {
            description: 'Adoption request already exists for this student',
            type: 'object',
            properties: { message: { type: 'string' } },
            example: { message: 'An adoption request already exists for this student' }
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
            page: { type: 'integer', minimum: 1, default: 1, example: 1 },
            limit: { type: 'integer', minimum: 1, maximum: 100, default: 10, example: 5 },
            status: {
              type: 'string',
              enum: ['PENDING', 'ACCEPTED', 'REJECTED'],
              description: 'Filter by request status', example: 'PENDING'
            }
          },
          example: {
            page: 1,
            limit: 5,
            status: 'PENDING'
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
                    id: { type: 'string', example: 'clp_sent_req_id_1' },
                    studentId: { type: 'string', example: 'clp_student_id_target' },
                    companyId: { type: 'string', example: 'clp_company_id_sender' },
                    offerId: { type: ['string', 'null'], example: 'clp_offer_id_optional' },
                    status: { type: 'string', enum: ['PENDING', 'ACCEPTED', 'REJECTED'], example: 'PENDING' },
                    conversationId: { type: ['string', 'null'], example: 'clp_conv_id_for_req' },
                    student: {
                      type: 'object',
                      properties: {
                        id: { type: 'string', example: 'clp_student_profile_id_target' },
                        firstName: { type: 'string', example: 'Student' },
                        lastName: { type: 'string', example: 'User' },
                        school: { type: ['string', 'null'], example: 'University of Tech' },
                        degree: { type: ['string', 'null'], example: 'Computer Science' },
                        isOpenToOpportunities: { type: 'boolean', example: true },
                        cvUrl: { type: ['string', 'null'], example: 'https://example.com/student_cv.pdf' },
                        isCvPublic: { type: 'boolean', example: true },
                        skills: {
                          type: 'array',
                          items: { type: 'string' },
                          example: ['Java', 'Spring']
                        }
                      },
                      example: {
                        id: 'clp_student_profile_id_target',
                        firstName: 'Student',
                        lastName: 'User',
                        school: 'University of Tech',
                        degree: 'Computer Science',
                        isOpenToOpportunities: true,
                        cvUrl: 'https://example.com/student_cv.pdf',
                        isCvPublic: true,
                        skills: ['Java', 'Spring']
                      }
                    },
                    conversation: {
                      type: 'object',
                      properties: {
                        id: { type: 'string', example: 'clp_conv_id_for_req' }
                      },
                      example: { id: 'clp_conv_id_for_req' }
                    },
                    createdAt: { type: 'string', format: 'date-time', example: '2024-03-22T09:00:00Z' },
                    updatedAt: { type: 'string', format: 'date-time', example: '2024-03-22T09:00:00Z' }
                  },
                  example: {
                    id: 'clp_sent_req_id_1',
                    studentId: 'clp_student_id_target',
                    companyId: 'clp_company_id_sender',
                    offerId: 'clp_offer_id_optional',
                    status: 'PENDING',
                    conversationId: 'clp_conv_id_for_req',
                    student: {
                      id: 'clp_student_profile_id_target',
                      firstName: 'Student',
                      lastName: 'User',
                      school: 'University of Tech',
                      degree: 'Computer Science',
                      isOpenToOpportunities: true,
                      cvUrl: 'https://example.com/student_cv.pdf',
                      isCvPublic: true,
                      skills: ['Java', 'Spring']
                    },
                    conversation: {
                      id: 'clp_conv_id_for_req'
                    },
                    createdAt: '2024-03-22T09:00:00Z',
                    updatedAt: '2024-03-22T09:00:00Z'
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
              requests: [
                {
                  id: 'clp_sent_req_id_1',
                  studentId: 'clp_student_id_target',
                  companyId: 'clp_company_id_sender',
                  offerId: 'clp_offer_id_optional',
                  status: 'PENDING',
                  conversationId: 'clp_conv_id_for_req',
                  student: {
                    id: 'clp_student_profile_id_target',
                    firstName: 'Student',
                    lastName: 'User',
                    school: 'University of Tech',
                    degree: 'Computer Science',
                    isOpenToOpportunities: true,
                    cvUrl: 'https://example.com/student_cv.pdf',
                    isCvPublic: true,
                    skills: ['Java', 'Spring']
                  },
                  conversation: {
                    id: 'clp_conv_id_for_req'
                  },
                  createdAt: '2024-03-22T09:00:00Z',
                  updatedAt: '2024-03-22T09:00:00Z'
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
            description: 'Access denied - Company role required',
            type: 'object',
            properties: { message: { type: 'string' } },
            example: { message: 'Forbidden: Only companies can view sent adoption requests' }
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
            page: { type: 'integer', minimum: 1, default: 1, example: 1 },
            limit: { type: 'integer', minimum: 1, maximum: 100, default: 10, example: 5 },
            status: {
              type: 'string',
              enum: ['PENDING', 'ACCEPTED', 'REJECTED'],
              description: 'Filter by request status', example: 'PENDING'
            }
          },
          example: {
            page: 1,
            limit: 5,
            status: 'PENDING'
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
                    id: { type: 'string', example: 'clp_received_req_id_1' },
                    studentId: { type: 'string', example: 'clp_student_id_recipient' },
                    companyId: { type: 'string', example: 'clp_company_id_sender' },
                    status: { type: 'string', enum: ['PENDING', 'ACCEPTED', 'REJECTED'], example: 'PENDING' },
                    conversationId: { type: ['string', 'null'], example: 'clp_conv_id_for_received_req' },
                    company: {
                      type: 'object',
                      properties: {
                        name: { type: 'string', example: 'Global Innovations' },
                        logoUrl: { type: ['string', 'null'], example: 'https://example.com/global_logo.png' },
                        sector: { type: ['string', 'null'], example: 'Fintech' },
                        size: { type: ['string', 'null'], example: '100-500 employees' },
                        contactEmail: { type: 'string', format: 'email', example: 'contact@global.com' }
                      },
                      example: {
                        name: 'Global Innovations',
                        logoUrl: 'https://example.com/global_logo.png',
                        sector: 'Fintech',
                        size: '100-500 employees',
                        contactEmail: 'contact@global.com'
                      }
                    },
                    conversation: {
                      type: 'object',
                      properties: {
                        id: { type: 'string', example: 'clp_conv_id_for_received_req' },
                        createdAt: { type: 'string', format: 'date-time', example: '2024-03-22T09:00:00Z' },
                        updatedAt: { type: 'string', format: 'date-time', example: '2024-03-22T09:00:00Z' },
                        messages: {
                          type: 'array',
                          items: {
                            type: 'object',
                            properties: {
                              id: { type: 'string', example: 'clp_msg_id_req_conv_1' },
                              content: { type: 'string', example: 'Hello Student, we are interested in your profile.' },
                              senderId: { type: 'string', example: 'clp_company_user_id_sender' },
                              createdAt: { type: 'string', format: 'date-time', example: '2024-03-22T09:00:00Z' }
                            },
                            example: {
                              id: 'clp_msg_id_req_conv_1',
                              content: 'Hello Student, we are interested in your profile.',
                              senderId: 'clp_company_user_id_sender',
                              createdAt: '2024-03-22T09:00:00Z'
                            }
                          },
                          example: [
                            {
                              id: 'clp_msg_id_req_conv_1',
                              content: 'Hello Student, we are interested in your profile.',
                              senderId: 'clp_company_user_id_sender',
                              createdAt: '2024-03-22T09:00:00Z'
                            }
                          ]
                        }
                      },
                      example: {
                        id: 'clp_conv_id_for_received_req',
                        createdAt: '2024-03-22T09:00:00Z',
                        updatedAt: '2024-03-22T09:00:00Z',
                        messages: [
                          {
                            id: 'clp_msg_id_req_conv_1',
                            content: 'Hello Student, we are interested in your profile.',
                            senderId: 'clp_company_user_id_sender',
                            createdAt: '2024-03-22T09:00:00Z'
                          }
                        ]
                      }
                    },
                    createdAt: { type: 'string', format: 'date-time', example: '2024-03-22T09:00:00Z' },
                    updatedAt: { type: 'string', format: 'date-time', example: '2024-03-22T09:00:00Z' }
                  },
                  example: {
                    id: 'clp_received_req_id_1',
                    studentId: 'clp_student_id_recipient',
                    companyId: 'clp_company_id_sender',
                    status: 'PENDING',
                    conversationId: 'clp_conv_id_for_received_req',
                    company: {
                      name: 'Global Innovations',
                      logoUrl: 'https://example.com/global_logo.png',
                      sector: 'Fintech',
                      size: '100-500 employees',
                      contactEmail: 'contact@global.com'
                    },
                    conversation: {
                      id: 'clp_conv_id_for_received_req',
                      createdAt: '2024-03-22T09:00:00Z',
                      updatedAt: '2024-03-22T09:00:00Z',
                      messages: [
                        {
                          id: 'clp_msg_id_req_conv_1',
                          content: 'Hello Student, we are interested in your profile.',
                          senderId: 'clp_company_user_id_sender',
                          createdAt: '2024-03-22T09:00:00Z'
                        }
                      ]
                    },
                    createdAt: '2024-03-22T09:00:00Z',
                    updatedAt: '2024-03-22T09:00:00Z'
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
              requests: [
                {
                  id: 'clp_received_req_id_1',
                  studentId: 'clp_student_id_recipient',
                  companyId: 'clp_company_id_sender',
                  status: 'PENDING',
                  conversationId: 'clp_conv_id_for_received_req',
                  company: {
                    name: 'Global Innovations',
                    logoUrl: 'https://example.com/global_logo.png',
                    sector: 'Fintech',
                    size: '100-500 employees',
                    contactEmail: 'contact@global.com'
                  },
                  conversation: {
                    id: 'clp_conv_id_for_received_req',
                    createdAt: '2024-03-22T09:00:00Z',
                    updatedAt: '2024-03-22T09:00:00Z',
                    messages: [
                      {
                        id: 'clp_msg_id_req_conv_1',
                        content: 'Hello Student, we are interested in your profile.',
                        senderId: 'clp_company_user_id_sender',
                        createdAt: '2024-03-22T09:00:00Z'
                      }
                    ]
                  },
                  createdAt: '2024-03-22T09:00:00Z',
                  updatedAt: '2024-03-22T09:00:00Z'
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
            example: { message: 'Forbidden: Only students can view received adoption requests' }
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
            id: { type: 'string', description: 'Adoption request ID', example: 'clp_adoption_req_id_to_update' }
          },
          required: ['id'],
          example: { id: 'clp_adoption_req_id_to_update' }
        },
        body: {
          type: 'object',
          required: ['status'],
          properties: {
            status: {
              type: 'string',
              enum: ['ACCEPTED', 'REJECTED'],
              description: 'New status for the adoption request', example: 'ACCEPTED'
            }
          },
          example: { status: 'ACCEPTED' }
        },
        response: {
          200: {
            description: 'Adoption request status updated successfully',
            type: 'object',
            properties: {
              id: { type: 'string', example: 'clp_adoption_req_id_to_update' },
              status: { type: 'string', enum: ['PENDING', 'ACCEPTED', 'REJECTED'], example: 'ACCEPTED' },
              updatedAt: { type: 'string', format: 'date-time', example: '2024-03-25T10:00:00Z' }
            },
            example: {
              id: 'clp_adoption_req_id_to_update',
              status: 'ACCEPTED',
              updatedAt: '2024-03-25T10:00:00Z'
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
            description: 'Access denied - Student role required or not your request',
            type: 'object',
            properties: { message: { type: 'string' } },
            example: { message: 'Forbidden: You do not own this request or are not a student' }
          },
          404: {
            description: 'Adoption request not found',
            type: 'object',
            properties: { message: { type: 'string' } },
            example: { message: 'Adoption request with ID clp_adoption_req_id_to_update not found' }
          }
        }
      },
    },
    updateAdoptionRequestStatus as any
  )
}

export default adoptionRequestRoutes; 