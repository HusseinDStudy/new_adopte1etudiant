import { FastifyInstance } from 'fastify';
import { listAvailableStudents, getStudentStats } from '../controllers/studentController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { roleMiddleware } from '../middleware/roleMiddleware.js';
import { Role } from '@prisma/client';

async function studentRoutes(server: FastifyInstance) {
  server.get(
    '/',
    {
      preHandler: [authMiddleware, roleMiddleware([Role.COMPANY])],
      schema: {
        description: 'Get list of available students (Company only). Only shows students who are open to opportunities and have public profiles.',
        tags: ['Students'],
        summary: 'List available students',
        security: [{ cookieAuth: [] }],
        querystring: {
          type: 'object',
          properties: {
            page: { type: 'integer', minimum: 1, default: 1 },
            limit: { type: 'integer', minimum: 1, maximum: 100, default: 10 },
            search: { type: 'string', description: 'Search in student names, school, or degree' },
            skills: { type: 'string', description: 'Comma-separated list of skills to filter by' },
            school: { type: 'string', description: 'Filter by school name' },
            degree: { type: 'string', description: 'Filter by degree program' },
            isOpenToOpportunities: { type: 'boolean', description: 'Filter by availability status' }
          }
        },
        response: {
          200: {
            description: 'List of available students',
            type: 'array',
            items: {
              type: 'object',
              properties: {
                id: { type: 'string', description: 'User ID for adoption requests' },
                profileId: { type: 'string', description: 'Student profile ID' },
                firstName: { type: 'string' },
                lastName: { type: 'string' },
                email: { type: 'string', format: 'email' },
                school: { type: 'string' },
                degree: { type: 'string' },
                skills: { type: 'array', items: { type: 'string' } },
                isOpenToOpportunities: { type: 'boolean' },
                cvUrl: { type: 'string', format: 'uri', description: 'Only shown if CV is public' },
                isCvPublic: { type: 'boolean' },
                user: {
                  type: 'object',
                  properties: {
                    email: { type: 'string', format: 'email' },
                    createdAt: { type: 'string', format: 'date-time' }
                  }
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
    listAvailableStudents as any
  );

  // Student stats endpoint
  server.get('/stats', {
    preHandler: [authMiddleware, roleMiddleware([Role.STUDENT])],
    schema: {
      description: 'Get student statistics including applications and adoption requests',
      tags: ['Students'],
      summary: 'Get student stats',
      security: [{ cookieAuth: [] }],
      response: {
        200: {
          description: 'Student statistics',
          type: 'object',
          properties: {
            totalApplications: { type: 'integer' },
            applicationsByStatus: {
              type: 'object',
              additionalProperties: { type: 'integer' }
            },
            adoptionRequestsReceived: { type: 'integer' }
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
        },
        404: {
          description: 'Student profile not found',
          type: 'object',
          properties: { message: { type: 'string' } }
        }
      }
    }
  }, getStudentStats);
}

export default studentRoutes;