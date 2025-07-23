import { FastifyRequest, FastifyReply } from 'fastify';
import { CompanyService } from '../services/CompanyService.js';

const companyService = new CompanyService();

export const getCompaniesWithOffers = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const companies = await companyService.getCompaniesWithOffers();
    return reply.send(companies);
  } catch (error) {
    console.error('Failed to get companies:', error);
    return reply.code(500).send({ message: 'Internal Server Error' });
  }
};