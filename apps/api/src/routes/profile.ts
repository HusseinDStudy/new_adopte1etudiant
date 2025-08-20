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
                  id: { type: 'string' },
                  userId: { type: 'string' },
                  role: { type: 'string', enum: ['STUDENT'] },
                  firstName: { type: 'string' },
                  lastName: { type: 'string' },
                  school: { type: ['string', 'null'] },
                  degree: { type: ['string', 'null'] },
                  skills: {
                    type: 'array',
                    items: { type: 'string' }
                  },
                  isOpenToOpportunities: { type: 'boolean' },
                  cvUrl: { type: ['string', 'null'], format: 'uri' },
                  isCvPublic: { type: 'boolean' },
                  email: { type: 'string', format: 'email' },
                  createdAt: { type: 'string', format: 'date-time' },
                  updatedAt: { type: 'string', format: 'date-time' }
                },
              },
              {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  userId: { type: 'string' },
                  role: { type: 'string', enum: ['COMPANY'] },
                  name: { type: 'string' },
                  size: { type: ['string', 'null'] },
                  sector: { type: ['string', 'null'] },
                  contactEmail: { type: 'string', format: 'email' },
                  logoUrl: { type: ['string', 'null'], format: 'uri' },
                  email: { type: 'string', format: 'email' },
                  createdAt: { type: 'string', format: 'date-time' },
                  updatedAt: { type: 'string', format: 'date-time' }
                },
              }
            ]
              }
            ]
          },
          401: {
            description: 'Not authenticated',
            type: 'object',
            properties: { message: { type: 'string' } }
          },
          404: {
            description: 'Profile not found',
            type: 'object',
            properties: { message: { type: 'string' } }
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
                firstName: { type: 'string', minLength: 1 },
                lastName: { type: 'string', minLength: 1 },
                school: { type: 'string' },
                degree: { type: 'string' },
                skills: { type: 'array', items: { type: 'string' } },
                isOpenToOpportunities: { type: 'boolean' },
                cvUrl: {
                  anyOf: [
                    { type: 'string', format: 'uri' },
                    { type: 'string', maxLength: 0 }
                  ]
                },
                isCvPublic: { type: 'boolean' }
              },
              required: ['firstName', 'lastName'],
              description: 'Student profile data'
            },
            {
              type: 'object',
              properties: {
                name: { type: 'string', minLength: 1 },
                size: { type: 'string' },
                sector: { type: 'string' },
                contactEmail: { type: 'string', format: 'email' },
                logoUrl: { type: ['string', 'null'], format: 'uri' }
              },
              required: ['name', 'contactEmail'],
              description: 'Company profile data'
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
                  id: { type: 'string' },
                  userId: { type: 'string' },
                  role: { type: 'string', enum: ['STUDENT'] },
                  firstName: { type: 'string' },
                  lastName: { type: 'string' },
                  school: { type: ['string', 'null'] },
                  degree: { type: ['string', 'null'] },
                  skills: { type: 'array', items: { type: 'string' } },
                  isOpenToOpportunities: { type: 'boolean' },
                  isCvPublic: { type: 'boolean' },
                  cvUrl: { type: ['string', 'null'], format: 'uri' },
                  email: { type: 'string', format: 'email' }
                },
                description: 'Student profile'
              },
              {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  userId: { type: 'string' },
                  role: { type: 'string', enum: ['COMPANY'] },
                  name: { type: 'string' },
                  size: { type: 'string' },
                  sector: { type: 'string' },
                  contactEmail: { type: 'string', format: 'email' },
                  logoUrl: { type: ['string', 'null'], format: 'uri' },
                  email: { type: 'string', format: 'email' }
                },
                description: 'Company profile'
              }
            ]
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
                firstName: { type: 'string', minLength: 1 },
                lastName: { type: 'string', minLength: 1 },
                school: { type: 'string' },
                degree: { type: 'string' },
                skills: { type: 'array', items: { type: 'string' } },
                isOpenToOpportunities: { type: 'boolean' },
                cvUrl: { type: 'string', format: 'uri' },
                isCvPublic: { type: 'boolean' }
              },
              description: 'Student profile data (all fields optional for PATCH)'
            },
            {
              type: 'object',
              properties: {
                name: { type: 'string', minLength: 1 },
                size: { type: 'string' },
                sector: { type: 'string' },
                contactEmail: { type: 'string', format: 'email' },
                logoUrl: { type: ['string', 'null'], format: 'uri' }
              },
              description: 'Company profile data (all fields optional for PATCH)'
            }
          ]
        },
        response: {
          200: {
            description: 'Profile updated successfully',
            type: 'object',
            properties: {
              message: { type: 'string' },
              profile: {
                type: 'object'
                // Assuming the structure is similar to the GET /profile response, can be refined.
                // For simplicity, we'll provide a generic object example here.
              }
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
          }
        }
      },
    },
    upsertProfile as any
  );
}

export default profileRoutes; 