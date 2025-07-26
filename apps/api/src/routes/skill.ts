import { FastifyInstance } from 'fastify';
import { getAllSkills } from '../controllers/skillController.js';

async function skillRoutes(server: FastifyInstance) {
  server.get('/', {
    schema: {
      description: 'Get list of all available skills. Public endpoint used for autocomplete and filtering.',
      tags: ['Skills'],
      summary: 'List all skills',
      querystring: {
        type: 'object',
        properties: {
          search: { type: 'string', description: 'Search skills by name' },
          limit: { type: 'integer', minimum: 1, maximum: 1000, default: 100 },
          popular: { type: 'boolean', description: 'Get only popular/frequently used skills' }
        }
      },
      response: {
        200: {
          description: 'List of skills',
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              name: { type: 'string' },
              category: { type: 'string', description: 'Skill category (e.g., Programming, Design, Marketing)' },
              usageCount: { type: 'integer', description: 'Number of times this skill is used' },
              createdAt: { type: 'string', format: 'date-time' }
            }
          }
        },
        400: {
          description: 'Invalid query parameters',
          type: 'object',
          properties: { message: { type: 'string' } }
        }
      }
    }
  }, getAllSkills);
}

export default skillRoutes; 