import { FastifyInstance } from 'fastify';
import { listAvailableStudents, getStudentStats } from '../controllers/studentController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { roleMiddleware } from '../middleware/roleMiddleware.js';
import { optionalAuthMiddleware } from '../middleware/optionalAuthMiddleware.js';
import { Role } from '@prisma/client';

async function studentRoutes(server: FastifyInstance) {
  server.get(
    '/',
    {
      // Public endpoint: no auth required to view public student profiles
      preHandler: [optionalAuthMiddleware],
      schema: {
        description: 'Get list of available students (public). Only shows students who are open to opportunities and have public profiles.',
        tags: ['Students'],
        summary: 'List available students',
        security: [],
        querystring: {
          type: 'object',
          properties: {
            page: { type: 'integer', minimum: 1, default: 1, example: 1 },
            limit: { type: 'integer', minimum: 1, maximum: 100, default: 10, example: 5 },
            search: { type: 'string', description: 'Search in student names, school, or degree', example: 'John Doe' },
            skills: { type: 'string', description: 'Comma-separated list of skills to filter by', example: 'JavaScript,React' },
            school: { type: 'string', description: 'Filter by school name', example: 'University of Paris' },
            degree: { type: 'string', description: 'Filter by degree program', example: 'Computer Science' },
            isOpenToOpportunities: { type: 'boolean', description: 'Filter by availability status', example: true }
          },
          example: {
            page: 1,
            limit: 5,
            search: 'Marie Curie',
            skills: 'Physics,Chemistry',
            isOpenToOpportunities: true
          }
        },
        response: {
          200: {
            description: 'List of available students',
            type: 'array',
            items: {
              type: 'object',
              properties: {
                id: { type: 'string', example: 'clp_student_user_id_1' },
                profileId: { type: 'string', description: 'Student profile ID', example: 'clp_student_profile_id_1' },
                firstName: { type: 'string', example: 'Alice' },
                lastName: { type: 'string', example: 'Smith' },
                email: { type: 'string', format: 'email', example: 'alice.smith@example.com' },
                school: { type: 'string', example: 'University of Example' },
                degree: { type: 'string', example: 'Computer Science' },
                skills: { type: 'array', items: { type: 'string' }, example: ['JavaScript', 'Python', 'SQL'] },
                isOpenToOpportunities: { type: 'boolean', example: true },
                cvUrl: { type: 'string', format: 'uri', description: 'Only shown if CV is public', example: 'https://example.com/cv/alice.pdf' },
                isCvPublic: { type: 'boolean', example: true },
                user: {
                  type: 'object',
                  properties: {
                    email: { type: 'string', format: 'email', example: 'alice.smith@example.com' },
                    createdAt: { type: 'string', format: 'date-time', example: '2024-01-01T10:00:00Z' }
                  },
                  example: {
                    email: 'alice.smith@example.com',
                    createdAt: '2024-01-01T10:00:00Z'
                  }
                }
              },
              example: {
                id: 'clp_student_user_id_1',
                profileId: 'clp_student_profile_id_1',
                firstName: 'Alice',
                lastName: 'Smith',
                email: 'alice.smith@example.com',
                school: 'University of Example',
                degree: 'Computer Science',
                skills: ['JavaScript', 'Python', 'SQL'],
                isOpenToOpportunities: true,
                cvUrl: 'https://example.com/cv/alice.pdf',
                isCvPublic: true,
                user: {
                  email: 'alice.smith@example.com',
                  createdAt: '2024-01-01T10:00:00Z'
                }
              }
            },
            example: [
              {
                id: 'clp_student_user_id_1',
                profileId: 'clp_student_profile_id_1',
                firstName: 'Alice',
                lastName: 'Smith',
                email: 'alice.smith@example.com',
                school: 'University of Example',
                degree: 'Computer Science',
                skills: ['JavaScript', 'Python', 'SQL'],
                isOpenToOpportunities: true,
                cvUrl: 'https://example.com/cv/alice.pdf',
                isCvPublic: true,
                user: {
                  email: 'alice.smith@example.com',
                  createdAt: '2024-01-01T10:00:00Z'
                }
              },
              {
                id: 'clp_student_user_id_2',
                profileId: 'clp_student_profile_id_2',
                firstName: 'Bob',
                lastName: 'Johnson',
                email: 'bob.johnson@example.com',
                school: 'Tech Institute',
                degree: 'Software Engineering',
                skills: ['Java', 'Spring Boot', 'AWS'],
                isOpenToOpportunities: true,
                cvUrl: 'https://example.com/cv/bob.pdf',
                isCvPublic: false,
                user: {
                  email: 'bob.johnson@example.com',
                  createdAt: '2024-01-05T11:30:00Z'
                }
              }
            ]
          },
          401: {
            description: 'Not authenticated (if attempting to view private data)',
            type: 'object',
            properties: { message: { type: 'string' } },
            example: { message: 'Unauthorized' }
          },
          403: {
            description: 'Access denied (if attempting to filter by private data without company role)',
            type: 'object',
            properties: { message: { type: 'string' } },
            example: { message: 'Forbidden: You must be a company to filter by private student data' }
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
            totalApplications: { type: 'integer', example: 50 },
            applicationsByStatus: {
              type: 'object',
              additionalProperties: { type: 'integer' },
              example: { NEW: 20, SEEN: 15, INTERVIEW: 10, REJECTED: 3, HIRED: 2 }
            },
            adoptionRequestsReceived: { type: 'integer', example: 5 }
          },
          example: {
            totalApplications: 50,
            applicationsByStatus: { NEW: 20, SEEN: 15, INTERVIEW: 10, REJECTED: 3, HIRED: 2 },
            adoptionRequestsReceived: 5
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
          example: { message: 'Forbidden: Only students can view their own stats' }
        },
        404: {
          description: 'Student profile not found',
          type: 'object',
          properties: { message: { type: 'string' } },
          example: { message: 'Student profile not found for current user' }
        }
      }
    }
  }, getStudentStats);
}

export default studentRoutes;