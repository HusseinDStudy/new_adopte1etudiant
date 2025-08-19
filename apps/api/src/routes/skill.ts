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
          search: { type: 'string', description: 'Search skills by name', example: 'javascript' },
          limit: { type: 'integer', minimum: 1, maximum: 1000, default: 100, example: 50 },
          popular: { type: 'boolean', description: 'Get only popular/frequently used skills', example: true }
        },
        example: {
          search: 'react',
          limit: 20,
          popular: true
        }
      },
      response: {
        200: {
          description: 'List of skills',
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string', example: 'clp_skill_id_1' },
              name: { type: 'string', example: 'JavaScript' },
              category: { type: 'string', description: 'Skill category (e.g., Programming, Design, Marketing)', example: 'Programming' },
              usageCount: { type: 'integer', description: 'Number of times this skill is used', example: 1500 },
              createdAt: { type: 'string', format: 'date-time', example: '2023-01-01T00:00:00Z' }
            },
            example: {
              id: 'clp_skill_id_1',
              name: 'JavaScript',
              category: 'Programming',
              usageCount: 1500,
              createdAt: '2023-01-01T00:00:00Z'
            }
          },
          example: [
            {
              id: 'clp_skill_id_1',
              name: 'JavaScript',
              category: 'Programming',
              usageCount: 1500,
              createdAt: '2023-01-01T00:00:00Z'
            },
            {
              id: 'clp_skill_id_2',
              name: 'React',
              category: 'Programming',
              usageCount: 1200,
              createdAt: '2023-01-05T00:00:00Z'
            }
          ]
        },
        400: {
          description: 'Invalid query parameters',
          type: 'object',
          properties: { message: { type: 'string' } },
          example: { message: 'Invalid limit parameter' }
        }
      }
    }
  }, getAllSkills);
}

export default skillRoutes; 