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

export const getCompanyStats = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const userId = (request as any).user.id;
    const stats = await companyService.getCompanyStats(userId);
    return reply.send(stats);
  } catch (error) {
    console.error('Failed to get company stats:', error);
    if (error.message === 'Company profile not found') {
      return reply.code(404).send({ message: 'Company profile not found' });
    }
    return reply.code(500).send({ message: 'Internal Server Error' });
  }
};