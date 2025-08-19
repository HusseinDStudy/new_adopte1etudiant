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
            page: { type: 'integer', minimum: 1, default: 1, example: 1 },
            limit: { type: 'integer', minimum: 1, maximum: 100, default: 9, example: 5 },
            search: { type: 'string', description: 'Search in title and description', example: 'developer' },
            location: { type: 'string', description: 'Filter by location', example: 'Paris' },
            skills: { type: 'string', description: 'Comma-separated list of skills', example: 'JavaScript,React' },
            companyName: { type: 'string', description: 'Filter by company name', example: 'TechCorp' },
            type: { type: 'string', description: 'Filter by offer type (duration)', example: 'Full-time' },
            sortBy: { type: 'string', enum: ['recent', 'relevance', 'location'], description: 'Sort order for offers', example: 'recent' }
          },
          example: {
            page: 1,
            limit: 5,
            search: 'internship',
            location: 'Lyon',
            skills: 'Node.js,Express',
            sortBy: 'relevance'
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
                  id: { type: 'string', example: 'clp9876543210fedcba' },
                  title: { type: 'string', example: 'Full-Stack Developer Internship' },
                  description: { type: 'string', example: 'We are looking for a motivated full-stack developer intern to join our team.' },
                  location: { type: 'string', example: 'Paris, France' },
                  duration: { type: 'string', example: '6 months' },
                  skills: { type: 'array', items: { type: 'string' }, example: ['JavaScript', 'React', 'Node.js', 'PostgreSQL'] },
                  company: {
                    type: 'object',
                    properties: {
                      name: { type: 'string', example: 'TechCorp Solutions' },
                      sector: { type: 'string', example: 'Software Development' }
                    },
                    example: {
                      name: 'TechCorp Solutions',
                      sector: 'Software Development'
                    }
                  },
                  createdAt: { type: 'string', format: 'date-time', example: '2024-01-15T10:30:00Z' },
                  matchScore: { type: 'number', description: 'Match score for students (0-100)', example: 85.5 }
                },
                example: {
                  id: 'clp9876543210fedcba',
                  title: 'Full-Stack Developer Internship',
                  description: 'We are looking for a motivated full-stack developer intern to join our team.',
                  location: 'Paris, France',
                  duration: '6 months',
                  skills: ['JavaScript', 'React', 'Node.js', 'PostgreSQL'],
                  company: {
                    name: 'TechCorp Solutions',
                    sector: 'Software Development'
                  },
                  createdAt: '2024-01-15T10:30:00Z',
                  matchScore: 85.5
                }
              }
            },
            pagination: {
              type: 'object',
              properties: {
                page: { type: 'integer', example: 1 },
                limit: { type: 'integer', example: 5 },
                total: { type: 'integer', example: 25 },
                totalPages: { type: 'integer', example: 5 }
              },
              example: {
                page: 1,
                limit: 5,
                total: 25,
                totalPages: 5
              }
            }
          },
          example: {
            data: [
              {
                id: 'clp9876543210fedcba',
                title: 'Full-Stack Developer Internship',
                description: 'We are looking for a motivated full-stack developer intern to join our team.',
                location: 'Paris, France',
                duration: '6 months',
                skills: ['JavaScript', 'React', 'Node.js', 'PostgreSQL'],
                company: {
                  name: 'TechCorp Solutions',
                  sector: 'Software Development'
                },
                createdAt: '2024-01-15T10:30:00Z',
                matchScore: 85.5
              }
            ],
            pagination: {
              page: 1,
              limit: 5,
              total: 25,
              totalPages: 5
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
          id: { type: 'string', description: 'Offer ID', example: 'clp9876543210fedcba' }
        },
        required: ['id'],
        example: { id: 'clp9876543210fedcba' }
      },
      response: {
        200: {
          description: 'Offer details',
          type: 'object',
          properties: {
            id: { type: 'string', example: 'clp9876543210fedcba' },
            title: { type: 'string', example: 'Full-Stack Developer Internship' },
            description: { type: 'string', example: 'We are looking for a motivated full-stack developer intern to join our team.' },
            location: { type: 'string', example: 'Paris, France' },
            duration: { type: 'string', example: '6 months' },
            skills: { type: 'array', items: { type: 'string' }, example: ['JavaScript', 'React', 'Node.js', 'PostgreSQL'] },
            company: {
              type: 'object',
              properties: {
                id: { type: 'string', example: 'clp1111222233334444' },
                name: { type: 'string', example: 'TechCorp Solutions' },
                sector: { type: 'string', example: 'Software Development' },
                contactEmail: { type: 'string', format: 'email', example: 'contact@techcorp.com' }
              },
              example: {
                id: 'clp1111222233334444',
                name: 'TechCorp Solutions',
                sector: 'Software Development',
                contactEmail: 'contact@techcorp.com'
              }
            },
            createdAt: { type: 'string', format: 'date-time', example: '2024-01-15T10:30:00Z' },
            updatedAt: { type: 'string', format: 'date-time', example: '2024-01-20T14:45:00Z' },
            matchScore: { type: 'number', description: 'Match score for students (0-100)', example: 85.5 }
          },
          example: {
            id: 'clp9876543210fedcba',
            title: 'Full-Stack Developer Internship',
            description: 'We are looking for a motivated full-stack developer intern to join our team.',
            location: 'Paris, France',
            duration: '6 months',
            skills: ['JavaScript', 'React', 'Node.js', 'PostgreSQL'],
            company: {
              id: 'clp1111222233334444',
              name: 'TechCorp Solutions',
              sector: 'Software Development',
              contactEmail: 'contact@techcorp.com'
            },
            createdAt: '2024-01-15T10:30:00Z',
            updatedAt: '2024-01-20T14:45:00Z',
            matchScore: 85.5
          }
        },
        404: {
          description: 'Offer not found',
          type: 'object',
          properties: {
            message: { type: 'string' }
          },
          example: { message: 'Offer with ID clp9876543210fedcba not found' }
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
          },
          example: ['Full-time', 'Part-time', 'Internship', 'Apprenticeship']
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
            page: { type: 'integer', minimum: 1, default: 1, example: 1 },
            limit: { type: 'integer', minimum: 1, maximum: 100, default: 10, example: 5 },
            status: { type: 'string', enum: ['ACTIVE', 'INACTIVE'], description: 'Filter by offer status', example: 'ACTIVE' }
          },
          example: {
            page: 1,
            limit: 5,
            status: 'ACTIVE'
          }
        },
        response: {
          200: {
            description: 'List of company offers',
            type: 'array',
            items: {
                  type: 'object',
                  properties: {
                    id: { type: 'string', example: 'clp9876543210fedcba_myoffer' },
                    title: { type: 'string', example: 'Backend Developer Internship' },
                    description: { type: 'string', example: 'Develop scalable backend services.' },
                    location: { type: 'string', example: 'Remote' },
                    duration: { type: 'string', example: '12 months' },
                    skills: { type: 'array', items: { type: 'string' }, example: ['Node.js', 'TypeScript', 'PostgreSQL'] },
                    _count: {
                      type: 'object',
                      properties: {
                        applications: { type: 'integer', description: 'Number of applications received', example: 15 }
                      },
                      example: { applications: 15 }
                    },
                    createdAt: { type: 'string', format: 'date-time', example: '2024-02-01T09:00:00Z' },
                    updatedAt: { type: 'string', format: 'date-time', example: '2024-02-10T11:00:00Z' }
                  },
                  example: {
                    id: 'clp9876543210fedcba_myoffer',
                    title: 'Backend Developer Internship',
                    description: 'Develop scalable backend services.',
                    location: 'Remote',
                    duration: '12 months',
                    skills: ['Node.js', 'TypeScript', 'PostgreSQL'],
                    _count: {
                      applications: 15
                    },
                    createdAt: '2024-02-01T09:00:00Z',
                    updatedAt: '2024-02-10T11:00:00Z'
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
            example: { message: 'Forbidden: Only companies can access their offers' }
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
            id: { type: 'string', description: 'Offer ID', example: 'clp9876543210fedcba' }
          },
          required: ['id'],
          example: { id: 'clp9876543210fedcba' }
        },
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
            description: 'List of applications for the offer',
            type: 'object',
            properties: {
              applications: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    id: { type: 'string', example: 'clp5555666677778888' },
                    studentId: { type: 'string', example: 'clp1234567890abcdef' },
                    offerId: { type: 'string', example: 'clp9876543210fedcba' },
                    status: { type: 'string', enum: ['NEW', 'SEEN', 'INTERVIEW', 'REJECTED', 'HIRED'], example: 'NEW' },
                    student: {
                      type: 'object',
                      properties: {
                        id: { type: 'string', example: 'clp1234567890abcdef_student_profile' },
                        userId: { type: 'string', description: 'User ID for adoption requests', example: 'clp1234567890abcdef_user' },
                        firstName: { type: 'string', example: 'Student' },
                        lastName: { type: 'string', example: 'User' },
                        school: { type: 'string', example: 'University of Tech' },
                        degree: { type: 'string', example: 'Computer Science' },
                        skills: { type: 'array', items: { type: 'string' }, example: ['JavaScript', 'React'] },
                        cvUrl: { type: 'string', format: 'uri', example: 'https://example.com/cv/student.pdf' },
                        isCvPublic: { type: 'boolean', example: true },
                        isOpenToOpportunities: { type: 'boolean', example: true },
                        user: {
                          type: 'object',
                          properties: {
                            email: { type: 'string', format: 'email', example: 'student@example.com' }
                          },
                          example: {
                            email: 'student@example.com'
                          }
                        }
                      },
                      example: {
                        id: 'clp1234567890abcdef_student_profile',
                        userId: 'clp1234567890abcdef_user',
                        firstName: 'Student',
                        lastName: 'User',
                        school: 'University of Tech',
                        degree: 'Computer Science',
                        skills: ['JavaScript', 'React'],
                        cvUrl: 'https://example.com/cv/student.pdf',
                        isCvPublic: true,
                        isOpenToOpportunities: true,
                        user: {
                          email: 'student@example.com'
                        }
                      }
                    },
                    createdAt: { type: 'string', format: 'date-time', example: '2024-03-01T10:00:00Z' },
                    updatedAt: { type: 'string', format: 'date-time', example: '2024-03-05T11:00:00Z' }
                  },
                  example: {
                    id: 'clp5555666677778888',
                    studentId: 'clp1234567890abcdef',
                    offerId: 'clp9876543210fedcba',
                    status: 'NEW',
                    student: {
                      id: 'clp1234567890abcdef_student_profile',
                      userId: 'clp1234567890abcdef_user',
                      firstName: 'Student',
                      lastName: 'User',
                      school: 'University of Tech',
                      degree: 'Computer Science',
                      skills: ['JavaScript', 'React'],
                      cvUrl: 'https://example.com/cv/student.pdf',
                      isCvPublic: true,
                      isOpenToOpportunities: true,
                      user: {
                        email: 'student@example.com'
                      }
                    },
                    createdAt: '2024-03-01T10:00:00Z',
                    updatedAt: '2024-03-05T11:00:00Z'
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
                  id: 'clp5555666677778888',
                  studentId: 'clp1234567890abcdef',
                  offerId: 'clp9876543210fedcba',
                  status: 'NEW',
                  student: {
                    id: 'clp1234567890abcdef_student_profile',
                    userId: 'clp1234567890abcdef_user',
                    firstName: 'Student',
                    lastName: 'User',
                    school: 'University of Tech',
                    degree: 'Computer Science',
                    skills: ['JavaScript', 'React'],
                    cvUrl: 'https://example.com/cv/student.pdf',
                    isCvPublic: true,
                    isOpenToOpportunities: true,
                    user: {
                      email: 'student@example.com'
                    }
                  },
                  createdAt: '2024-03-01T10:00:00Z',
                  updatedAt: '2024-03-05T11:00:00Z'
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
            description: 'Access denied - Company role required or not your offer',
            type: 'object',
            properties: { message: { type: 'string' } },
            example: { message: 'Forbidden: You do not own this offer or are not a company' }
          },
          404: {
            description: 'Offer not found',
            type: 'object',
            properties: { message: { type: 'string' } },
            example: { message: 'Offer with ID clp9876543210fedcba not found' }
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
        example: {
          title: 'Senior Full-Stack Engineer',
          description: 'We are seeking a talented Senior Full-Stack Engineer to lead our new product development. Must have 5+ years experience in Node.js, React, and cloud platforms.',
          location: 'Berlin, Germany',
          duration: 'Full-time',
          skills: ['Node.js', 'React', 'AWS', 'Microservices', 'TypeScript']
        },
        response: {
          201: {
            description: 'Offer created successfully',
            type: 'object',
            properties: {
              id: { type: 'string', example: 'clp_new_offer_id' },
              title: { type: 'string', example: 'Senior Full-Stack Engineer' },
              description: { type: 'string', example: 'We are seeking a talented Senior Full-Stack Engineer to lead our new product development.' },
              location: { type: 'string', example: 'Berlin, Germany' },
              duration: { type: 'string', example: 'Full-time' },
              skills: { type: 'array', items: { type: 'string' }, example: ['Node.js', 'React'] },
              companyId: { type: 'string', example: 'clp1111222233334444' },
              createdAt: { type: 'string', format: 'date-time', example: '2024-03-08T12:00:00Z' }
            },
            example: {
              id: 'clp_new_offer_id',
              title: 'Senior Full-Stack Engineer',
              description: 'We are seeking a talented Senior Full-Stack Engineer to lead our new product development.',
              location: 'Berlin, Germany',
              duration: 'Full-time',
              skills: ['Node.js', 'React'],
              companyId: 'clp1111222233334444',
              createdAt: '2024-03-08T12:00:00Z'
            }
          },
          400: {
            description: 'Invalid input data',
            type: 'object',
            properties: {
              message: { type: 'string' }
            },
            example: { message: 'Invalid offer data provided' }
          },
          401: {
            description: 'Not authenticated',
            type: 'object',
            properties: {
              message: { type: 'string' }
            },
            example: { message: 'Unauthorized' }
          },
          403: {
            description: 'Access denied - Company role required',
            type: 'object',
            properties: {
              message: { type: 'string' }
            },
            example: { message: 'Forbidden: Only companies can create offers' }
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
            id: { type: 'string', description: 'Offer ID', example: 'clp9876543210fedcba' }
          },
          required: ['id'],
          example: { id: 'clp9876543210fedcba' }
        },
        body: zodToJsonSchema(updateOfferSchema),
        example: {
          title: 'Updated Senior Full-Stack Engineer Role',
          location: 'Remote',
          skills: ['Node.js', 'React', 'Kubernetes']
        },
        response: {
          200: {
            description: 'Offer updated successfully',
            type: 'object',
            properties: {
              id: { type: 'string', example: 'clp9876543210fedcba' },
              title: { type: 'string', example: 'Updated Senior Full-Stack Engineer Role' },
              description: { type: 'string', example: 'We are seeking a talented Senior Full-Stack Engineer to lead our new product development.' },
              location: { type: 'string', example: 'Remote' },
              duration: { type: 'string', example: 'Full-time' },
              skills: { type: 'array', items: { type: 'string' }, example: ['Node.js', 'React', 'Kubernetes'] },
              updatedAt: { type: 'string', format: 'date-time', example: '2024-03-09T10:00:00Z' }
            },
            example: {
              id: 'clp9876543210fedcba',
              title: 'Updated Senior Full-Stack Engineer Role',
              description: 'We are seeking a talented Senior Full-Stack Engineer to lead our new product development.',
              location: 'Remote',
              duration: 'Full-time',
              skills: ['Node.js', 'React', 'Kubernetes'],
              updatedAt: '2024-03-09T10:00:00Z'
            }
          },
          400: {
            description: 'Bad request',
            type: 'object',
            properties: { message: { type: 'string' } },
            example: { message: 'Invalid update data provided' }
          },
          401: {
            description: 'Unauthorized',
            type: 'object',
            properties: { message: { type: 'string' } },
            example: { message: 'Unauthorized' }
          },
          403: {
            description: 'Forbidden',
            type: 'object',
            properties: { message: { type: 'string' } },
            example: { message: 'Forbidden: You do not own this offer' }
          },
          404: {
            description: 'Not found',
            type: 'object',
            properties: { message: { type: 'string' } },
            example: { message: 'Offer with ID clp9876543210fedcba not found' }
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
            id: { type: 'string', description: 'Offer ID', example: 'clp9876543210fedcba' }
          },
          required: ['id'],
          example: { id: 'clp9876543210fedcba' }
        },
        body: zodToJsonSchema(updateOfferSchema),
        example: {
          location: 'Remote',
          skills: ['Node.js', 'Express.js']
        },
        response: {
          200: {
            description: 'Offer updated successfully',
            type: 'object',
            properties: {
              id: { type: 'string', example: 'clp9876543210fedcba' },
              title: { type: 'string', example: 'Senior Full-Stack Engineer' },
              description: { type: 'string', example: 'We are seeking a talented Senior Full-Stack Engineer to lead our new product development.' },
              location: { type: 'string', example: 'Remote' },
              duration: { type: 'string', example: 'Full-time' },
              skills: { type: 'array', items: { type: 'string' }, example: ['Node.js', 'React', 'Express.js'] },
              updatedAt: { type: 'string', format: 'date-time', example: '2024-03-09T11:00:00Z' }
            },
            example: {
              id: 'clp9876543210fedcba',
              title: 'Senior Full-Stack Engineer',
              description: 'We are seeking a talented Senior Full-Stack Engineer to lead our new product development.',
              location: 'Remote',
              duration: 'Full-time',
              skills: ['Node.js', 'React', 'Express.js'],
              updatedAt: '2024-03-09T11:00:00Z'
            }
          },
          400: {
            description: 'Bad request',
            type: 'object',
            properties: { message: { type: 'string' } },
            example: { message: 'Invalid partial update data provided' }
          },
          401: {
            description: 'Unauthorized',
            type: 'object',
            properties: { message: { type: 'string' } },
            example: { message: 'Unauthorized' }
          },
          403: {
            description: 'Forbidden',
            type: 'object',
            properties: { message: { type: 'string' } },
            example: { message: 'Forbidden: You do not own this offer' }
          },
          404: {
            description: 'Not found',
            type: 'object',
            properties: { message: { type: 'string' } },
            example: { message: 'Offer with ID clp9876543210fedcba not found' }
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
            id: { type: 'string', description: 'Offer ID', example: 'clp9876543210fedcba' }
          },
          required: ['id'],
          example: { id: 'clp9876543210fedcba' }
        },
        response: {
          200: {
            description: 'Offer deleted successfully',
            type: 'object',
            properties: {
              message: { type: 'string' }
            },
            example: { message: 'Offer deleted successfully' }
          },
          401: {
            description: 'Unauthorized',
            type: 'object',
            properties: { message: { type: 'string' } },
            example: { message: 'Unauthorized' }
          },
          403: {
            description: 'Forbidden',
            type: 'object',
            properties: { message: { type: 'string' } },
            example: { message: 'Forbidden: You do not own this offer' }
          },
          404: {
            description: 'Not found',
            type: 'object',
            properties: { message: { type: 'string' } },
            example: { message: 'Offer with ID clp9876543210fedcba not found' }
          }
        }
      },
    },
    deleteOffer as any
  );
}

export default offerRoutes; 