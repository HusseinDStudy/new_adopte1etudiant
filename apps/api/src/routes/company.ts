import { FastifyInstance } from 'fastify';
import { getCompaniesWithOffers } from '../controllers/companyController.js';

async function companyRoutes(server: FastifyInstance) {
  server.get('/', getCompaniesWithOffers);
}

export default companyRoutes; 