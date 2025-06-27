import { FastifyInstance } from 'fastify';
import { getAllSkills } from '../controllers/skillController';

async function skillRoutes(server: FastifyInstance) {
  server.get('/', getAllSkills);
}

export default skillRoutes; 