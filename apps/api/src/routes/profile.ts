import { FastifyInstance } from 'fastify';
import { getProfile, upsertProfile } from '../controllers/profileController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { sanitizationMiddleware } from '../middleware/sanitizationMiddleware.js';
import { studentProfileSchema, companyProfileSchema } from 'shared-types';
import { zodToJsonSchema } from 'zod-to-json-schema';

async function profileRoutes(server: FastifyInstance) {
  server.get(
    '/',
    {
      preHandler: [authMiddleware],
      schema: {
        description: 'Get current user profile information',
        tags: ['Profile'],
        summary: 'Get user profile',
        security: [{ cookieAuth: [] }],
        response: {
          200: {
            description: 'User profile information',
            anyOf: [
              { type: 'null' },
              {
                type: 'object',
                oneOf: [
              {
                type: 'object',
                properties: {
                  id: { type: 'string', example: 'clp1234567890abcdef' },
                  userId: { type: 'string', example: 'clp1234567890abcdef' },
                  role: { type: 'string', enum: ['STUDENT'], example: 'STUDENT' },
                  firstName: { type: 'string', example: 'John' },
                  lastName: { type: 'string', example: 'Doe' },
                  school: { type: ['string', 'null'], example: 'University of Technology' },
                  degree: { type: ['string', 'null'], example: 'Computer Science' },
                  skills: {
                    type: 'array',
                    items: {
                      type: 'string'
                    },
                    example: ['JavaScript', 'React', 'Python']
                  },
                  isOpenToOpportunities: { type: 'boolean', example: true },
                  cvUrl: { type: ['string', 'null'], format: 'uri', example: 'https://example.com/cv/john-doe.pdf' },
                  isCvPublic: { type: 'boolean', example: true },
                  email: { type: 'string', format: 'email', example: 'john.doe@university.edu' },
                  createdAt: { type: 'string', format: 'date-time', example: '2024-01-15T10:30:00Z' },
                  updatedAt: { type: 'string', format: 'date-time', example: '2024-01-20T14:45:00Z' }
                },
                example: {
                  id: 'clp1234567890abcdef',
                  userId: 'clp1234567890abcdef',
                  role: 'STUDENT',
                  firstName: 'John',
                  lastName: 'Doe',
                  school: 'University of Technology',
                  degree: 'Computer Science',
                  skills: ['JavaScript', 'React', 'Python'],
                  isOpenToOpportunities: true,
                  cvUrl: 'https://example.com/cv/john-doe.pdf',
                  isCvPublic: true,
                  email: 'john.doe@university.edu',
                  createdAt: '2024-01-15T10:30:00Z',
                  updatedAt: '2024-01-20T14:45:00Z'
                }
              },
              {
                type: 'object',
                properties: {
                  id: { type: 'string', example: 'clp1111222233334444' },
                  userId: { type: 'string', example: 'clp1111222233334444' },
                  role: { type: 'string', enum: ['COMPANY'], example: 'COMPANY' },
                  name: { type: 'string', example: 'TechCorp Solutions' },
                  size: { type: ['string', 'null'], example: '50-100 employees' },
                  sector: { type: ['string', 'null'], example: 'Software Development' },
                  contactEmail: { type: 'string', format: 'email', example: 'contact@techcorp.com' },
                  logoUrl: { type: ['string', 'null'], format: 'uri', example: 'https://example.com/logo.png' },
                  email: { type: 'string', format: 'email', example: 'hr@techcorp.com' },
                  createdAt: { type: 'string', format: 'date-time', example: '2024-01-15T10:30:00Z' },
                  updatedAt: { type: 'string', format: 'date-time', example: '2024-01-20T14:45:00Z' }
                },
                example: {
                  id: 'clp1111222233334444',
                  userId: 'clp1111222233334444',
                  role: 'COMPANY',
                  name: 'TechCorp Solutions',
                  size: '50-100 employees',
                  sector: 'Software Development',
                  contactEmail: 'contact@techcorp.com',
                  logoUrl: 'https://example.com/logo.png',
                  email: 'hr@techcorp.com',
                  createdAt: '2024-01-15T10:30:00Z',
                  updatedAt: '2024-01-20T14:45:00Z'
                }
              }
            ]
              }
            ]
          },
          401: {
            description: 'Not authenticated',
            type: 'object',
            properties: { message: { type: 'string' } },
            example: { message: 'Unauthorized' }
          },
          404: {
            description: 'Profile not found',
            type: 'object',
            properties: { message: { type: 'string' } },
            example: { message: 'Profile not found for current user' }
          }
        }
      },
    },
    getProfile
  );

  server.post(
    '/',
    {
      preHandler: [authMiddleware, sanitizationMiddleware],
      schema: {
        description: 'Create or update user profile. The request body structure depends on user role (STUDENT or COMPANY)',
        tags: ['Profile'],
        summary: 'Create/update profile',
        security: [{ cookieAuth: [] }],
        body: {
          type: 'object',
          oneOf: [
            {
              type: 'object',
              properties: {
                firstName: { type: 'string', minLength: 1, example: 'Jane' },
                lastName: { type: 'string', minLength: 1, example: 'Doe' },
                school: { type: 'string', example: 'ENS Paris' },
                degree: { type: 'string', example: 'Data Science' },
                skills: { type: 'array', items: { type: 'string' }, example: ['Python', 'SQL', 'Machine Learning'] },
                isOpenToOpportunities: { type: 'boolean', example: true },
                cvUrl: {
                  anyOf: [
                    { type: 'string', format: 'uri', example: 'https://example.com/cv/jane-doe.pdf' },
                    { type: 'string', maxLength: 0 }
                  ]
                },
                isCvPublic: { type: 'boolean', example: true }
              },
              required: ['firstName', 'lastName'],
              description: 'Student profile data',
              example: {
                firstName: 'Jane',
                lastName: 'Doe',
                school: 'ENS Paris',
                degree: 'Data Science',
                skills: ['Python', 'SQL', 'Machine Learning'],
                isOpenToOpportunities: true,
                cvUrl: 'https://example.com/cv/jane-doe.pdf',
                isCvPublic: true
              }
            },
            {
              type: 'object',
              properties: {
                name: { type: 'string', minLength: 1, example: 'Global Innovations Inc.' },
                size: { type: 'string', example: '1000+ employees' },
                sector: { type: 'string', example: 'Fintech' },
                contactEmail: { type: 'string', format: 'email', example: 'hr@globalinnovations.com' },
                logoUrl: { type: ['string', 'null'], format: 'uri', example: 'https://example.com/global-logo.png' }
              },
              required: ['name', 'contactEmail'],
              description: 'Company profile data',
              example: {
                name: 'Global Innovations Inc.',
                size: '1000+ employees',
                sector: 'Fintech',
                contactEmail: 'hr@globalinnovations.com',
                logoUrl: 'https://example.com/global-logo.png'
              }
            }
          ]
        },
        response: {
          200: {
            description: 'Profile created/updated successfully',
            type: 'object',
            oneOf: [
              {
                type: 'object',
                properties: {
                  id: { type: 'string', example: 'clp1234567890abcde_student' },
                  userId: { type: 'string', example: 'clp1234567890abcde_user' },
                  role: { type: 'string', enum: ['STUDENT'], example: 'STUDENT' },
                  firstName: { type: 'string', example: 'Jane' },
                  lastName: { type: 'string', example: 'Doe' },
                  school: { type: ['string', 'null'], example: 'ENS Paris' },
                  degree: { type: ['string', 'null'], example: 'Data Science' },
                  skills: {
                    type: 'array',
                    items: { type: 'string' },
                    example: ['Python', 'SQL', 'Machine Learning']
                  },
                  isOpenToOpportunities: { type: 'boolean', example: true },
                  isCvPublic: { type: 'boolean', example: true },
                  cvUrl: { type: ['string', 'null'], format: 'uri', example: 'https://example.com/cv/jane-doe.pdf' },
                  email: { type: 'string', format: 'email', example: 'jane.doe@university.edu' }
                },
                description: 'Student profile',
                example: {
                  id: 'clp1234567890abcde_student',
                  userId: 'clp1234567890abcde_user',
                  role: 'STUDENT',
                  firstName: 'Jane',
                  lastName: 'Doe',
                  school: 'ENS Paris',
                  degree: 'Data Science',
                  skills: ['Python', 'SQL', 'Machine Learning'],
                  isOpenToOpportunities: true,
                  isCvPublic: true,
                  cvUrl: 'https://example.com/cv/jane-doe.pdf',
                  email: 'jane.doe@university.edu'
                }
              },
              {
                type: 'object',
                properties: {
                  id: { type: 'string', example: 'clp1111222233334444_company' },
                  userId: { type: 'string', example: 'clp1111222233334444_user' },
                  role: { type: 'string', enum: ['COMPANY'], example: 'COMPANY' },
                  name: { type: 'string', example: 'Global Innovations Inc.' },
                  size: { type: 'string', example: '1000+ employees' },
                  sector: { type: 'string', example: 'Fintech' },
                  contactEmail: { type: 'string', format: 'email', example: 'hr@globalinnovations.com' },
                  logoUrl: { type: ['string', 'null'], format: 'uri', example: 'https://example.com/global-logo.png' },
                  email: { type: 'string', format: 'email', example: 'hr@globalinnovations.com' }
                },
                description: 'Company profile',
                example: {
                  id: 'clp1111222233334444_company',
                  userId: 'clp1111222233334444_user',
                  role: 'COMPANY',
                  name: 'Global Innovations Inc.',
                  size: '1000+ employees',
                  sector: 'Fintech',
                  contactEmail: 'hr@globalinnovations.com',
                  logoUrl: 'https://example.com/global-logo.png',
                  email: 'hr@globalinnovations.com'
                }
              }
            ]
          },
          400: {
            description: 'Invalid input data',
            type: 'object',
            properties: { message: { type: 'string' } },
            example: { message: 'Invalid profile data provided' }
          },
          401: {
            description: 'Not authenticated',
            type: 'object',
            properties: { message: { type: 'string' } },
            example: { message: 'Unauthorized' }
          }
        }
      },
    },
    upsertProfile as any
  );

  server.patch(
    '/',
    {
      preHandler: [authMiddleware, sanitizationMiddleware],
      schema: {
        description: 'Partially update user profile. The request body structure depends on user role (STUDENT or COMPANY)',
        tags: ['Profile'],
        summary: 'Update profile (partial)',
        security: [{ cookieAuth: [] }],
        body: {
          type: 'object',
          oneOf: [
            {
              type: 'object',
              properties: {
                firstName: { type: 'string', minLength: 1, example: 'Jane' },
                lastName: { type: 'string', minLength: 1, example: 'Doe' },
                school: { type: 'string', example: 'ENS Paris' },
                degree: { type: 'string', example: 'Data Science' },
                skills: { type: 'array', items: { type: 'string' }, example: ['Python', 'SQL'] },
                isOpenToOpportunities: { type: 'boolean', example: false },
                cvUrl: { type: 'string', format: 'uri', example: 'https://example.com/cv/jane-doe-updated.pdf' },
                isCvPublic: { type: 'boolean', example: false }
              },
              description: 'Student profile data (all fields optional for PATCH)',
              example: {
                firstName: 'Jane',
                school: 'ENS Paris',
                skills: ['Python', 'SQL']
              }
            },
            {
              type: 'object',
              properties: {
                name: { type: 'string', minLength: 1, example: 'Global Innovations Inc.' },
                size: { type: 'string', example: '500-1000 employees' },
                sector: { type: 'string', example: 'AI Solutions' },
                contactEmail: { type: 'string', format: 'email', example: 'info@globalinnovations.com' },
                logoUrl: { type: ['string', 'null'], format: 'uri', example: 'https://example.com/global-logo-new.png' }
              },
              description: 'Company profile data (all fields optional for PATCH)',
              example: {
                sector: 'AI Solutions',
                contactEmail: 'info@globalinnovations.com'
              }
            }
          ]
        },
        response: {
          200: {
            description: 'Profile updated successfully',
            type: 'object',
            properties: {
              message: { type: 'string', example: 'Profile updated successfully' },
              profile: {
                type: 'object',
                // Assuming the structure is similar to the GET /profile response, can be refined.
                // For simplicity, we'll provide a generic object example here.
                example: {
                  id: 'clp_updated_profile_id',
                  userId: 'clp_updated_user_id',
                  email: 'updated.email@example.com',
                  role: 'STUDENT', // or COMPANY
                  // ... other updated profile fields based on role
                }
              }
            }
          },
          400: {
            description: 'Invalid input data',
            type: 'object',
            properties: { message: { type: 'string' } },
            example: { message: 'Invalid profile data for update' }
          },
          401: {
            description: 'Not authenticated',
            type: 'object',
            properties: { message: { type: 'string' } },
            example: { message: 'Unauthorized' }
          }
        }
      },
    },
    upsertProfile as any
  );
}

export default profileRoutes; 